import { configureStore, createListenerMiddleware, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { emptyDraft, validateDraft, type FieldErrors, type ProjectDraft, type ProjectField } from './fields';
import { projectFailure, type ProjectApi } from './api';

type State = {
  route: string;
  actorId: number | null;
  draft: ProjectDraft;
  fields: FieldErrors;
  status: 'home' | 'editing' | 'submitting' | 'loading' | 'saved' | 'missing' | 'failure';
  operation: { id: number; kind: 'create' | 'read'; projectId?: number } | null;
};
function routeId(path: string): number | undefined {
  const match = /^\/projects\/([1-9]\d*)$/.exec(path);
  return match && Number(match[1]) <= 2147483647 ? Number(match[1]) : undefined;
}

export function createProjectModel(api: ProjectApi, pushHistory: (path: string) => void, returnToSignIn: () => void, initialPath = '/') {
  const initialState: State = { route: initialPath, actorId: null,
    draft: emptyDraft(), fields: {}, status: 'home', operation: null,
  };
  const slice = createSlice({
    name: 'project', initialState,
    reducers: {
      opened(draft, { payload }: PayloadAction<{ path: string; projectId?: number; operationId: number }>) {
        draft.route = payload.path;
        draft.draft = emptyDraft();
        draft.fields = {};
        if (!draft.actorId || payload.path === '/') draft.status = 'home';
        else if (payload.path === '/projects/new') draft.status = 'editing';
        else draft.status = payload.projectId ? 'loading' : 'missing';
        draft.operation = draft.actorId && payload.projectId ? { kind: 'read', projectId: payload.projectId, id: payload.operationId } : null;
      },
      actorChanged(draft, { payload }: PayloadAction<number | null>) { draft.actorId = payload; },
      edited(draft, { payload }: PayloadAction<{ field: ProjectField; value: string }>) {
        draft.draft[payload.field] = payload.value;
        delete draft.fields[payload.field];
      },
      validationFailed(draft, { payload }: PayloadAction<FieldErrors>) { draft.fields = payload; },
      submitted(draft, { payload }: PayloadAction<number>) {
        draft.status = 'submitting'; draft.fields = {}; draft.operation = { kind: 'create', id: payload };
      },
      saved(draft, { payload }: PayloadAction<string>) {
        draft.status = 'saved'; draft.fields = {}; draft.draft = emptyDraft(); draft.route = payload;
      },
      failed(draft, { payload }: PayloadAction<{ kind: 'create' | 'read'; missing: boolean; fields?: FieldErrors }>) {
        if (payload.kind === 'create') draft.status = 'editing';
        else draft.status = payload.missing ? 'missing' : 'failure';
        if (payload.fields) draft.fields = payload.fields;
        else if (payload.kind === 'create') {
          draft.fields = { _form: 'We could not confirm creation. Your text is kept. Check before retrying: the server may already have saved the project.' };
        } else draft.fields = {};
      },
      interrupted(draft) {
        draft.status = 'editing';
        draft.fields = { _form: 'Creation was interrupted. Check before retrying; the request may already have saved.' };
      },
    },
  });
  const listener = createListenerMiddleware<State>();
  const store = configureStore({ reducer: slice.reducer, middleware: defaults => defaults().prepend(listener.middleware) });
  let version = 0;
  let controller: AbortController | undefined;
  function invalidate() {
    version++;
    controller?.abort();
    api.clear();
  }
  function open(path: string, push = true) {
    invalidate();
    const id = routeId(path);
    store.dispatch(slice.actions.opened({ path, projectId: id, operationId: version }));
    if (push) pushHistory(path);
  }
  const unsubscribe = listener.startListening({
    predicate: (_action, current, previous) => current.operation !== previous.operation,
    effect: async (_action, listenerApi) => {
      const operation = listenerApi.getState().operation;
      if (!operation) return;
      controller?.abort();
      const currentController = new AbortController();
      controller = currentController;
      const { actorId, route, draft: input } = store.getState();
      const isOperationCurrent = () => !currentController.signal.aborted && version === operation.id
        && store.getState().actorId === actorId && store.getState().route === route;
      try {
        const project = operation.kind === 'create'
          ? await api.create({ ...input }, currentController.signal, isOperationCurrent)
          : await api.read(operation.projectId!, currentController.signal, isOperationCurrent);
        if (!isOperationCurrent()) return;
        const destination = `/projects/${project.id}`;
        store.dispatch(slice.actions.saved(destination));
        if (operation.kind === 'create') pushHistory(destination);
      } catch (error) {
        if (!isOperationCurrent()) return;
        api.clear();
        const failure = projectFailure(error);
        if (failure.kind === 'unauthorized') {
          returnToSignIn();
          return;
        }
        store.dispatch(slice.actions.failed({ kind: operation.kind, missing: failure.kind === 'missing',
          fields: failure.kind === 'invalid' ? failure.fields : undefined }));
      }
    },
  });
  return {
    store: { getState: store.getState, subscribe: store.subscribe }, saved: api.saved, open,
    setActor(id: number | null) {
      if (store.getState().actorId === id) return;
      invalidate();
      store.dispatch(slice.actions.actorChanged(id));
      open(store.getState().route, false);
    },
    edit(field: ProjectField, value: string) {
      if (store.getState().status !== 'editing') return;
      store.dispatch(slice.actions.edited({ field, value }));
    },
    submit() {
      const state = store.getState();
      if (!state.actorId || state.status !== 'editing') return;
      const fields = validateDraft(state.draft);
      if (Object.keys(fields).length) {
        store.dispatch(slice.actions.validationFailed(fields));
        return;
      }
      invalidate();
      store.dispatch(slice.actions.submitted(version));
    },
    retryRead() { open(store.getState().route, false); },
    cancel() { open('/'); },
    pause() { invalidate(); },
    resume() {
      const state = store.getState();
      if (state.actorId && (state.status === 'loading' || state.status === 'saved')) open(state.route, false);
      else if (state.status === 'submitting') {
        store.dispatch(slice.actions.interrupted());
      }
    },
    dispose() {
      invalidate();
      unsubscribe();
    },
  };
}
export type ProjectModel = ReturnType<typeof createProjectModel>;
