import { createStore } from 'zustand/vanilla';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { emptyDraft, validateDraft, type FieldErrors, type ProjectDraft, type ProjectField } from './fields';
import { projectFailure, type ProjectApi } from './api';

type State = {
  route: string; actorId: number | null; draft: ProjectDraft; fields: FieldErrors;
  status: 'home' | 'editing' | 'submitting' | 'loading' | 'saved' | 'missing' | 'failure';
  operation: { id: number; kind: 'create' | 'read'; projectId?: number } | null;
};
function routeId(path: string): number | undefined {
  const match = /^\/projects\/([1-9]\d*)$/.exec(path);
  return match && Number(match[1]) <= 2147483647 ? Number(match[1]) : undefined;
}

export function createProjectModel(api: ProjectApi, pushHistory: (path: string) => void, unauthenticated: () => void, initialPath = '/') {
  const store = createStore<State>()(subscribeWithSelector(immer(() => ({ route: initialPath, actorId: null,
    draft: emptyDraft(), fields: {}, status: 'home', operation: null,
  }))));
  let version = 0; let controller: AbortController | undefined;
  function invalidate() { version++; controller?.abort(); api.clear(); }
  function open(path: string, push = true) {
    invalidate();
    const id = routeId(path); const actor = store.getState().actorId;
    store.setState(draft => {
      draft.route = path; draft.draft = emptyDraft(); draft.fields = {};
      draft.status = !actor ? 'home' : path === '/projects/new' ? 'editing' : id ? 'loading' : path === '/' ? 'home' : 'missing';
      draft.operation = actor && id ? { kind: 'read', projectId: id, id: version } : null;
    });
    if (push) pushHistory(path);
  }
  const unsubscribe = store.subscribe(state => state.operation, async operation => {
    if (!operation) return;
    controller?.abort(); const currentController = new AbortController(); controller = currentController;
    const { actorId, route, draft: input } = store.getState();
    const current = () => !currentController.signal.aborted && version === operation.id
      && store.getState().actorId === actorId && store.getState().route === route;
    try {
      const project = operation.kind === 'create'
        ? await api.create({ ...input }, currentController.signal, current)
        : await api.read(operation.projectId!, currentController.signal, current);
      if (!current()) return;
      const destination = `/projects/${project.id}`;
      store.setState(draft => { draft.status = 'saved'; draft.fields = {}; draft.draft = emptyDraft(); draft.route = destination; });
      if (operation.kind === 'create') pushHistory(destination);
    } catch (error) {
      if (!current()) return;
      api.clear(); const failure = projectFailure(error);
      if (failure.kind === 'unauthorized') { unauthenticated(); return; }
      store.setState(draft => {
        draft.status = operation.kind === 'create' ? 'editing' : failure.kind === 'missing' ? 'missing' : 'failure';
        draft.fields = failure.kind === 'invalid' ? failure.fields : operation.kind === 'create'
          ? { _form: 'We could not confirm creation. Your text is kept. Check before retrying: the server may already have saved the project.' } : {};
      });
    }
  });
  return {
    store, saved: api.saved, open,
    setActor(id: number | null) {
      if (store.getState().actorId === id) return;
      invalidate(); store.setState(draft => { draft.actorId = id; }); open(store.getState().route, false);
    },
    edit(field: ProjectField, value: string) {
      if (store.getState().status !== 'editing') return;
      store.setState(draft => { draft.draft[field] = value; delete draft.fields[field]; });
    },
    submit() {
      const state = store.getState();
      if (!state.actorId || state.status !== 'editing') return;
      const fields = validateDraft(state.draft);
      if (Object.keys(fields).length) { store.setState(draft => { draft.fields = fields; }); return; }
      invalidate();
      store.setState(draft => { draft.status = 'submitting'; draft.fields = {}; draft.operation = { kind: 'create', id: version }; });
    },
    retryRead() { open(store.getState().route, false); },
    cancel() { open('/'); },
    pause() { version++; controller?.abort(); api.clear(); },
    resume() {
      const state = store.getState();
      if (state.actorId && (state.status === 'loading' || state.status === 'saved')) open(state.route, false);
      else if (state.status === 'submitting') store.setState(draft => { draft.status = 'editing'; draft.fields = { _form: 'Creation was interrupted. Check before retrying; the request may already have saved.' }; });
    },
    dispose() { invalidate(); unsubscribe(); },
  };
}
export type ProjectModel = ReturnType<typeof createProjectModel>;
