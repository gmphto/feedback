import type { ConfirmationContent } from '../providers/confirmation';

export const signOutConfirmation: ConfirmationContent = {
  title: 'Sign out of this app?',
  description: 'This ends your application session. Unsaved local project changes will be discarded.',
  confirmLabel: 'Sign out',
  intent: 'danger',
};
