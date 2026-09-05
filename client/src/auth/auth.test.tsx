import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { createAuthApi, type AuthApi } from './api';
import { createAuthModel, observeSession } from './model';
import { AuthView } from '../app/App';

const settle = () => new Promise(resolve => setTimeout(resolve, 0));
function fakeApi(): AuthApi {
  return { currentSession: async () => null, beginLogin: async () => 'https://identity.example/authorize', logout: async () => {} };
}

describe('authentication API facade', () => {
  it('validates exact session wire shape and treats 401 as signed out', async () => {
    const request = vi.fn<typeof fetch>();
    const api = createAuthApi(request);
    const signal = new AbortController().signal;
    request.mockResolvedValueOnce(new Response(JSON.stringify({ user: { id: 42 } })));
    expect(await api.currentSession(signal)).toEqual({ id: 42 });
    expect(request).toHaveBeenLastCalledWith('/api/session', expect.objectContaining({ credentials: 'same-origin', signal }));
    request.mockResolvedValueOnce(new Response('{"error":"unauthorized"}', { status: 401 }));
    expect(await api.currentSession(signal)).toBeNull();
    for (const body of [{ user: { id: '42' } }, { user: { id: 42 }, token: 'private' }, { user: { id: 1.5 } }, { user: null }]) {
      request.mockResolvedValueOnce(new Response(JSON.stringify(body)));
      await expect(api.currentSession(signal)).rejects.toThrow();
    }
    request.mockResolvedValueOnce(new Response('{}', { status: 503 }));
    await expect(api.currentSession(signal)).rejects.toThrow('Authentication unavailable');
  });
  it('requests JSON sign-in, validates navigation URLs and ends only the app session', async () => {
    const request = vi.fn<typeof fetch>(); const api = createAuthApi(request); const signal = new AbortController().signal;
    request.mockResolvedValueOnce(new Response('{"authorizationUrl":"https://identity.example/authorize"}'));
    expect(await api.beginLogin(signal)).toBe('https://identity.example/authorize');
    expect(request).toHaveBeenLastCalledWith('/auth/login?returnTo=%2F', expect.objectContaining({ headers: { accept: 'application/json' } }));
    request.mockResolvedValueOnce(new Response('{"authorizationUrl":"javascript:alert(1)"}'));
    await expect(api.beginLogin(signal)).rejects.toThrow();
    request.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await api.logout(signal);
    expect(request).toHaveBeenLastCalledWith('/auth/logout', { method: 'POST', credentials: 'same-origin', signal });
  });
});

