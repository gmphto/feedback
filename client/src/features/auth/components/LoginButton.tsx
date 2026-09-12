import * as React from 'react';
import { Button } from '@mui/material';

import { useAuth } from '../state/AuthProvider';

export function LoginButton() {
  const login = useAuth('LoginButton', (state) => state.login, true);

  const handleLogin = React.useCallback(() => {
    void login();
  }, [login]);

  return (
    <Button
      type="button"
      variant="contained"
      onClick={handleLogin}
    >
      Sign in
    </Button>
  );
}
