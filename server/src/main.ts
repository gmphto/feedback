import { buildProductionApp } from './production-app.js';

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}
const app = buildProductionApp(process.env.DATABASE_URL);
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, async () => { await app.close(); });
}
try {
  await app.listen({ host: '0.0.0.0', port });
} catch {
  console.error('Server could not start; verify the configured port is available.');
  await app.close();
  process.exitCode = 1;
}
