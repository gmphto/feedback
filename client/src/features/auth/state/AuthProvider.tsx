import { useSnackbar } from 'notistack';
import * as React from 'react';

import { createContext } from '../../../shared/Context';
import { useAppDispatch } from '../../../app/hooks';
import { sessionEnded } from '../../../app/store';
import { useFocusSessionRevalidation } from '../../../shared/api/useFocusSessionRevalidation';
import {
  useGetSessionQuery,
  useLoginMutation,
  useLogoutMutation,
} from '../api/auth';
import type { User } from '../authResponses';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  expireSession: () => void;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const authMessages = {
  callback: 'Sign-in could not be completed. Please try signing in again.',
  login: 'Could not open secure sign-in. Please try signing in again.',
  logout: 'Could not sign out. Please try again.',
  session: 'Could not check your session. Please try again.',
};

const [Provider, useAuth] = createContext<AuthState>('Auth');

function readInitialAuthError(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const params = new URLSearchParams(window.location.search);

  return params.get('authError') === '1' ? authMessages.callback : null;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const [actionError, setActionError] = React.useState(readInitialAuthError);
  const [isNavigating, setIsNavigating] = React.useState(false);

  const {
    data: sessionUser,
    isFetching: isCheckingSession,
    isSuccess: isSessionSuccess,
    isError: hasSessionError,
    refetch: refetchSession,
  } = useGetSessionQuery(undefined, {
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  const expireSession = React.useCallback(() => {
    setIsNavigating(true);
    // The root reducer re-runs every slice and RTK Query cache from `undefined`,
    // so no feature registers a per-feature reset here.
    dispatch(sessionEnded());
    window.location.replace('/');
  }, [dispatch]);

  const login = React.useCallback(async (): Promise<void> => {
    setActionError(null);

    try {
      const redirectUrl = await loginMutation().unwrap();

      setIsNavigating(true);
      window.location.assign(redirectUrl);
    } catch {
      setIsNavigating(false);
      setActionError(authMessages.login);
    }
  }, [loginMutation]);

  const logout = React.useCallback(async (): Promise<void> => {
    setActionError(null);

    try {
      await logoutMutation().unwrap();
    } catch {
      setActionError(authMessages.logout);
      enqueueSnackbar(authMessages.logout, { variant: 'error' });
      return;
    }

    expireSession();
  }, [logoutMutation, expireSession, enqueueSnackbar]);

  const refresh = React.useCallback(async (): Promise<void> => {
    setActionError(null);

    // Query failures are exposed through hasSessionError.
    await refetchSession();
  }, [refetchSession]);

  useFocusSessionRevalidation({
    isAuthOperationPending:
      isCheckingSession || isLoggingIn || isLoggingOut || isNavigating,
    revalidateSession: refresh,
  });

  // Keep the user during background checks, but not after a failed check.
  const user = isSessionSuccess ? sessionUser ?? null : null;
  const error =
    actionError ?? (hasSessionError ? authMessages.session : null);

  return (
    <Provider
      user={user}
      isAuthenticated={user !== null}
      error={error}
      login={login}
      logout={logout}
      refresh={refresh}
      expireSession={expireSession}
    >
      {children}
    </Provider>
  );
};

export { AuthProvider, useAuth, useAuth as useAuthOperations };
export type { AuthState };