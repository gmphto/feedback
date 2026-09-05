import { createStore } from 'zustand/vanilla';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AuthApi, User } from './api';

type Action = 'refresh' | 'login' | 'logout';
type AuthState = {
  status: 'signed-out' | 'pending' | 'signed-in' | 'failure';
  user: User | null;
  operation: { action: Action; id: number } | null;
};

export function createAuthModel(api: AuthApi, navigate: (url: string) => void, failedCallback = false) {
  const store = createStore<AuthState>()(subscribeWithSelector(immer(() => ({
    status: failedCallback ? 'failure' : 'pending', user: null, operation: null,
  }))));
  let version = 0;
  let controller: AbortController | undefined;
  // Selector subscription is the listener middleware: commands record intent;
  // this one effect owner performs/cancels network and navigation work.
  const unsubscribe = store.subscribe(state => state.operation, async operation => {
    controller?.abort();
    if (!operation) return;
    const current = new AbortController(); controller = current;
    const isCurrent = () => !current.signal.aborted && operation.id === version;
    try {
      if (operation.action === 'login') {
        const url = await api.beginLogin(current.signal);
        if (isCurrent()) navigate(url);
        return;
      }
      let user: User | null = null;
      if (operation.action === 'logout') await api.logout(current.signal);
      else user = await api.currentSession(current.signal);
      if (isCurrent()) store.setState(draft => { draft.user = user; draft.status = user ? 'signed-in' : 'signed-out'; });
    } catch {
      if (isCurrent()) store.setState(draft => { draft.user = null; draft.status = 'failure'; });
    }
  });
  function request(action: Action) {
    version++;
    store.setState(draft => { draft.user = null; draft.status = 'pending'; draft.operation = { action, id: version }; });
  }
  return {
    store,
    refresh: () => request('refresh'),
    signIn: () => request('login'),
    signOut: () => request('logout'),
    cancel() {
      version++; controller?.abort();
      store.setState(draft => { draft.user = null; draft.status = 'signed-out'; draft.operation = null; });
    },
    dispose() { controller?.abort(); unsubscribe(); },
  };
}
export type AuthModel = ReturnType<typeof createAuthModel>;
