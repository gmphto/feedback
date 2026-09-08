import type { AuthModel } from './model';

export interface SignOutRequest {
  snapshot: ReturnType<AuthModel['store']['getState']>;
  generation: number;
}

export function requestSignOut(model: AuthModel, request: SignOutRequest) {
  if (request.snapshot.status !== 'signed-in') {
    return;
  }

  if (model.getGeneration() !== request.generation || model.store.getState() !== request.snapshot) {
    return;
  }

  model.signOut();
}
