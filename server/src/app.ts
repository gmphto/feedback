import Fastify, { LogController } from 'fastify';

import { getReadiness } from './readiness.js';
import type { ReadinessCheck } from './readiness.js';
import { registerAuth } from './auth/routes.js';
import type { AuthDependencies } from './auth/service.js';
import { registerProjectRoutes } from './projects/routes.js';
import type { ProjectModule } from './projects/module.js';
import { handleProjectRouterError } from './projects/router-errors.js';

export function buildApp(options: { readinessCheck?: ReadinessCheck; auth?: AuthDependencies; projects?: ProjectModule; logStream?: { write(message: string): void } } = {}) {
  // Framework request/error logs may include callback query strings and provider
  // payloads. Emit only registered route names and status codes at this boundary.
  const app = Fastify({
    logger: options.logStream ? { stream: options.logStream } : true,
    logController: new LogController({ disableRequestLogging: true }),
    ajv: { customOptions: { removeAdditional: false, coerceTypes: false } },
    frameworkErrors: (error, request, reply) => handleProjectRouterError(error, request, reply, options.auth),
  });
  app.addHook('onResponse', async (request, reply) => {
    request.log.info({ route: request.routeOptions.url ?? 'unmatched', statusCode: reply.statusCode }, 'request completed');
  });
  app.register(async scoped => {
    await registerAuth(scoped, options.auth);
    scoped.register(async projectRoutes => { await registerProjectRoutes(projectRoutes, options.auth, options.projects); });
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
