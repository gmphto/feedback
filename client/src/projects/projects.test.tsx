import { expect, it, vi } from 'vitest';
import { createProjectApi } from './api';
import { createProjectModel } from './model';
import { emptyDraft, fieldKeys, projectFields, validateDraft } from './fields';

const settle = () => new Promise(resolve => setTimeout(resolve, 0));
const definition = { ...emptyDraft(), id: 12, version: 1, name: 'Saved', roughIdea: '<script>text only</script>\n  ' };
function response(status = 201, project = definition) { return new Response(JSON.stringify({ project }), { status }); }
function setup(path = '/') {
  const request = vi.fn<typeof fetch>(); const api = createProjectApi(request); const history = vi.fn(); const unauthorized = vi.fn();
  const model = createProjectModel(api, history, unauthorized, path);
  return { request, api, model, history, unauthorized };
}
function form(context: ReturnType<typeof setup>) { context.model.setActor(1); context.model.open('/projects/new'); context.model.edit('name', '  Draft  '); }

it('validates every field by Unicode code points', () => {
  for (const key of fieldKeys) {
    expect(validateDraft({ ...emptyDraft(), name: 'Name', [key]: '🙂'.repeat(projectFields[key].limit) })).toEqual({});
    expect(validateDraft({ ...emptyDraft(), name: 'Name', [key]: 'a'.repeat(projectFields[key].limit + 1) })[key]).toBeDefined();
    expect(validateDraft({ ...emptyDraft(), name: 'Name', [key]: '\0' })[key]).toBeDefined();
  }
});

it('suppresses duplicate pending commands and navigates only after confirmed creation', async () => {
  const context = setup(); form(context);
  let complete!: (value: Response) => void;
  context.request.mockImplementation(() => new Promise(resolve => { complete = resolve; }));
  context.model.submit(); context.model.submit();
  expect(context.request).toHaveBeenCalledOnce(); expect(context.model.store.getState().status).toBe('submitting');
  expect(context.history).not.toHaveBeenCalledWith('/projects/12');
  complete(response()); await settle();
  expect(context.model.store.getState().status).toBe('saved'); expect(context.history).toHaveBeenLastCalledWith('/projects/12');
  expect(context.api.saved.getState().project).toEqual(definition); expect(context.model.store.getState().draft).toEqual(emptyDraft());
  expect(context.request.mock.calls[0]![1]).toMatchObject({ method: 'POST', credentials: 'same-origin' }); context.model.dispose();
});

it('field/server/network failures keep entered values and require a deliberate retry', async () => {
  const context = setup(); form(context); context.model.edit('roughIdea', '  exact\nnotes  ');
  const original = { ...context.model.store.getState().draft };
  context.request.mockResolvedValueOnce(new Response(JSON.stringify({ error: 'invalid_request', fields: { roughIdea: 'Use fewer characters.' } }), { status: 400 }));
  context.model.submit(); await settle();
  expect(context.model.store.getState().draft).toEqual(original); expect(context.model.store.getState().fields.roughIdea).toBe('Use fewer characters.');
  context.request.mockRejectedValueOnce(new Error('private network detail'));
  context.model.submit(); await settle();
  expect(context.model.store.getState().draft).toEqual(original); expect(context.model.store.getState().fields._form).toContain('may already have saved');
  expect(context.request).toHaveBeenCalledTimes(2); expect(context.api.saved.getState().project).toBeNull();
  expect(context.history).not.toHaveBeenCalledWith('/projects/12');
  context.request.mockResolvedValueOnce(response()); context.model.submit(); await settle();
  expect(context.request).toHaveBeenCalledTimes(3); expect(context.model.store.getState().status).toBe('saved'); context.model.dispose();
});

