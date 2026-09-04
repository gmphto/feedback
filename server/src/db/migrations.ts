import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { FileMigrationProvider } from 'kysely/migration';

export const migrationProvider = new FileMigrationProvider({
  fs,
  path,
  migrationFolder: fileURLToPath(new URL('./migrations/', import.meta.url)),
  import: file => import(pathToFileURL(file).href),
});
