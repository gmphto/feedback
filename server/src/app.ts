import Fastify, { LogController } from 'fastify';

import { getReadiness } from './readiness.js';
import type { ReadinessCheck } from './readiness.js';

export function buildApp(options: { readinessCheck?: ReadinessCheck; logStream?: { write(message: string): void } } = {}) {
  // Framework request/error logs may include callback query strings and provider
  // payloads. Emit only registered route names and status codes at this boundary.
  const app = Fastify({
    logger: options.logStream ? { stream: options.logStream } : true,
    logController: new LogController({ disableRequestLogging: true }),
  });
  app.addHook('onResponse', async (request, reply) => {
    request.log.info({ route: request.routeOptions.url ?? 'unmatched', statusCode: reply.statusCode }, 'request completed');
  });

  app.get('/api/ready', {
    schema: {
      response: {
        200: {
          type: 'object',
          required: ['status'],
          additionalProperties: false,
          properties: { status: { type: 'string', const: 'ready' } },
        },
        503: {
          type: 'object',
          required: ['status'],
          additionalProperties: false,
          properties: { status: { type: 'string', const: 'not_ready' } },
        },
      },
    },
  }, async (_request, reply) => {
    const status = await getReadiness(options.readinessCheck);
    return reply.code(status === 'ready' ? 200 : 503).send({ status });
  });

  return app;
}