it('cancel before dispatch sends nothing; late create responses cannot overwrite a later draft', async () => {
  const context = setup(); form(context); context.model.cancel(); expect(context.request).not.toHaveBeenCalled();
  form(context); let complete!: (value: Response) => void;
  context.request.mockImplementation(() => new Promise(resolve => { complete = resolve; }));
  context.model.submit(); const signal = context.request.mock.calls[0]![1]!.signal!;
  context.model.cancel(); context.model.open('/projects/new'); context.model.edit('name', 'Different draft');
  expect(signal.aborted).toBe(true); complete(response()); await settle();
  expect(context.model.store.getState().draft.name).toBe('Different draft'); expect(context.model.store.getState().status).toBe('editing');
  expect(context.api.saved.getState().project).toBeNull(); expect(context.history).not.toHaveBeenCalledWith('/projects/12'); context.model.dispose();
});

it('late create failures and read successes cannot repopulate state after a different session', async () => {
  const context = setup(); form(context); let reject!: (error: Error) => void;
  context.request.mockImplementationOnce(() => new Promise((_resolve, fail) => { reject = fail; }));
  context.model.submit(); context.model.setActor(null); context.model.setActor(2); context.model.edit('name', 'New owner draft');
  reject(new Error('late failure')); await settle();
  expect(context.model.store.getState().fields).toEqual({}); expect(context.model.store.getState().draft.name).toBe('New owner draft');
  let complete!: (value: Response) => void; context.request.mockImplementationOnce(() => new Promise(resolve => { complete = resolve; }));
  context.model.open('/projects/12'); context.model.setActor(null); complete(response(200)); await settle();
  expect(context.api.saved.getState().project).toBeNull(); expect(context.model.store.getState().draft).toEqual(emptyDraft()); context.model.dispose();
});

it('direct saved URLs reload through the facade and older navigation reads cannot win', async () => {
  const context = setup('/projects/12'); let old!: (value: Response) => void;
  context.request.mockImplementationOnce(() => new Promise(resolve => { old = resolve; })); context.model.setActor(1);
  expect(context.model.store.getState().status).toBe('loading');
  context.request.mockResolvedValueOnce(response(200, { ...definition, id: 13, name: 'Other' })); context.model.open('/projects/13', false); await settle();
  old(response(200)); await settle();
  expect(context.api.saved.getState().project!.id).toBe(13); expect(context.model.store.getState().route).toBe('/projects/13');
  expect(context.history).not.toHaveBeenCalled();
  context.request.mockResolvedValueOnce(new Response('{}', { status: 404 })); context.model.open('/projects/99', false); await settle();
  expect(context.model.store.getState().status).toBe('missing'); expect(context.api.saved.getState().project).toBeNull();
  context.request.mockResolvedValueOnce(new Response('{}', { status: 503 })); context.model.retryRead(); await settle();
  expect(context.model.store.getState().status).toBe('failure'); context.model.dispose();
});

it('401 invokes sign-in transition without retaining cached protected content', async () => {
  const context = setup('/projects/12'); context.request.mockResolvedValueOnce(response(200)); context.model.setActor(1); await settle();
  expect(context.api.saved.getState().project).toEqual(definition);
  context.request.mockResolvedValueOnce(new Response('{"error":"unauthorized"}', { status: 401 })); context.model.retryRead(); await settle();
  expect(context.unauthorized).toHaveBeenCalledOnce(); expect(context.api.saved.getState().project).toBeNull(); context.model.dispose();
});

it('facade rejects malformed saved transport and suppresses cache commit when cancelled', async () => {
  const context = setup(); const controller = new AbortController();
  context.request.mockResolvedValueOnce(new Response(JSON.stringify({ project: { ...definition, ownerId: 3 } })));
  await expect(context.api.read(12, controller.signal, () => true)).rejects.toMatchObject({ kind: 'unavailable' });
  context.request.mockResolvedValueOnce(response(200)); controller.abort();
  await context.api.read(12, controller.signal, () => true);
  expect(context.api.saved.getState().project).toBeNull(); context.model.dispose();
});