describe('authentication listener state', () => {
  it('isolates listeners and subscriptions and ignores paused or disposed late completions', async () => {
    const api = fakeApi(); const navigate = vi.fn();
    let complete!: (url: string) => void;
    let signal!: AbortSignal;
    api.beginLogin = vi.fn<AuthApi['beginLogin']>(current => { signal = current; return new Promise(resolve => { complete = resolve; }); });
    const first = createAuthModel(api, navigate);
    const secondApi = fakeApi(); secondApi.currentSession = vi.fn(async () => ({ id: 2 }));
    const second = createAuthModel(secondApi, () => {});
    const observed = vi.fn(); const unsubscribe = second.store.subscribe(observed);
    first.signIn(); first.pause(); expect(signal.aborted).toBe(true);
    complete('https://identity.example/late'); await settle(); expect(navigate).not.toHaveBeenCalled();
    first.signIn(); first.dispose(); expect(signal.aborted).toBe(true);
    complete('https://identity.example/disposed');
    const snapshot = first.store.getState();
    second.refresh(); await settle();
    expect(first.store.getState()).toBe(snapshot);
    expect(second.store.getState().user).toEqual({ id: 2 });
    expect(secondApi.currentSession).toHaveBeenCalledOnce();
    expect(observed).toHaveBeenCalledTimes(2);
    expect(navigate).not.toHaveBeenCalled();
    first.signIn(); expect(api.beginLogin).toHaveBeenCalledTimes(2);
    unsubscribe(); second.dispose();
  });
  it('moves through signed-out, pending, signed-in and logout without provider tokens', async () => {
    const api = fakeApi(); const navigate = vi.fn(); const model = createAuthModel(api, navigate);
    model.refresh(); expect(model.store.getState().status).toBe('pending');
    await settle(); expect(model.store.getState().status).toBe('signed-out');
    model.signIn(); await settle(); expect(navigate).toHaveBeenCalledWith('https://identity.example/authorize');
    expect(model.store.getState().status).toBe('pending');
    api.currentSession = async () => ({ id: 42 });
    model.refresh(); await settle(); expect(model.store.getState().user).toEqual({ id: 42 });
    expect(model.store.getState().status).toBe('signed-in');
    model.signOut(); await settle(); expect(model.store.getState().status).toBe('signed-out');
    expect(model.store.getState().user).toBeNull(); model.dispose();
  });
  it('401 clears signed-in state and service failures render generic retry, never raw errors', async () => {
    const api = fakeApi(); api.currentSession = async () => ({ id: 4 });
    const model = createAuthModel(api, () => {});
    model.refresh(); await settle(); expect(model.store.getState().status).toBe('signed-in');
    api.currentSession = async () => null;
    model.refresh(); await settle(); expect(model.store.getState().status).toBe('signed-out');
    api.beginLogin = async () => { throw new Error('private-provider-token'); };
    model.signIn(); await settle();
    expect(model.store.getState().status).toBe('failure');
    const markup = renderToStaticMarkup(<AuthView model={model} />);
    expect(markup).not.toContain('private-provider-token'); model.dispose();
  });
  it('cancellation and superseding requests abort effects and ignore late results', async () => {
    const api = fakeApi(); let finish: (user: { id: number }) => void = () => {};
    let signal: AbortSignal | undefined;
    api.currentSession = async current => { signal = current; return new Promise(resolve => { finish = resolve; }); };
    const model = createAuthModel(api, () => {});
    model.refresh(); model.cancel(); expect(signal!.aborted).toBe(true);
    finish({ id: 9 }); await settle(); expect(model.store.getState().status).toBe('signed-out');
    model.refresh(); const old = finish;
    api.currentSession = async () => null; model.refresh(); old({ id: 7 }); await settle();
    expect(model.store.getState().status).toBe('signed-out'); expect(model.store.getState().user).toBeNull(); model.dispose();
  });
  it('callback failure immediately exposes accessible retry controls', () => {
    const model = createAuthModel(fakeApi(), () => {}, true);
    const markup = renderToStaticMarkup(<AuthView model={model} />);
    expect(markup).toContain('aria-live="polite"'); expect(markup).toContain('<button');
    expect(markup).toContain('Try sign-in again'); expect(markup).toContain('role="alert"');
    expect(markup).toContain('Check session again'); model.dispose();
  });
  it('StrictMode effect replay and focus preserve callback failure until explicit retry', async () => {
    const api = fakeApi(); api.currentSession = vi.fn(async () => null);
    const model = createAuthModel(api, () => {}, true);
    const browser = new EventTarget();
    // This is the exact setup/cleanup function used by App's React effect.
    const firstCleanup = observeSession(model, browser); firstCleanup();
    const cleanup = observeSession(model, browser);
    browser.dispatchEvent(new Event('focus')); await settle();
    expect(api.currentSession).not.toHaveBeenCalled();
    expect(model.store.getState().status).toBe('failure');
    expect(renderToStaticMarkup(<AuthView model={model} />)).toContain('Try sign-in again');
    model.refresh(); await settle();
    expect(api.currentSession).toHaveBeenCalledOnce();
    expect(model.store.getState().status).toBe('signed-out');
    cleanup(); model.dispose();
  });
  it('effect replay restarts pending checks and focus still invalidates a signed-in session on 401', async () => {
    const api = fakeApi(); api.currentSession = async () => ({ id: 5 });
    const model = createAuthModel(api, () => {}); const browser = new EventTarget();
    observeSession(model, browser)();
    const cleanup = observeSession(model, browser); await settle();
    expect(model.store.getState().status).toBe('signed-in');
    api.currentSession = async () => null;
    browser.dispatchEvent(new Event('focus')); await settle();
    expect(model.store.getState().status).toBe('signed-out');
    expect(model.store.getState().user).toBeNull(); cleanup(); model.dispose();
  });
});
