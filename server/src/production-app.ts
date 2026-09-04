import { buildApp } from './app.js';
import { createDatabaseReadiness } from './db/database.js';

export function buildProductionApp(databaseUrl: string | undefined) {
  const readiness = createDatabaseReadiness(databaseUrl);
  const app = buildApp({ readinessCheck: readiness.check });
  app.addHook('onClose', readiness.close);
  return app;
}
