import { matchesSchema, type Schema } from '../transport/schema';

// Client wire shapes deliberately do not import server types.
export type User = { id: number };
const sessionSchema: Schema = { type: 'object', required: ['user'], additionalProperties: false, properties: {
  user: { type: 'object', required: ['id'], additionalProperties: false, properties: { id: { type: 'integer' } } },
} };
const loginSchema: Schema = { type: 'object', required: ['authorizationUrl'], additionalProperties: false, properties: { authorizationUrl: { type: 'string' } } };

export type AuthApi = {
  currentSession(signal: AbortSignal): Promise<User | null>;
  beginLogin(signal: AbortSignal): Promise<string>;
  logout(signal: AbortSignal): Promise<void>;
};
export function createAuthApi(request: typeof fetch = fetch): AuthApi {
  return {
    async currentSession(signal) {
      const response = await request('/api/session', { credentials: 'same-origin', cache: 'no-store', signal });
      if (response.status === 401) return null;
      if (response.status !== 200) throw new Error('Authentication unavailable');
      const body: unknown = await response.json();
      if (!matchesSchema(body, sessionSchema)) throw new Error('Invalid session response');
      return (body as { user: User }).user;
    },
    async beginLogin(signal) {
      const response = await request('/auth/login?returnTo=%2F', { credentials: 'same-origin', cache: 'no-store', headers: { accept: 'application/json' }, signal });
      if (response.status !== 200) throw new Error('Authentication unavailable');
      const body: unknown = await response.json();
      if (!matchesSchema(body, loginSchema)) throw new Error('Invalid login response');
      const url = new URL((body as { authorizationUrl: string }).authorizationUrl);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid login response');
      return url.href;
    },
    async logout(signal) {
      const response = await request('/auth/logout', { method: 'POST', credentials: 'same-origin', signal });
      if (response.status !== 204 && response.status !== 401) throw new Error('Sign-out unavailable');
    },
  };
}
