// Client wire shapes deliberately do not import server types.
export type User = { id: number };
type PrimitiveSchema = { type: 'integer' } | { type: 'string' };
type Schema = { type: 'object'; required: string[]; additionalProperties: false; properties: Record<string, Schema | PrimitiveSchema> };
const sessionSchema: Schema = { type: 'object', required: ['user'], additionalProperties: false, properties: {
  user: { type: 'object', required: ['id'], additionalProperties: false, properties: { id: { type: 'integer' } } },
} };
const loginSchema: Schema = { type: 'object', required: ['authorizationUrl'], additionalProperties: false, properties: { authorizationUrl: { type: 'string' } } };

// Small JSON Schema subset for these two owned transport contracts.
function matches(value: unknown, schema: Schema | PrimitiveSchema): boolean {
  if (schema.type === 'integer') return typeof value === 'number' && Number.isSafeInteger(value);
  if (schema.type === 'string') return typeof value === 'string';
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const object = value as Record<string, unknown>;
  return schema.required.every(key => Object.hasOwn(object, key))
    && Object.keys(object).every(key => Object.hasOwn(schema.properties, key) && matches(object[key], schema.properties[key]));
}

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
      if (!matches(body, sessionSchema)) throw new Error('Invalid session response');
      return (body as { user: User }).user;
    },
    async beginLogin(signal) {
      const response = await request('/auth/login?returnTo=%2F', { credentials: 'same-origin', cache: 'no-store', headers: { accept: 'application/json' }, signal });
      if (response.status !== 200) throw new Error('Authentication unavailable');
      const body: unknown = await response.json();
      if (!matches(body, loginSchema)) throw new Error('Invalid login response');
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
