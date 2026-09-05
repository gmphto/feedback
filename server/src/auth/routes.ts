import cookie from '@fastify/cookie';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { allowsBrowserMutation, safeReturnPath } from './policy.js';
import { beginLogin, finishLogin, type AuthDependencies } from './service.js';

const errorSchema = (error: string) => ({ type: 'object', additionalProperties: false, required: ['error'], properties: { error: { const: error, type: 'string' } } });
const unavailable = (reply: FastifyReply) => reply.code(503).send({ error: 'authentication_unavailable' });
function cookieSettings(auth: AuthDependencies) {
  return { httpOnly: true, secure: auth.configuration.secureCookies, sameSite: 'lax' as const, path: '/' };
}
function sessionCookie(auth?: AuthDependencies) { return auth?.configuration.secureCookies ? '__Host-scope_session' : 'scope_session'; }
function loginCookie(auth: AuthDependencies) { return auth.configuration.secureCookies ? '__Host-scope_login' : 'scope_login'; }

// Future protected routes use this same guard and never interpret cookies alone.
export async function requireSession(request: FastifyRequest, reply: FastifyReply, auth?: AuthDependencies) {
  if (!auth) { unavailable(reply); return undefined; }
  try {
    const user = await auth.repository.findSession(request.cookies[sessionCookie(auth)]);
    if (user) return user;
    reply.clearCookie(sessionCookie(auth), cookieSettings(auth));
    reply.code(401).send({ error: 'unauthorized' });
  } catch { unavailable(reply); }
  return undefined;
}

export async function registerAuth(app: FastifyInstance, auth?: AuthDependencies) {
  await app.register(cookie);
  app.addHook('onRequest', async (request, reply) => {
    if (request.url.startsWith('/auth/') || request.url.startsWith('/api/session') || request.url.startsWith('/api/projects')) reply.header('cache-control', 'no-store');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)
      && (!auth || !allowsBrowserMutation(request.headers.origin, auth.configuration.applicationOrigin))) {
      return reply.code(403).send({ error: 'forbidden' });
    }
  });
  app.get<{ Querystring: { returnTo?: string } }>('/auth/login', {
    attachValidation: true,
    schema: { querystring: { type: 'object', properties: { returnTo: { type: 'string' } } }, response: {
      200: { type: 'object', additionalProperties: false, required: ['authorizationUrl'], properties: { authorizationUrl: { type: 'string' } } },
      503: errorSchema('authentication_unavailable'),
    } },
  }, async (request, reply) => {
    if (!auth) return unavailable(reply);
    try {
      const login = await beginLogin(auth, safeReturnPath(request.validationError ? undefined : request.query.returnTo));
      reply.setCookie(loginCookie(auth), login.browser, { ...cookieSettings(auth), expires: login.expiresAt });
      if (request.headers.accept === 'application/json') return { authorizationUrl: login.url };
      return reply.redirect(login.url);
    } catch { return unavailable(reply); }
  });
  app.get('/auth/callback', {
    attachValidation: true,
    schema: { querystring: { type: 'object', properties: { state: { type: 'string' }, code: { type: 'string' }, error: { type: 'string' } } } },
  }, async (request, reply) => {
    if (auth) reply.clearCookie(loginCookie(auth), cookieSettings(auth));
    if (auth && !request.validationError) {
      try {
        const query = request.url.includes('?') ? request.url.slice(request.url.indexOf('?')) : '';
        const login = await finishLogin(auth, new URL(`${auth.configuration.callbackUrl}${query}`), request.cookies[loginCookie(auth)]);
        if (login) {
          reply.setCookie(sessionCookie(auth), login.identifier, { ...cookieSettings(auth), expires: login.expiresAt });
          return reply.redirect(login.returnPath);
        }
      } catch { /* Generic retry path; no provider/database details in logs or response. */ }
    }
    return reply.redirect('/?authError=1');
  });
  app.get('/api/session', {
    schema: { response: {
      200: { type: 'object', additionalProperties: false, required: ['user'], properties: { user: { type: 'object', additionalProperties: false, required: ['id'], properties: { id: { type: 'integer' } } } } },
      401: errorSchema('unauthorized'), 503: errorSchema('authentication_unavailable'),
    } },
  }, async (request, reply) => {
    const user = await requireSession(request, reply, auth);
    if (user) return { user };
  });
  app.post('/auth/logout', async (request, reply) => {
    if (!auth) return unavailable(reply);
    try {
      await auth.repository.revokeSession(request.cookies[sessionCookie(auth)]);
      reply.clearCookie(sessionCookie(auth), cookieSettings(auth));
      return reply.code(204).send();
    } catch { return unavailable(reply); }
  });
}
