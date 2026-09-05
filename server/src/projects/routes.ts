import type { FastifyError, FastifyInstance, FastifyRequest } from 'fastify';
import { requireSession } from '../auth/routes.js';
import type { AuthDependencies } from '../auth/service.js';
import type { ProjectActor, ProjectModule } from './module.js';
import { expectedVersion, pathIdentifier, projectListOptions, projectName } from './policy.js';

const error = (name: string) => ({ type: 'object', additionalProperties: false, required: ['error'], properties: { error: { type: 'string', const: name } } });
const project = { type: 'object', additionalProperties: false, required: ['id', 'name', 'version'], properties: { id: { type: 'integer' }, name: { type: 'string' }, version: { type: 'integer' } } };
const envelope = { type: 'object', additionalProperties: false, required: ['project'], properties: { project } };
const errors = { 400: error('invalid_request'), 404: error('not_found') };
const params = (...keys: string[]) => ({ type: 'object', required: keys, additionalProperties: false, properties: Object.fromEntries(keys.map(key => [key, { type: 'string' }])) });

export async function registerProjectRoutes(app: FastifyInstance, auth?: AuthDependencies, projects?: ProjectModule) {
  const actors = new WeakMap<FastifyRequest, ProjectActor>();
  app.addHook('onRequest', async (request, reply) => {
    reply.header('cache-control', 'no-store');
    const actor = await requireSession(request, reply, auth);
    if (actor) actors.set(request, actor);
  });
  app.setErrorHandler<FastifyError>((failure, _request, reply) => {
    if (failure.validation || (failure.statusCode && failure.statusCode >= 400 && failure.statusCode < 500)) {
      return reply.code(400).send({ error: 'invalid_request' });
    }
    return reply.code(503).send({ error: 'project_unavailable' });
  });
  function module() { if (!projects) throw new Error('Unavailable project service'); return projects; }

  app.get<{ Querystring: Record<string, unknown> }>('/api/projects', {
    schema: { querystring: { type: 'object', additionalProperties: false, properties: { name: { type: 'string' }, limit: { type: 'string' }, offset: { type: 'string' } } },
      response: { 200: { type: 'object', additionalProperties: false, required: ['projects'], properties: { projects: { type: 'array', items: project } } }, ...errors } },
  }, async (request, reply) => {
    const options = projectListOptions(request.query);
    if (!options) return reply.code(400).send({ error: 'invalid_request' });
    return { projects: await module().listProjects(actors.get(request)!, options) };
  });
  app.get<{ Params: { projectId: string } }>('/api/projects/:projectId', {
    schema: { params: params('projectId'), response: { 200: envelope, ...errors } },
  }, async (request, reply) => {
    const id = pathIdentifier(request.params.projectId);
    if (!id) return reply.code(400).send({ error: 'invalid_request' });
    const project = await module().readProject(actors.get(request)!, id);
    return project ? { project } : reply.code(404).send({ error: 'not_found' });
  });
  app.patch<{ Params: { projectId: string }; Body: { name: string; expectedVersion: number } }>('/api/projects/:projectId', {
    schema: { params: params('projectId'), body: { type: 'object', additionalProperties: false, required: ['name', 'expectedVersion'], properties: { name: { type: 'string' }, expectedVersion: { type: 'integer' } } },
      response: { 200: envelope, ...errors, 409: { type: 'object', additionalProperties: false, required: ['error', 'project'], properties: { error: { type: 'string', const: 'conflict' }, project } } } },
  }, async (request, reply) => {
    const id = pathIdentifier(request.params.projectId);
    const name = projectName(request.body.name);
    const version = expectedVersion(request.body.expectedVersion);
    if (!id || !name || !version) return reply.code(400).send({ error: 'invalid_request' });
    const result = await module().renameProject(actors.get(request)!, id, name, version);
    if (result.outcome === 'not_found') return reply.code(404).send({ error: 'not_found' });
    if (result.outcome === 'conflict') return reply.code(409).send({ error: 'conflict', project: result.project });
    return { project: result.project };
  });
  app.get<{ Params: { projectId: string; featureAreaId: string } }>('/api/projects/:projectId/feature-areas/:featureAreaId', {
    schema: { params: params('projectId', 'featureAreaId'), response: { ...errors, 200: {
      type: 'object', additionalProperties: false, required: ['featureArea'], properties: { featureArea: { type: 'object', additionalProperties: false, required: ['id', 'projectId'], properties: { id: { type: 'integer' }, projectId: { type: 'integer' } } } },
    } } },
  }, async (request, reply) => {
    const projectId = pathIdentifier(request.params.projectId); const areaId = pathIdentifier(request.params.featureAreaId);
    if (!projectId || !areaId) return reply.code(400).send({ error: 'invalid_request' });
    const featureArea = await module().readFeatureArea(actors.get(request)!, projectId, areaId);
    return featureArea ? { featureArea } : reply.code(404).send({ error: 'not_found' });
  });
  app.get<{ Params: { projectId: string; featureAreaId: string; featureId: string } }>('/api/projects/:projectId/feature-areas/:featureAreaId/features/:featureId', {
    schema: { params: params('projectId', 'featureAreaId', 'featureId'), response: { ...errors, 200: {
      type: 'object', additionalProperties: false, required: ['feature'], properties: { feature: { type: 'object', additionalProperties: false, required: ['id', 'featureAreaId'], properties: { id: { type: 'integer' }, featureAreaId: { type: 'integer' } } } },
    } } },
  }, async (request, reply) => {
    const projectId = pathIdentifier(request.params.projectId); const areaId = pathIdentifier(request.params.featureAreaId); const featureId = pathIdentifier(request.params.featureId);
    if (!projectId || !areaId || !featureId) return reply.code(400).send({ error: 'invalid_request' });
    const feature = await module().readFeature(actors.get(request)!, projectId, areaId, featureId);
    return feature ? { feature } : reply.code(404).send({ error: 'not_found' });
  });
}
