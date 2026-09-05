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
import { createAuthRepository, identifierDigest, opaqueIdentifier } from '../../src/auth/repository.js';
import { LOGIN_LIFETIME_MS, SESSION_LIFETIME_MS } from '../../src/auth/policy.js';

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

test('empty database migrates once, creates expected tables, and readiness recovers without restart', async t => {
  const { db, url } = await isolated(t);
  const app = buildProductionApp(url);
  try {
    responseShape(await app.inject('/api/ready'), false);
    assert.equal((await sql`select tablename from pg_tables where schemaname='public'`.execute(db)).rows.length, 0);
    assert.equal((await command(url)).code, 0);
    const initial = await history(db);
    assert.deepEqual(initial.map(row => row.name), Object.keys(await migrationProvider.getMigrations()));
    const tables = (await sql<{ tablename: string }>`select tablename from pg_tables where schemaname='public' order by tablename`.execute(db)).rows.map(row => row.tablename);
    assert.deepEqual(tables, ['application_sessions', 'kysely_migration', 'kysely_migration_lock', 'login_transactions', 'users']);
    responseShape(await app.inject('/api/ready'), true);
    assert.equal((await command(url)).code, 0);
    assert.deepEqual(await history(db), initial);
  } finally { await app.close(); }
});

test('concurrent verified identities share an integer user and persist only session digests', async t => {
  const { db, url } = await isolated(t);
  assert.equal((await command(url)).code, 0);
  const now = new Date('2026-09-05T12:00:00Z');
  const repository = createAuthRepository(db, () => now);
  const sessions = await Promise.all(Array.from({ length: 8 }, () => repository.createSession({ issuer: 'https://identity.example/', subject: 'alice' })));
  assert.ok(Number.isInteger(sessions[0]!.user.id));
  assert.equal(new Set(sessions.map(session => session.user.id)).size, 1);
  assert.equal(new Set(sessions.map(session => session.identifier)).size, 8);
  const rows = (await sql<{ digest: string; expires_at: Date; revoked_at: Date | null }>`select * from application_sessions`.execute(db)).rows;
  assert.equal(rows.length, 8);
  assert.deepEqual(new Set(rows.map(row => row.digest)), new Set(sessions.map(session => identifierDigest(session.identifier))));
  for (const row of rows) {
    assert.equal(row.expires_at.getTime(), now.getTime() + SESSION_LIFETIME_MS);
    assert.equal(row.revoked_at, null);
    for (const session of sessions) assert.ok(!JSON.stringify(row).includes(session.identifier));
  }
  const otherIssuer = await repository.createSession({ issuer: 'https://other.example/', subject: 'alice' });
  assert.notEqual(otherIssuer.user.id, sessions[0]!.user.id);
});

test('sessions have fixed absolute expiry and revoked cookies cannot be replayed', async t => {
  const { db, url } = await isolated(t);
  assert.equal((await command(url)).code, 0);
  let now = new Date('2026-09-05T12:00:00Z');
  const repository = createAuthRepository(db, () => now);
  const session = await repository.createSession({ issuer: 'https://identity.example/', subject: 'alice' });
  for (const invalid of [undefined, '', 'malformed', opaqueIdentifier()]) assert.equal(await repository.findSession(invalid), undefined);
  now = new Date(session.expiresAt.getTime() - 1);
  assert.deepEqual(await repository.findSession(session.identifier), session.user);
  now = session.expiresAt;
  assert.equal(await repository.findSession(session.identifier), undefined);
  const fresh = await repository.createSession({ issuer: 'https://identity.example/', subject: 'alice' });
  await repository.revokeSession(fresh.identifier);
  await repository.revokeSession(fresh.identifier);
  await repository.revokeSession(undefined);
  assert.equal(await repository.findSession(fresh.identifier), undefined);
});

test('login transactions bind the browser, expire at the boundary, and are consumed exactly once', async t => {
  const { db, url } = await isolated(t);
  assert.equal((await command(url)).code, 0);
  let now = new Date('2026-09-05T12:00:00Z');
  const repository = createAuthRepository(db, () => now);
  const browser = opaqueIdentifier();
  const login = await repository.startLogin(browser, 'nonce', 'pkce-verifier', '//unsafe.example');
  assert.equal(login.expiresAt.getTime(), now.getTime() + LOGIN_LIFETIME_MS);
  assert.equal(await repository.consumeLogin(login.state, opaqueIdentifier()), undefined);
  assert.equal(await repository.consumeLogin('malformed', browser), undefined);
  const attempts = await Promise.all(Array.from({ length: 8 }, () => repository.consumeLogin(login.state, browser)));
  assert.deepEqual(attempts.filter(Boolean), [{ nonce: 'nonce', verifier: 'pkce-verifier', returnPath: '/' }]);
  assert.equal(await repository.consumeLogin(login.state, browser), undefined);
  const expired = await repository.startLogin(browser, 'nonce', 'verifier', '/projects');
  now = expired.expiresAt;
  assert.equal(await repository.consumeLogin(expired.state, browser), undefined);
  assert.equal((await sql`select * from application_sessions`.execute(db)).rows.length, 0);
});

test('session persistence failure rolls back the new local identity and returns no session', async t => {
  const { db, url } = await isolated(t);
  assert.equal((await command(url)).code, 0);
  const repository = createAuthRepository(db);
  await sql`alter table application_sessions add constraint simulate_unavailable check (false)`.execute(db);
  await assert.rejects(repository.createSession({ issuer: 'https://identity.example/', subject: 'alice' }));
  assert.equal((await sql`select * from users`.execute(db)).rows.length, 0);
  assert.equal((await sql`select * from application_sessions`.execute(db)).rows.length, 0);
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
