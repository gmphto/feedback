import { useEffect, useState } from 'react';
import { useStore } from 'zustand';
import { createAuthApi } from '../auth/api';
import { createAuthModel, observeSession, type AuthModel } from '../auth/model';

export function AuthView({ model }: { model: AuthModel }) {
  const state = useStore(model.store);
  return <section aria-labelledby="session-heading">
    <h2 id="session-heading" className="mt-8 text-lg font-semibold">Your application session</h2>
    <div aria-live="polite" className="my-4 min-h-12">
      {state.status === 'pending' && <p>{state.operation?.action === 'login' ? 'Opening secure sign-in…' : state.operation?.action === 'logout' ? 'Ending this application session…' : 'Checking your session…'}</p>}
      {state.status === 'signed-out' && <p>Sign in to start defining your project scope.</p>}
      {state.status === 'signed-in' && <p>You’re signed in. Your application session is ready.</p>}
      {state.status === 'failure' && <p role="alert">We couldn’t complete authentication. Please try again.</p>}
    </div>
    <div className="flex flex-wrap gap-3">
      {state.status === 'signed-out' && <button onClick={model.signIn}>Sign in</button>}
      {state.status === 'signed-in' && <button onClick={model.signOut}>Sign out of this app</button>}
      {state.status === 'failure' && <><button onClick={model.signIn}>Try sign-in again</button><button className="secondary" onClick={model.refresh}>Check session again</button></>}
      {state.status === 'pending' && <button className="secondary" onClick={model.cancel}>Cancel</button>}
    </div>
    <p className="mt-5 text-sm text-slate-600">Sign-in uses Auth0 Universal Login. Signing out ends this application’s session.</p>
  </section>;
}

export default function App() {
  const [model] = useState(() => createAuthModel(createAuthApi(), url => window.location.assign(url),
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('authError') === '1'));
  useEffect(() => observeSession(model, window), [model]);
  return (
    <main className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-20">
      <h1>Project Scope Tool</h1>
      <p className="mt-3 text-slate-600">Turn a rough project idea into a clear MVP scope.</p>
      <AuthView model={model} />
    </main>
  );
}
