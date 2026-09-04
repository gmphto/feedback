import { Kysely, PostgresDialect, sql } from 'kysely';
import pg from 'pg';

import { DATABASE_TIMEOUT_MS, readDatabaseConfiguration } from './configuration.js';
import { migrationProvider } from './migrations.js';

export function createDatabase(connectionString: string) {
  const pool = new pg.Pool({
    connectionString,
    max: 5,
    connectionTimeoutMillis: DATABASE_TIMEOUT_MS,
    statement_timeout: DATABASE_TIMEOUT_MS,
    query_timeout: DATABASE_TIMEOUT_MS + 1_000,
    idleTimeoutMillis: DATABASE_TIMEOUT_MS,
  });
  // Idle connection failures must not crash the application or expose driver details.
  pool.on('error', () => {});
  return new Kysely<Record<string, never>>({ dialect: new PostgresDialect({ pool }) });
}

export function createDatabaseReadiness(value: string | undefined) {
  const config = readDatabaseConfiguration(value);
  let db: ReturnType<typeof createDatabase> | undefined;
  try { db = config.valid ? createDatabase(config.connectionString) : undefined; }
  catch { /* Invalid driver-specific settings are unavailable readiness. */ }
  return {
    async check(): Promise<boolean> {
      if (!db) return false;
      try {
        const required = Object.keys(await migrationProvider.getMigrations());
        const { rows } = await sql<{ name: string }>`select name from public.kysely_migration`.execute(db);
        const applied = new Set(rows.map(row => row.name));
        return required.every(name => applied.has(name));
      } catch {
        return false;
      }
    },
    async close(): Promise<void> { await db?.destroy(); },
  };
}
