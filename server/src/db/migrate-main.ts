import { runMigrations } from './migrate.js';

process.exitCode = await runMigrations(process.env.DATABASE_URL);
