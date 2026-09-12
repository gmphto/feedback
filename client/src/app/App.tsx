import { RouterProvider } from '@tanstack/react-router';
import * as React from 'react';

import { LoginButton } from '../components/LoginButton';
import { LogoutButton } from '../components/LogoutButton';
import { useAppDispatch } from '../core/store/hooks';
import { useAuth, useAuthOperations } from '../auth/contexts/AuthProvider';
import { createProjectApi } from '../projects/api';
import { projectApi } from '../projects/api/api';
import { createProjectModel } from '../projects/model';
import { projectActions } from '../projects/state/slice';
import { router } from './router';
import { productName } from './shell/layout';

export function AuthView() {
  const user = useAuth('AuthView', (state) => state.user, true);
  const error = useAuthOperations('AuthView', (state) => state.error, true);
  const refresh = useAuthOperations('AuthView', (state) => state.refresh, true);
  const isLoadingUser = useAuthOperations('AuthView', (state) => state.isLoadingUser, true);
  const isLoggingIn = useAuthOperations('AuthView', (state) => state.isLoggingIn, true);
  const isLoggingOut = useAuthOperations('AuthView', (state) => state.isLoggingOut, true);
  const isPending = isLoadingUser || isLoggingIn || isLoggingOut;
  let sessionMessage = 'Sign in to start defining your project scope.';

  if (isLoggingIn) {
    sessionMessage = 'Opening secure sign-in…';
  } else if (isLoggingOut) {
    sessionMessage = 'Ending this application session…';
  } else if (isLoadingUser) {
    sessionMessage = 'Checking your session…';
  } else if (user) {
    sessionMessage = 'You’re signed in. Your application session is ready.';
  }

  const handleRefresh = React.useCallback(() => {
    void refresh();
  }, [refresh]);

  return (
    <section aria-labelledby="session-heading">
      <h2 id="session-heading" className="mt-8 text-lg font-semibold">
        Your application session
      </h2>
      <div aria-live="polite" className="my-4 min-h-12">
        {(isPending || !error) && <p>{sessionMessage}</p>}
        {error && <p role="alert">{error}</p>}
      </div>
      <div className="flex flex-wrap gap-3">
        {user ? <LogoutButton /> : <LoginButton />}
        {(user || error) && (
          <button
            className="secondary"
            disabled={isPending}
            onClick={handleRefresh}
          >
            Check session again
          </button>
        )}
      </div>
      <p className="mt-5 text-sm text-slate-600">
        Sign-in uses Auth0 Universal Login. Signing out ends this application’s session.
      </p>
    </section>
  );
}

export default function App() {
  const dispatch = useAppDispatch();
  const user = useAuth('App', (state) => state.user, true);
  const isAuthenticated = useAuth('App', (state) => state.isAuthenticated, true);
  const isSessionReady = useAuthOperations('App', (state) => state.isSessionReady, true);
  const expireSession = useAuthOperations('App', (state) => state.expireSession, true);
  const [projects] = React.useState(() => createProjectModel(
    createProjectApi(),
    (path) => {
      window.history.pushState({}, '', path);
    },
    () => {
      void expireSession();
    },
    typeof window === 'undefined' ? '/' : window.location.pathname,
  ));

  React.useEffect(() => {
    // A transient check/failure hides projects without discarding unsaved work.
    if (!isSessionReady) {
      return;
    }

    projects.setActor(user?.id ?? null);
    if (!user) {
      dispatch(projectApi.util.resetApiState());
      dispatch(projectActions.reset());
    }
  }, [isSessionReady, user?.id, projects, dispatch]);

  React.useEffect(() => {
    function handlePopState() {
      projects.open(window.location.pathname, false);
    }

    projects.resume();
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      projects.pause();
    };
  }, [projects]);

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-20">
        <h1>{productName}</h1>
        <p className="mt-3 text-slate-600">
          Turn a rough project idea into a clear MVP scope.
        </p>
        <AuthView />
      </main>
    );
  }

  // The session user is read inside the routes. The router's only job is the URL
  // and the rail.
  return <RouterProvider router={router} />;
}




function ProjectProvider() {
  return (projectId: number ) =>  {
    return () => {

    }
  }
}
