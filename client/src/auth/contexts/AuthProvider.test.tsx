import * as React from 'react';

import { renderToStaticMarkup } from 'react-dom/server';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { AuthProvider, useAuth, useAuthOperations } from './AuthProvider';
import type { AuthState, AuthOperationsContextValue } from './AuthProvider';

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  enqueueSnackbar: vi.fn(),
  loginMutation: vi.fn(),
  logoutMutation: vi.fn(),
  refetch: vi.fn(),
  resetLogin: vi.fn(),
  resetLogout: vi.fn(),
  session: {
    data: { id: 7 } as { id: number } | null,
    isFetching: false,
    isSuccess: true,
    isError: false,
  },
}));

vi.mock('../core/store/hooks', () => ({
  useAppDispatch: () => mocks.dispatch,
}));

vi.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: mocks.enqueueSnackbar }),
}));

vi.mock('../services/api', () => ({
  feedApi: {
    util: {
      resetApiState: () => ({ type: 'feedApi/resetApiState' }),
    },
  },
}));

vi.mock('../services/auth', () => ({
  useGetSessionQuery: () => ({
    ...mocks.session,
    refetch: mocks.refetch,
  }),
  useLoginMutation: () => [
    mocks.loginMutation,
    {
      isLoading: false,
      isSuccess: false,
      isError: false,
      reset: mocks.resetLogin,
    },
  ],
  useLogoutMutation: () => [
    mocks.logoutMutation,
    {
      isLoading: false,
      isError: false,
      reset: mocks.resetLogout,
    },
  ],
}));

let user: AuthState['user'];
let isAuthenticated: AuthState['isAuthenticated'];
let error: AuthOperationsContextValue['error'];
let login: AuthOperationsContextValue['login'];
let logout: AuthOperationsContextValue['logout'];
let refresh: AuthOperationsContextValue['refresh'];
let expireSession: AuthOperationsContextValue['expireSession'];

function Consumer(): React.ReactNode {
  user = useAuth('AuthProviderTest', (state) => state.user, true);
  isAuthenticated = useAuth('AuthProviderTest', (state) => state.isAuthenticated, true);
  error = useAuthOperations('AuthProviderTest', (state) => state.error, true);
  login = useAuthOperations('AuthProviderTest', (state) => state.login, true);
  logout = useAuthOperations('AuthProviderTest', (state) => state.logout, true);
  refresh = useAuthOperations('AuthProviderTest', (state) => state.refresh, true);
  expireSession = useAuthOperations('AuthProviderTest', (state) => state.expireSession, true);

  return null;
}

function renderProvider() {
  renderToStaticMarkup(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  );
}

describe('AuthProvider contracts', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.data = { id: 7 };
    mocks.session.isFetching = false;
    mocks.session.isSuccess = true;
    mocks.session.isError = false;
    vi.stubGlobal('window', {
      location: {
        search: '',
        assign: vi.fn(),
        replace: vi.fn(),
      },
    });
  });

  it('selects the query user and hides it during loading or a failed check', () => {
    renderProvider();
    expect(user).toEqual({ id: 7 });
    expect(isAuthenticated).toBe(true);

    mocks.session.isFetching = true;
    renderProvider();
    expect(user).toBeNull();
    expect(isAuthenticated).toBe(false);

    mocks.session.isFetching = false;
    mocks.session.isSuccess = false;
    mocks.session.isError = true;
    renderProvider();
    expect(user).toBeNull();
    expect(isAuthenticated).toBe(false);
    expect(error).toContain('Could not check your session');
  });

  it('reports a confirmed signed-out session as unauthenticated', () => {
    mocks.session.data = null;
    renderProvider();

    expect(user).toBeNull();
    expect(isAuthenticated).toBe(false);
    expect(error).toBeNull();
  });

  it('navigates to the validated login result without logging out', async () => {
    mocks.loginMutation.mockResolvedValue({ data: 'https://identity.example/authorize' });
    renderProvider();

    await login();

    expect(window.location.assign).toHaveBeenCalledWith('https://identity.example/authorize');
    expect(mocks.logoutMutation).not.toHaveBeenCalled();
  });

  it('keeps the document and cache on failed logout and permits retry', async () => {
    mocks.logoutMutation.mockResolvedValueOnce({ error: { status: 503 } });
    mocks.logoutMutation.mockResolvedValueOnce({ data: undefined });
    renderProvider();

    await logout();

    expect(mocks.dispatch).not.toHaveBeenCalled();
    expect(window.location.replace).not.toHaveBeenCalled();
    expect(mocks.enqueueSnackbar).toHaveBeenCalledWith(
      'Could not sign out. Please try again.',
      { variant: 'error' }
    );

    await logout();

    expect(mocks.dispatch).toHaveBeenCalledWith({ type: 'feedApi/resetApiState' });
    expect(window.location.replace).toHaveBeenCalledWith('/');
    // The successful path replaces the document; it must not enqueue into it.
    expect(mocks.enqueueSnackbar).toHaveBeenCalledTimes(1);
  });

  it('retires the document on authoritative project expiry without a logout mutation', () => {
    renderProvider();

    expireSession();

    expect(mocks.dispatch).toHaveBeenCalledWith({ type: 'feedApi/resetApiState' });
    expect(window.location.replace).toHaveBeenCalledWith('/');
    expect(mocks.logoutMutation).not.toHaveBeenCalled();
  });

  it('refreshes the existing query and clears obsolete mutation errors', async () => {
    renderProvider();

    await refresh();

    expect(mocks.refetch).toHaveBeenCalledOnce();
    expect(mocks.resetLogin).toHaveBeenCalledOnce();
    expect(mocks.resetLogout).toHaveBeenCalledOnce();
  });

  it('reports the named consumer when the required provider is missing', () => {
    expect(() => renderToStaticMarkup(<Consumer />)).toThrow(
      '`AuthProviderTest` must be used within `Auth`'
    );
  });
});
