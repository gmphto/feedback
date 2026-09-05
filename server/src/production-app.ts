import { buildApp } from './app.js';
import { createDatabase, createDatabaseReadiness } from './db/database.js';
import { readDatabaseConfiguration } from './db/configuration.js';
import { readAuthConfiguration, type AuthEnvironment } from './auth/configuration.js';
import { createAuthRepository } from './auth/repository.js';
import { createOidcProvider } from './auth/oidc.js';
import type { AuthDependencies } from './auth/service.js';

export function buildProductionApp(databaseUrl: string | undefined, environment: AuthEnvironment = process.env) {
  const readiness = createDatabaseReadiness(databaseUrl);
  const configuration = readAuthConfiguration(environment);
  const databaseConfiguration = readDatabaseConfiguration(databaseUrl);
  let db: ReturnType<typeof createDatabase> | undefined;
  let auth: AuthDependencies | undefined;
  try {
    if (configuration.available && databaseConfiguration.valid) {
      db = createDatabase(databaseConfiguration.connectionString);
      auth = { configuration: configuration.configuration, repository: createAuthRepository(db), provider: createOidcProvider(configuration.configuration) };
    }
  } catch { /* Invalid driver-specific settings leave authentication unavailable. */ }
  const app = buildApp({ readinessCheck: readiness.check, auth });
  app.addHook('onClose', readiness.close);
  app.addHook('onClose', async () => { await db?.destroy(); });
  return app;
}
