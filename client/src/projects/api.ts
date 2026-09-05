import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { fieldKeys, type FieldErrors, type ProjectDraft } from './fields';
import { matchesSchema, type Schema } from '../transport/schema';

type ProjectDefinition = ProjectDraft & { id: number; version: number };
type ProjectFailure = { kind: 'unauthorized' | 'missing' | 'unavailable' } | { kind: 'invalid'; fields: FieldErrors };
const definitionSchema: Schema = {
  type: 'object', additionalProperties: false, required: ['project'],
  properties: {
    project: {
      type: 'object', additionalProperties: false, required: ['id', 'version', ...fieldKeys],
      properties: {
        id: { type: 'integer', minimum: 1, maximum: 2147483647 },
        version: { type: 'integer', minimum: 1 },
        ...Object.fromEntries(fieldKeys.map(key => [key, { type: 'string' } as const])),
      },
    },
  },
};
function decodeDefinition(body: unknown): ProjectDefinition {
  if (!matchesSchema(body, definitionSchema)) throw { kind: 'unavailable' };
  return (body as { project: ProjectDefinition }).project;
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
  const initialState: { project: ProjectDefinition | null } = { project: null };
  const slice = createSlice({
    name: 'savedProject', initialState,
    reducers: {
      received(draft, { payload }: PayloadAction<ProjectDefinition>) { draft.project = payload; },
      cleared(draft) { draft.project = null; },
    },
  });
  const saved = configureStore({ reducer: slice.reducer });
  async function validateAndCacheResponse(response: Promise<Response>, signal: AbortSignal, isOperationCurrent: () => boolean, expectedStatus: number, expectedId?: number) {
    const result = await response;
    if (result.ok && result.status !== expectedStatus) throw { kind: 'unavailable' };
    const project = await decodeResponse(result);
    if ((expectedId !== undefined && project.id !== expectedId) || (expectedStatus === 201 && project.version !== 1)) throw { kind: 'unavailable' };
    if (!signal.aborted && isOperationCurrent()) saved.dispatch(slice.actions.received(project));
    return project;
  }
  return {
    saved: { getState: saved.getState, subscribe: saved.subscribe },
    clear() { saved.dispatch(slice.actions.cleared()); },
    create(input: ProjectDraft, signal: AbortSignal, isOperationCurrent: () => boolean) {
      return validateAndCacheResponse(request('/api/projects', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input), signal }), signal, isOperationCurrent, 201);
    },
    read(id: number, signal: AbortSignal, isOperationCurrent: () => boolean) {
      return validateAndCacheResponse(request(`/api/projects/${id}/definition`, { credentials: 'same-origin', cache: 'no-store', signal }), signal, isOperationCurrent, 200, id);
    },
  };
}
export type ProjectApi = ReturnType<typeof createProjectApi>;
