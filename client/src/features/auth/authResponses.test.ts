import { describe, expect, it } from 'vitest';

import {
  readLoginResponse,
  readLogoutResponse,
  readSessionResponse,
} from './authResponses';

describe('authentication response contracts', () => {
  it('accepts a session user and treats 401 as signed out', async () => {
    await expect(readSessionResponse(Response.json({ user: { id: 7 } }))).resolves.toEqual({ id: 7 });
    await expect(readSessionResponse(new Response(null, { status: 401 }))).resolves.toBeNull();
  });

  it('rejects malformed sessions and server failures', async () => {
    await expect(readSessionResponse(Response.json({ user: { id: '7' } }))).rejects.toThrow('Invalid session response');
    await expect(readSessionResponse(Response.json({ user: { id: 7 }, token: 'unexpected' }))).rejects.toThrow('Invalid session response');
    await expect(readSessionResponse(new Response(null, { status: 503 }))).rejects.toThrow('Authentication unavailable');
  });

  it('accepts the validated server login destination', async () => {
    const response = Response.json({ authorizationUrl: 'https://identity.example/authorize?state=example' });

    await expect(readLoginResponse(response)).resolves.toBe('https://identity.example/authorize?state=example');
  });

  it.each([
    'javascript:alert(1)',
    'https://user:password@identity.example/authorize',
    'not a URL',
  ])('rejects an unsafe or malformed login destination: %s', async (authorizationUrl) => {
    await expect(readLoginResponse(Response.json({ authorizationUrl }))).rejects.toThrow();
  });

  it('rejects missing login fields and failed login responses', async () => {
    await expect(readLoginResponse(Response.json({}))).rejects.toThrow('Invalid login response');
    await expect(readLoginResponse(new Response(null, { status: 503 }))).rejects.toThrow('Authentication unavailable');
  });

  it('accepts logout 204 or 401 and rejects failure', async () => {
    await expect(readLogoutResponse(new Response(null, { status: 204 }))).resolves.toBeUndefined();
    await expect(readLogoutResponse(new Response(null, { status: 401 }))).resolves.toBeUndefined();
    await expect(readLogoutResponse(new Response(null, { status: 500 }))).rejects.toThrow('Sign-out unavailable');
  });
});