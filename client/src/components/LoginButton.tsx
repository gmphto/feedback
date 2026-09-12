import * as React from 'react';
import { Button } from '@mui/material';

import { useAuth } from '../auth/contexts/AuthProvider';

export function LoginButton() {
  const login = useAuth((state) => state.login, true);
  // const isLoadingUser = useAuthOperations('LoginButton', (state) => state.isLoadingUser, true);
  // const isLoggingIn = useAuthOperations('LoginButton', (state) => state.isLoggingIn, true);
  // const isLoggingOut = useAuthOperations('LoginButton', (state) => state.isLoggingOut, true);

  const handleLogin = React.useCallback(() => {
    void login();
  }, [login]);

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoadingUser || isLoggingIn || isLoggingOut}
    >
      {isLoggingIn ? 'Opening secure sign-in…' : 'Sign in'}
    </Button>
  );
}
