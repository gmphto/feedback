import { sql } from 'kysely';
import { migrationProvider } from '../../src/db/migrations.js';
import { runMigrations } from '../../src/db/migrate.js';

process.exitCode = await runMigrations(process.env.DATABASE_URL, {
  async getMigrations() {
    return {
      ...await migrationProvider.getMigrations(),
      '0002_failure': {
        async up(db) {
          await sql`create table rollback_probe (id integer)`.execute(db);
          throw new Error('secret=must-never-appear');
        },
      },
    };
  },
});
