import { createStore } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';
import { fieldKeys, type FieldErrors, type ProjectDraft } from './fields';

export type ProjectDefinition = ProjectDraft & { id: number; version: number };
export type ProjectFailure = { kind: 'unauthorized' | 'missing' | 'unavailable' } | { kind: 'invalid'; fields: FieldErrors };
const definitionSchema = { type: 'object', additionalProperties: false, required: ['id', 'version', ...fieldKeys], properties: {
  id: { type: 'integer' }, version: { type: 'integer' }, ...Object.fromEntries(fieldKeys.map(key => [key, { type: 'string' }])),
} };
function decodeDefinition(body: unknown): ProjectDefinition {
  if (!body || typeof body !== 'object' || Object.keys(body).join() !== 'project') throw { kind: 'unavailable' };
  const value = (body as { project: unknown }).project;
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw { kind: 'unavailable' };
  const object = value as Record<string, unknown>;
  if (!definitionSchema.required.every(key => Object.hasOwn(object, key))
    || Object.keys(object).some(key => !Object.hasOwn(definitionSchema.properties, key))
    || fieldKeys.some(key => typeof object[key] !== 'string')
    || !Number.isInteger(object.id) || Number(object.id) <= 0 || Number(object.id) > 2147483647
    || !Number.isInteger(object.version) || Number(object.version) <= 0) throw { kind: 'unavailable' };
  return object as ProjectDefinition;
}
async function decodeResponse(response: Response): Promise<ProjectDefinition> {
  if (response.status === 401) throw { kind: 'unauthorized' };
  if (response.status === 404) throw { kind: 'missing' };
  if (response.status === 400) {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'fields' in body && body.fields && typeof body.fields === 'object') {
      const fields: FieldErrors = {};
      for (const [key, value] of Object.entries(body.fields)) {
        if ((key === '_form' || fieldKeys.includes(key as keyof ProjectDraft)) && typeof value === 'string') fields[key as keyof FieldErrors] = value;
      }
      if (Object.keys(fields).length) throw { kind: 'invalid', fields };
    }
    throw { kind: 'unavailable' };
  }
  if (response.status !== 200 && response.status !== 201) throw { kind: 'unavailable' };
  return decodeDefinition(await response.json());
}
export function projectFailure(error: unknown): ProjectFailure {
  if (error && typeof error === 'object' && 'kind' in error && ['unauthorized', 'missing', 'unavailable', 'invalid'].includes(String(error.kind))) return error as ProjectFailure;
  return { kind: 'unavailable' };
}

export function createProjectApi(request: typeof fetch = fetch) {
  // The facade is the sole mutation authority for saved server representations.
  const saved = createStore<{ project: ProjectDefinition | null }>()(immer(() => ({ project: null })));
  async function receive(response: Promise<Response>, signal: AbortSignal, current: () => boolean, expectedStatus: number, expectedId?: number) {
    const result = await response;
    if (result.ok && result.status !== expectedStatus) throw { kind: 'unavailable' };
    const project = await decodeResponse(result);
    if ((expectedId !== undefined && project.id !== expectedId) || (expectedStatus === 201 && project.version !== 1)) throw { kind: 'unavailable' };
    if (!signal.aborted && current()) saved.setState(draft => { draft.project = project; });
    return project;
  }
  return {
    saved,
    clear() { saved.setState(draft => { draft.project = null; }); },
    create(input: ProjectDraft, signal: AbortSignal, current: () => boolean) {
      return receive(request('/api/projects', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input), signal }), signal, current, 201);
    },
    read(id: number, signal: AbortSignal, current: () => boolean) {
      return receive(request(`/api/projects/${id}/definition`, { credentials: 'same-origin', cache: 'no-store', signal }), signal, current, 200, id);
    },
  };
}
export type ProjectApi = ReturnType<typeof createProjectApi>;
