import { configureStore, createListenerMiddleware, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthApi, User } from './api';

type Action = 'refresh' | 'login' | 'logout';
type AuthState = {
  status: 'signed-out' | 'pending' | 'signed-in' | 'failure';
  user: User | null;
  operation: { action: Action; id: number } | null;
};

export function createAuthModel(api: AuthApi, navigate: (url: string) => void, failedCallback = false, onLogoutOutcome?: (outcome: 'success' | 'failure') => void) {
  const initialState: AuthState = {
    status: failedCallback ? 'failure' : 'pending', user: null, operation: null,
  };
  const slice = createSlice({
    name: 'auth', initialState,
    reducers: {
      requested(draft, { payload }: PayloadAction<NonNullable<AuthState['operation']>>) {
        draft.user = null; draft.status = 'pending'; draft.operation = payload;
      },
      sessionReceived(draft, { payload }: PayloadAction<User | null>) {
        draft.user = payload; draft.status = payload ? 'signed-in' : 'signed-out';
      },
      failed(draft) { draft.user = null; draft.status = 'failure'; },
      cancelled(draft) { draft.user = null; draft.status = 'signed-out'; draft.operation = null; },
    },
  });
  const listener = createListenerMiddleware<AuthState>();
  const store = configureStore({ reducer: slice.reducer, middleware: defaults => defaults().prepend(listener.middleware) });
  let version = 0;
  let controller: AbortController | undefined;
  const unsubscribe = listener.startListening({
    predicate: (_action, current, previous) => current.operation !== previous.operation,
    effect: async (_action, listenerApi) => {
      const operation = listenerApi.getState().operation;
      controller?.abort();
      if (!operation) return;
      const current = new AbortController(); controller = current;
      const isCurrent = () => !current.signal.aborted && operation.id === version;
      let outcome: 'success' | 'failure' | undefined;
      try {
        if (operation.action === 'login') {
          const url = await api.beginLogin(current.signal);
          if (isCurrent()) navigate(url);
          return;
        }
        let user: User | null = null;
        if (operation.action === 'logout') await api.logout(current.signal);
        else user = await api.currentSession(current.signal);
        if (isCurrent()) { store.dispatch(slice.actions.sessionReceived(user)); outcome = 'success'; }
      } catch {
        if (isCurrent()) { store.dispatch(slice.actions.failed()); outcome = 'failure'; }
      }
      if (operation.action === 'logout' && outcome) {
        try { onLogoutOutcome?.(outcome); } catch { /* Feedback cannot change the committed API outcome. */ }
      }
    },
  });
  function request(action: Action) {
    version++;
    store.dispatch(slice.actions.requested({ action, id: version }));
  }
  return {
    getGeneration: () => version,
    store: { getState: store.getState, subscribe: store.subscribe },
    refresh: () => request('refresh'),
    signIn: () => request('login'),
    signOut: () => request('logout'),
    cancel() {
      version++; controller?.abort();
      store.dispatch(slice.actions.cancelled());
    },
    pause() { version++; controller?.abort(); },
    dispose() { version++; controller?.abort(); unsubscribe(); },
  };
}
export type AuthModel = ReturnType<typeof createAuthModel>;

// React may replay effect setup/cleanup in StrictMode. Cleanup cancels effects,
// not the user's visible outcome; only explicit commands dismiss a failure.
export function observeSession(model: AuthModel, target: Pick<EventTarget, 'addEventListener' | 'removeEventListener'>) {
  const refresh = () => {
    if (model.store.getState().status !== 'failure') model.refresh();
  };
  refresh();
  target.addEventListener('focus', refresh);
  return () => { model.pause(); target.removeEventListener('focus', refresh); };
}
