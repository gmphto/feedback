import { randomBytes } from 'node:crypto';
import type { TestContext } from 'node:test';
import { sql } from 'kysely';
import { createDatabase } from '../../src/db/database.js';
import { readDatabaseConfiguration } from '../../src/db/configuration.js';

const config = readDatabaseConfiguration(process.env.TEST_DATABASE_URL, 'TEST_DATABASE_URL');
if (!config.valid) throw new Error(config.message);
const testUrl = config.connectionString;

export async function isolated(t: TestContext) {
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
