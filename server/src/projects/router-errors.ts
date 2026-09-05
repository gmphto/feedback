import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { requireBrowserOrigin, requireSession } from '../auth/routes.js';
import type { AuthDependencies } from '../auth/service.js';

export function handleProjectRouterError(error: FastifyError, request: FastifyRequest, reply: FastifyReply, auth?: AuthDependencies): void {
  // Fastify does not await this callback. Contain rejected effects and response
  // failures here without logging raw routing data.
  void respondToRouterError(error, request, reply, auth).catch(() => {
    try { if (!reply.sent) reply.code(503).send({ error: 'project_unavailable' }); }
    catch { reply.raw.destroy(); }
  });
}

async function respondToRouterError(error: FastifyError, request: FastifyRequest, reply: FastifyReply, auth?: AuthDependencies) {
  const projectPath = request.url === '/api/projects' || request.url.startsWith('/api/projects/');
  if (!projectPath || !['FST_ERR_BAD_URL', 'FST_ERR_MAX_PARAM_LENGTH'].includes(error.code)) {
    return reply.send(error);
  }
  // Fastify invokes this before route onRequest/schema hooks. Keep the same
  // Origin → session → resource-validation ordering without reflecting the URL.
  reply.header('cache-control', 'no-store');
  if (!requireBrowserOrigin(request, reply, auth)) return reply;
  const actor = await requireSession(request, reply, auth);
  if (actor) return reply.code(400).send({ error: 'invalid_request' });
}
