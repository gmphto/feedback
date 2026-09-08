import { describe, expect, it, vi } from 'vitest';
import { createAuthApi } from './api';
import { createAuthModel } from './model';
import { requestSignOut, type SignOutRequest } from './signOut';

const settle = () => new Promise(resolve => setTimeout(resolve, 0));

async function setup() {
  const request = vi.fn<typeof fetch>().mockResolvedValue(new Response('{"user":{"id":42}}'));
  const notify = vi.fn();
  const model = createAuthModel(createAuthApi(request), () => {}, false, notify);
  model.refresh();
  await settle();
  request.mockClear();

  const signOutRequest: SignOutRequest = {
    snapshot: model.store.getState(),
    generation: model.getGeneration(),
  };
  return { request, model, notify, signOutRequest };
}

describe('confirmed application sign-out', () => {
  it.each([204, 503])('sends one POST and reports the %i outcome', async status => {
    const { request, model, notify, signOutRequest } = await setup();
    request.mockResolvedValue(new Response(null, { status }));

    requestSignOut(model, signOutRequest);
    requestSignOut(model, signOutRequest);
    await settle();

    expect(request).toHaveBeenCalledOnce();
    expect(request).toHaveBeenCalledWith('/auth/logout', expect.objectContaining({ method: 'POST' }));
    expect(model.store.getState().status).toBe(status === 204 ? 'signed-out' : 'failure');
    expect(notify).toHaveBeenCalledExactlyOnceWith(status === 204 ? 'success' : 'failure');
    model.dispose();
  });

  it.each(['pause', 'dispose', 'refresh'] as const)('ignores a confirmation after auth %s', async action => {
    const { request, model, signOutRequest } = await setup();
    model[action]();
    requestSignOut(model, signOutRequest);
    await settle();

    expect(request.mock.calls.some(([url]) => url === '/auth/logout')).toBe(false);
    model.dispose();
  });

  it('ignores a changed snapshot even when its generation matches', async () => {
    const { request, model, signOutRequest } = await setup();
    requestSignOut(model, { ...signOutRequest, snapshot: { ...signOutRequest.snapshot } });
    expect(request).not.toHaveBeenCalled();
    model.dispose();
  });

  it('does not sign out a session that was not signed in when the dialog opened', async () => {
    const { request, model } = await setup();
    model.cancel();
    requestSignOut(model, { snapshot: model.store.getState(), generation: model.getGeneration() });
    expect(request).not.toHaveBeenCalled();
    model.dispose();
  });

  it('ignores aborted late outcomes and isolates feedback failure from logout success', async () => {
    const { request, model, notify, signOutRequest } = await setup();
    let finish!: (response: Response) => void;
    request.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    requestSignOut(model, signOutRequest);
    model.pause();
    finish(new Response(null, { status: 204 }));
    await settle();
    expect(notify).not.toHaveBeenCalled();
    model.dispose();

    const api = createAuthApi(vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 })));
    const other = createAuthModel(api, () => {}, false, () => { throw new Error('Feedback unavailable'); });
    other.signOut();
    await settle();
    expect(other.store.getState().status).toBe('signed-out');
    other.dispose();
  });
});
