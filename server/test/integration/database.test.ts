import { createServer, type Socket } from 'node:net';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { test, type TestContext } from 'node:test';
import { sql } from 'kysely';
import { createDatabase } from '../../src/db/database.js';
import { readDatabaseConfiguration } from '../../src/db/configuration.js';
import { migrationProvider } from '../../src/db/migrations.js';
import { buildProductionApp } from '../../src/production-app.js';

const config = readDatabaseConfiguration(process.env.TEST_DATABASE_URL, 'TEST_DATABASE_URL');
if (!config.valid) throw new Error(config.message);
const testUrl = config.connectionString;

async function isolated(t: TestContext) {
  const admin = createDatabase(testUrl);
  const name = `scope_test_${Date.now()}_${randomBytes(6).toString('hex')}`;
  let created = false;
  let db: ReturnType<typeof createDatabase> | undefined;
  t.after(async () => {
    await db?.destroy();
    try {
      // Only our successfully created, unique database can reach this cleanup.
      if (created) await sql`drop database ${sql.id(name)}`.execute(admin);
    } finally { await admin.destroy(); }
  });
  await sql`create database ${sql.id(name)}`.execute(admin);
  created = true;
  const url = new URL(testUrl);
  url.pathname = `/${name}`;
  db = createDatabase(url.href);
  return { db, url: url.href };
}

async function command(url: string | undefined, fixture = false) {
  const env = { ...process.env };
  if (url === undefined) delete env.DATABASE_URL;
  else env.DATABASE_URL = url;
  const child = spawn(process.execPath, ['--import', 'tsx', fixture ? 'test/fixtures/failing-migration.ts' : 'src/db/migrate-main.ts'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  child.stdout.on('data', data => { output += data; });
  child.stderr.on('data', data => { output += data; });
  const timeout = setTimeout(() => child.kill(), 15_000);
  try {
    const [code, signal] = await once(child, 'close');
    assert.equal(signal, null, `Migration timed out: ${output}`);
    return { code, output };
  } finally { clearTimeout(timeout); }
}

async function history(db: ReturnType<typeof createDatabase>) {
  return (await sql<{ name: string; timestamp: string }>`select name, timestamp from public.kysely_migration order by name`.execute(db)).rows;
}

function responseShape(response: {statusCode: number; headers: Record<string, unknown>; body: string}, ready: boolean) {
  assert.equal(response.statusCode, ready ? 200 : 503);
  assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
  assert.deepEqual(JSON.parse(response.body), { status: ready ? 'ready' : 'not_ready' });
}

test('empty database migrates once, records only metadata, and readiness recovers without restart', async t => {
  const { db, url } = await isolated(t);
  const app = buildProductionApp(url);
  try {
    responseShape(await app.inject('/api/ready'), false);
    assert.equal((await sql`select tablename from pg_tables where schemaname='public'`.execute(db)).rows.length, 0);
    assert.equal((await command(url)).code, 0);
    const initial = await history(db);
    assert.deepEqual(initial.map(row => row.name), Object.keys(await migrationProvider.getMigrations()));
    const tables = (await sql<{ tablename: string }>`select tablename from pg_tables where schemaname='public' order by tablename`.execute(db)).rows.map(row => row.tablename);
    assert.deepEqual(tables, ['kysely_migration', 'kysely_migration_lock']);
    responseShape(await app.inject('/api/ready'), true);
    assert.equal((await command(url)).code, 0);
    assert.deepEqual(await history(db), initial);
  } finally { await app.close(); }
});

test('failed migration rolls back its table and migration history and exits nonzero', async t => {
  const { db, url } = await isolated(t);
  assert.equal((await command(url)).code, 0);
  const before = await history(db);
  const result = await command(url, true);
  assert.equal(result.code, 1);
  assert.match(result.output, /Database migration failed/);
  assert.doesNotMatch(result.output, /must-never-appear|postgresql:\/\//);
  assert.deepEqual(await history(db), before);
  assert.equal((await sql`select tablename from pg_tables where schemaname='public' and tablename='rollback_probe'`.execute(db)).rows.length, 0);
});

test('concurrent migration processes preserve a single migration record', async t => {
  const { db, url } = await isolated(t);
  const results = await Promise.all([command(url), command(url)]);
  assert.ok(results.some(result => result.code === 0));
  for (const result of results) {
    if (result.code !== 0) assert.match(result.output, /Database migration failed/);
  }
  assert.deepEqual((await history(db)).map(row => row.name), Object.keys(await migrationProvider.getMigrations()));
});

test('missing, invalid and unavailable configuration fails commands and gives sanitized public readiness', async () => {
  for (const url of [undefined, 'https://user:secret@private/app', 'postgresql://user:secret@127.0.0.1:1/unavailable']) {
    const result = await command(url);
    assert.equal(result.code, 1);
    assert.match(result.output, /DATABASE_URL|Database migration failed/);
    assert.doesNotMatch(result.output, /secret|ECONNREFUSED|postgresql:\/\//);
    const app = buildProductionApp(url);
    try { responseShape(await app.inject('/api/ready'), false); }
    finally { await app.close(); }
  }
});


test('a connection that never completes PostgreSQL negotiation is bounded and released', async t => {
  const sockets = new Set<Socket>();
  const server = createServer(socket => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  });
  t.after(async () => {
    for (const socket of sockets) socket.destroy();
    await new Promise<void>(resolve => server.close(() => resolve()));
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const url = `postgresql://test:secret@127.0.0.1:${address.port}/test`;
  const start = Date.now();
  const result = await command(url);
  assert.equal(result.code, 1);
  assert.doesNotMatch(result.output, /secret|postgresql:\/\//);
  assert.ok(Date.now() - start < 10_000, 'migration connection timeout must be finite');
  const app = buildProductionApp(url);
  try {
    const checkStart = Date.now();
    responseShape(await app.inject('/api/ready'), false);
    assert.ok(Date.now() - checkStart < 8_000, 'readiness connection timeout must be finite');
  } finally { await app.close(); }
});
