import * as React from 'react';

interface FocusSessionRevalidationParameters {
  /**
   * True while a session check, login or logout is already in flight.
   * Only in-flight work suppresses a re-check; a previous failure must not,
   * because a focus event is the recovery path.
   */
  isAuthOperationPending: boolean;

  /** Re-checks the session. Must be referentially stable. */
  revalidateSession: () => Promise<void>;
}

export function useFocusSessionRevalidation({
  isAuthOperationPending,
  revalidateSession,
}: FocusSessionRevalidationParameters): void {
  React.useEffect(() => {
    function handleFocus() {
      if (isAuthOperationPending) {
        return;
      }

      void revalidateSession();
    }

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthOperationPending, revalidateSession]);
}
