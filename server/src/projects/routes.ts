import type { FastifyError, FastifyInstance, FastifyRequest } from 'fastify';
import { requireSession } from '../auth/routes.js';
import type { AuthDependencies } from '../auth/service.js';
import type { ProjectActor, ProjectModule } from './module.js';
import { expectedVersion, pathIdentifier, projectListOptions, validateProjectName } from './policy.js';
import { contextLimits, creationSchema, validateProjectInput } from './creation.js';

const error = (name: string) => ({ type: 'object', additionalProperties: false, required: ['error'], properties: { error: { type: 'string', const: name } } });
const project = { type: 'object', additionalProperties: false, required: ['id', 'name', 'version'], properties: { id: { type: 'integer' }, name: { type: 'string' }, version: { type: 'integer' } } };
const envelope = { type: 'object', additionalProperties: false, required: ['project'], properties: { project } };
const definition = { ...project, required: [...project.required, ...Object.keys(contextLimits)], properties: { ...project.properties, ...Object.fromEntries(Object.keys(contextLimits).map(key => [key, { type: 'string' }])) } };
const definitionEnvelope = { ...envelope, properties: { project: definition } };
const creationError = { type: 'object', additionalProperties: false, required: ['error', 'fields'], properties: { error: { type: 'string', const: 'invalid_request' }, fields: { type: 'object', additionalProperties: { type: 'string' } } } };
const errors = { 400: error('invalid_request'), 404: error('not_found') };
const params = (...keys: string[]) => ({ type: 'object', required: keys, additionalProperties: false, properties: Object.fromEntries(keys.map(key => [key, { type: 'string' }])) });

