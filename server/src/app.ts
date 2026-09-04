import Fastify from 'fastify';

import { getReadiness } from './readiness.js';
import type { ReadinessCheck } from './readiness.js';

export function buildApp(options: { readinessCheck?: ReadinessCheck } = {}) {
  const app = Fastify({ logger: true });

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
