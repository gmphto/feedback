import { Migrator, type MigrationProvider } from 'kysely/migration';
import { readDatabaseConfiguration } from './configuration.js';
import { createDatabase } from './database.js';
import { migrationProvider } from './migrations.js';

export async function runMigrations(
  value: string | undefined,
  provider: MigrationProvider = migrationProvider,
): Promise<number> {
  const config = readDatabaseConfiguration(value);
  if (!config.valid) {
    console.error(config.message);
    return 1;
  }
  let db: ReturnType<typeof createDatabase> | undefined;
  try {
    db = createDatabase(config.connectionString);
    const { error, results } = await new Migrator({ db, provider, migrationTableSchema: 'public' }).migrateToLatest();
    if (error) {
      console.error('Database migration failed; verify connectivity, permissions, and migration validity. No failed migration was committed.');
      return 1;
    }
    console.log(`Database migrations complete: ${results?.length ?? 0} applied.`);
    return 0;
  } catch {
    console.error('Database migration failed; verify connectivity, permissions, and migration validity.');
    return 1;
  } finally {
    await db?.destroy();
  }
}