export async function registerProjectRoutes(app: FastifyInstance, auth?: AuthDependencies, projects?: ProjectModule) {
  const actors = new WeakMap<FastifyRequest, ProjectActor>();
  app.addHook('onRequest', async (request, reply) => {
    reply.header('cache-control', 'no-store');
    const actor = await requireSession(request, reply, auth);
    if (actor) actors.set(request, actor);
  });
  app.setErrorHandler<FastifyError>((failure, request, reply) => {
    if (failure.validation || (failure.statusCode && failure.statusCode >= 400 && failure.statusCode < 500)) {
      if (request.method === 'POST' && request.routeOptions.url === '/api/projects') return reply.code(400).send({ error: 'invalid_request', fields: { _form: 'Submit valid JSON containing the project fields.' } });
      return reply.code(400).send({ error: 'invalid_request' });
    }
    return reply.code(503).send({ error: 'project_unavailable' });
  });
  function requireProjects() {
    if (!projects) throw new Error('Unavailable project service');
    return projects;
  }

  app.post('/api/projects', {
    attachValidation: true,
    schema: { body: creationSchema, response: { 201: definitionEnvelope, 400: creationError } },
  }, async (request, reply) => {
    const validated = validateProjectInput(request.body);
    if (!validated.valid) return reply.code(400).send({ error: 'invalid_request', fields: validated.fields });
    const project = await requireProjects().createDefinition(actors.get(request)!, validated.input);
    return reply.code(201).header('location', `/api/projects/${project.id}/definition`).send({ project });
  });
  app.get<{ Params: { projectId: string } }>('/api/projects/:projectId/definition', {
    schema: { params: params('projectId'), response: { 200: definitionEnvelope, ...errors } },
  }, async (request, reply) => {
    const id = pathIdentifier(request.params.projectId);
    if (!id) return reply.code(400).send({ error: 'invalid_request' });
    const project = await requireProjects().readDefinition(actors.get(request)!, id);
    return project ? { project } : reply.code(404).send({ error: 'not_found' });
  });

  app.get<{ Querystring: Record<string, unknown> }>('/api/projects', {
    schema: { querystring: { type: 'object', additionalProperties: false, properties: { name: { type: 'string' }, limit: { type: 'string' }, offset: { type: 'string' } } },
      response: { 200: { type: 'object', additionalProperties: false, required: ['projects'], properties: { projects: { type: 'array', items: project } } }, ...errors } },
  }, async (request, reply) => {
    const options = projectListOptions(request.query);
    if (!options) return reply.code(400).send({ error: 'invalid_request' });
    return { projects: await requireProjects().listProjects(actors.get(request)!, options) };
  });
  app.get<{ Params: { projectId: string } }>('/api/projects/:projectId', {
    schema: { params: params('projectId'), response: { 200: envelope, ...errors } },
  }, async (request, reply) => {
    const id = pathIdentifier(request.params.projectId);
    if (!id) return reply.code(400).send({ error: 'invalid_request' });
    const project = await requireProjects().readProject(actors.get(request)!, id);
    return project ? { project } : reply.code(404).send({ error: 'not_found' });
  });
  app.patch<{ Params: { projectId: string }; Body: { name: string; expectedVersion: number } }>('/api/projects/:projectId', {
    schema: { params: params('projectId'), body: { type: 'object', additionalProperties: false, required: ['name', 'expectedVersion'], properties: { name: { type: 'string' }, expectedVersion: { type: 'integer' } } },
      response: { 200: envelope, ...errors, 409: { type: 'object', additionalProperties: false, required: ['error', 'project'], properties: { error: { type: 'string', const: 'conflict' }, project } } } },
  }, async (request, reply) => {
    const id = pathIdentifier(request.params.projectId);
    const name = validateProjectName(request.body.name);
    const version = expectedVersion(request.body.expectedVersion);
    if (!id || !name.valid || !version) return reply.code(400).send({ error: 'invalid_request' });
    const result = await requireProjects().renameProject(actors.get(request)!, id, name.name, version);
    if (result.outcome === 'not_found') return reply.code(404).send({ error: 'not_found' });
    if (result.outcome === 'conflict') return reply.code(409).send({ error: 'conflict', project: result.project });
    return { project: result.project };
  });
  app.get<{ Params: { projectId: string; featureAreaId: string } }>('/api/projects/:projectId/feature-areas/:featureAreaId', {
    schema: { params: params('projectId', 'featureAreaId'), response: { ...errors, 200: {
      type: 'object', additionalProperties: false, required: ['featureArea'], properties: { featureArea: { type: 'object', additionalProperties: false, required: ['id', 'projectId'], properties: { id: { type: 'integer' }, projectId: { type: 'integer' } } } },
    } } },
  }, async (request, reply) => {
    const projectId = pathIdentifier(request.params.projectId);
    const areaId = pathIdentifier(request.params.featureAreaId);
    if (!projectId || !areaId) return reply.code(400).send({ error: 'invalid_request' });
    const featureArea = await requireProjects().readFeatureArea(actors.get(request)!, projectId, areaId);
    return featureArea ? { featureArea } : reply.code(404).send({ error: 'not_found' });
  });
  app.get<{ Params: { projectId: string; featureAreaId: string; featureId: string } }>('/api/projects/:projectId/feature-areas/:featureAreaId/features/:featureId', {
    schema: { params: params('projectId', 'featureAreaId', 'featureId'), response: { ...errors, 200: {
      type: 'object', additionalProperties: false, required: ['feature'], properties: { feature: { type: 'object', additionalProperties: false, required: ['id', 'featureAreaId'], properties: { id: { type: 'integer' }, featureAreaId: { type: 'integer' } } } },
    } } },
  }, async (request, reply) => {
    const projectId = pathIdentifier(request.params.projectId);
    const areaId = pathIdentifier(request.params.featureAreaId);
    const featureId = pathIdentifier(request.params.featureId);
    if (!projectId || !areaId || !featureId) return reply.code(400).send({ error: 'invalid_request' });
    const feature = await requireProjects().readFeature(actors.get(request)!, projectId, areaId, featureId);
    return feature ? { feature } : reply.code(404).send({ error: 'not_found' });
  });
}
