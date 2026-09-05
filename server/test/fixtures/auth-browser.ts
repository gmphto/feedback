// Explicit test-only browser harness. Never imported by production code.
import { randomBytes } from 'node:crypto';
import { sql } from 'kysely';
import { createDatabase } from '../../src/db/database.js';
import { readDatabaseConfiguration } from '../../src/db/configuration.js';
import { runMigrations } from '../../src/db/migrate.js';
import { createAuthRepository } from '../../src/auth/repository.js';
import { buildApp } from '../../src/app.js';
import { fakeProvider, type ProviderMode } from '../support/oidc-provider.js';

const configuration = readDatabaseConfiguration(process.env.TEST_DATABASE_URL, 'TEST_DATABASE_URL');
if (!configuration.valid) throw new Error(configuration.message);
const cleanups: (() => void | Promise<void>)[] = [];
let stopping = false;
async function stop() {
  if (stopping) return; stopping = true;
  for (const cleanup of cleanups.reverse()) await cleanup();
}
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => { void stop(); });
try {
  const admin = createDatabase(configuration.connectionString);
  cleanups.push(() => admin.destroy());
  const name = `scope_test_browser_${Date.now()}_${randomBytes(6).toString('hex')}`;
  let created = false;
  cleanups.push(async () => { if (created) await sql`drop database ${sql.id(name)}`.execute(admin); });
  await sql`create database ${sql.id(name)}`.execute(admin); created = true;
  const url = new URL(configuration.connectionString); url.pathname = `/${name}`;
  if (await runMigrations(url.href) !== 0) throw new Error('Test migration failed');
  const db = createDatabase(url.href); cleanups.push(() => db.destroy());
  const provider = await fakeProvider({ after(cleanup) { cleanups.push(cleanup); } });
  const app = buildApp({ auth: { configuration: provider.config, provider: provider.provider, repository: createAuthRepository(db) } });
  cleanups.push(() => app.close());
  app.get<{ Querystring: { mode?: string } }>('/api/test/provider-mode', async request => {
    const modes: ProviderMode[] = ['valid', 'cancel', 'failure', 'signature', 'issuer', 'audience', 'expiry', 'nonce', 'future', 'missing-token'];
    if (modes.includes(request.query.mode as ProviderMode)) provider.fixture.mode = request.query.mode as ProviderMode;
    return { mode: provider.fixture.mode };
  });
  // Visible pending states support keyboard/cancellation inspection.
  app.addHook('onRequest', async () => { await new Promise(resolve => setTimeout(resolve, 300)); });
  await app.listen({ host: '127.0.0.1', port: Number(process.env.PORT ?? '3000') });
  console.log('Test-only authentication harness ready. Run the Vite client and open http://127.0.0.1:5173. Ctrl+C cleans up the run-owned database.');
} catch {
  console.error('Authentication browser harness failed; verify test database and port configuration.');
  await stop(); process.exitCode = 1;
}
