import * as React from 'react';
import { Button } from '@mui/material';

import { MessageBox } from '../shared/ui/MessageBox';
import { useAuth, useAuthOperations } from '../auth/contexts/AuthProvider';

const signOutConfirmation = {
  title: 'Sign out of this app?',
  description: 'This ends your application session. Unsaved local project changes will be discarded.',
  confirmLabel: 'Sign out',
  intent: 'danger',
};

export function LogoutButton() {
  const user = useAuth('LogoutButton', (state) => state.user, true);
  const logout = useAuthOperations('LogoutButton', (state) => state.logout, true);
  // const isLoadingUser = useAuthOperations('LogoutButton', (state) => state.isLoadingUser, true);
  // const isLoggingIn = useAuthOperations('LogoutButton', (state) => state.isLoggingIn, true);
  // const isLoggingOut = useAuthOperations('LogoutButton', (state) => state.isLoggingOut, true);
  const [isConfirmationOpen, setConfirmationOpen] = React.useState(false);
  const cancelButtonRef = React.useRef<HTMLButtonElement>(null);
  const isDisabled = !user || isLoadingUser || isLoggingIn || isLoggingOut;

  const handleOpenConfirmation = React.useCallback(() => {
    setConfirmationOpen(true);
  }, []);

  const handleCancelLogout = React.useCallback(() => {
    setConfirmationOpen(false);
  }, []);

  const handleEntered = React.useCallback(() => {
    cancelButtonRef.current?.focus();
  }, []);

  const handleConfirmLogout = React.useCallback(() => {
    setConfirmationOpen(false);

    if (!isDisabled) {
      void logout();
    }
  }, [isDisabled, logout]);

  React.useEffect(() => {
    setConfirmationOpen(false);
  }, [user?.id, isLoadingUser]);

  const confirmationActions = (
    <>
      <Button
        ref={cancelButtonRef}
        autoFocus
        onClick={handleCancelLogout}
      >
        Cancel
      </Button>
      <Button
        color="error"
        variant="contained"
        disabled={isDisabled}
        onClick={handleConfirmLogout}
      >
        {signOutConfirmation.confirmLabel}
      </Button>
    </>
  );

  return (
    <>
      <Button disabled={isDisabled} onClick={handleOpenConfirmation}>
        {isLoggingOut ? 'Ending this application session…' : 'Sign out of this app'}
      </Button>
      <MessageBox
        open={isConfirmationOpen}
        title={signOutConfirmation.title}
        onClose={handleCancelLogout}
        onEntered={handleEntered}
        footer={confirmationActions}
      >
        <p>{signOutConfirmation.description}</p>
      </MessageBox>
    </>
  );
}
