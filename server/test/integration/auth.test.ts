import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { test, type TestContext } from 'node:test';
import { sql } from 'kysely';
import { createDatabase } from '../../src/db/database.js';
import { readDatabaseConfiguration } from '../../src/db/configuration.js';
import { runMigrations } from '../../src/db/migrate.js';
import { createAuthRepository, opaqueIdentifier } from '../../src/auth/repository.js';
import { buildApp } from '../../src/app.js';
import { buildProductionApp } from '../../src/production-app.js';
import { fakeProvider, type ProviderMode } from '../support/oidc-provider.js';
import { LOGIN_LIFETIME_MS, SESSION_LIFETIME_MS } from '../../src/auth/policy.js';

const config = readDatabaseConfiguration(process.env.TEST_DATABASE_URL, 'TEST_DATABASE_URL');
if (!config.valid) throw new Error(config.message);
const testUrl = config.connectionString;

async function setup(t: TestContext, secure = false) {
  const admin = createDatabase(testUrl);
  const name = `scope_test_${Date.now()}_${randomBytes(6).toString('hex')}`;
  let created = false;
  let db: ReturnType<typeof createDatabase> | undefined;
  t.after(async () => {
    await db?.destroy();
    try { if (created) await sql`drop database ${sql.id(name)}`.execute(admin); }
    finally { await admin.destroy(); }
  });
  await sql`create database ${sql.id(name)}`.execute(admin); created = true;
  const url = new URL(testUrl); url.pathname = `/${name}`;
  db = createDatabase(url.href);
  assert.equal(await runMigrations(url.href), 0);
  const provider = await fakeProvider(t, secure);
  let now = new Date();
  const repository = createAuthRepository(db, () => now);
  let logs = '';
  const app = buildApp({ auth: { configuration: provider.config, repository, provider: provider.provider }, logStream: { write(message) { logs += message; } } });
  t.after(() => app.close());
  return { app, db, repository, ...provider, advance(ms: number) { now = new Date(now.getTime() + ms); }, logs: () => logs };
}

function cookies(response: { headers: Record<string, unknown> }) {
  const value = response.headers['set-cookie'];
  return (Array.isArray(value) ? value : typeof value === 'string' ? [value] : []) as string[];
}
function activeCookie(response: { headers: Record<string, unknown> }, name: string) {
  return cookies(response).find(value => value.startsWith(`${name}=`) && !value.startsWith(`${name}=;`))?.split(';')[0];
}
async function login(context: Awaited<ReturnType<typeof setup>>, returnTo = '/projects') {
  const start = await context.app.inject(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  assert.equal(start.statusCode, 302);
  const browser = activeCookie(start, context.config.secureCookies ? '__Host-scope_login' : 'scope_login')!;
  assert.ok(browser);
  const authorization = new URL(start.headers.location!);
  assert.equal(authorization.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(authorization.searchParams.get('scope'), 'openid');
  const response = await fetch(authorization, { redirect: 'manual' });
  const callback = new URL(response.headers.get('location')!);
  return { browser, callback: `${callback.pathname}${callback.search}`, start };
}

test('signed fake OIDC exchange creates a persisted user/session and secure opaque cookie, then logout revokes replay', async t => {
  const context = await setup(t, true);
  const attempt = await login(context);
  const response = await context.app.inject({ url: attempt.callback, headers: { cookie: attempt.browser, host: 'attacker.example', 'x-forwarded-host': 'attacker.example' } });
  assert.equal(response.statusCode, 302); assert.equal(response.headers.location, '/projects');
  const session = activeCookie(response, '__Host-scope_session')!;
  assert.match(session, /^__Host-scope_session=[\w-]{43}$/);
  const raw = cookies(response).find(value => value.startsWith('__Host-scope_session='))!;
  for (const attribute of ['HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/']) assert.ok(raw.includes(attribute));
  const persisted = (await sql<{ expires_at: Date }>`select * from application_sessions`.execute(context.db)).rows;
  assert.equal(persisted.length, 1);
  const cookieExpiry = new Date(raw.match(/Expires=([^;]+)/)![1]);
  assert.ok(cookieExpiry.getTime() <= persisted[0]!.expires_at.getTime());
  assert.doesNotMatch(JSON.stringify(persisted), new RegExp(session.split('=')[1]!));
  const current = await context.app.inject({ url: '/api/session', headers: { cookie: session } });
  assert.equal(current.statusCode, 200);
  assert.match(current.headers['content-type']!, /application\/json/);
  assert.deepEqual(current.json(), { user: { id: 1 } });
  assert.equal(current.headers['cache-control'], 'no-store');
  for (const origin of [undefined, 'null', 'https://attacker.example', 'https://app.example/']) {
    const logout = await context.app.inject({ method: 'POST', url: '/auth/logout', headers: { cookie: session, ...(origin ? { origin } : {}) } });
    assert.equal(logout.statusCode, 403); assert.deepEqual(logout.json(), { error: 'forbidden' });
    assert.equal((await context.app.inject({ url: '/api/session', headers: { cookie: session } })).statusCode, 200);
  }
  const logout = await context.app.inject({ method: 'POST', url: '/auth/logout', headers: { cookie: session, origin: context.config.applicationOrigin } });
  assert.equal(logout.statusCode, 204); assert.equal(logout.body, '');
  assert.ok(cookies(logout).some(value => value.startsWith('__Host-scope_session=;')));
  assert.equal((await context.app.inject({ url: '/api/session', headers: { cookie: session } })).statusCode, 401);
  assert.equal((await context.app.inject({ method: 'POST', url: '/auth/logout', headers: { origin: context.config.applicationOrigin } })).statusCode, 204);
  assert.equal(context.fixture.verifiedPkce, 1);
  assert.doesNotMatch(context.logs(), /code-|private-|fixture-secret/);
});

test('missing, malformed, unknown and expired sessions have identical cleared-cookie 401 responses', async t => {
  const context = await setup(t);
  const session = await context.repository.createSession({ issuer: context.config.issuer, subject: 'alice' });
  context.advance(SESSION_LIFETIME_MS);
  for (const value of [undefined, 'bad', opaqueIdentifier(), session.identifier]) {
    const response = await context.app.inject({ url: '/api/session', headers: value ? { cookie: `scope_session=${value}` } : {} });
    assert.equal(response.statusCode, 401); assert.deepEqual(response.json(), { error: 'unauthorized' });
    assert.ok(cookies(response).some(value => value.startsWith('scope_session=;')));
  }
});

test('unsafe return paths fall back locally and development HTTP cookies explicitly omit Secure', async t => {
  const context = await setup(t);
  const attempt = await login(context, '//attacker.example');
  const response = await context.app.inject({ url: attempt.callback, headers: { cookie: attempt.browser } });
  assert.equal(response.headers.location, '/');
  assert.ok(activeCookie(response, 'scope_session'));
  assert.ok(cookies(response).every(value => !value.includes('Secure')));
});

test('JSON sign-in supports retryable client navigation and PKCE rejects a tampered verifier', async t => {
  const context = await setup(t);
  const start = await context.app.inject({ url: '/auth/login', headers: { accept: 'application/json' } });
  assert.equal(start.statusCode, 200);
  assert.deepEqual(Object.keys(start.json()), ['authorizationUrl']);
  assert.equal(start.headers['cache-control'], 'no-store');
  const provider = await fetch(start.json().authorizationUrl, { redirect: 'manual' });
  const callback = new URL(provider.headers.get('location')!);
  await sql`update login_transactions set verifier = ${opaqueIdentifier()}`.execute(context.db);
  const response = await context.app.inject({ url: `${callback.pathname}${callback.search}`, headers: { cookie: activeCookie(start, 'scope_login')! } });
  assert.equal(response.headers.location, '/?authError=1');
  assert.equal((await sql`select * from application_sessions`.execute(context.db)).rows.length, 0);
  assert.equal(context.fixture.verifiedPkce, 0);
});

test('browser binding, missing/invalid state, expiry and concurrent callback replay cannot create extra sessions', async t => {
  const context = await setup(t);
  const attempt = await login(context);
  for (const request of [
    { url: attempt.callback },
    { url: attempt.callback, headers: { cookie: `scope_login=${opaqueIdentifier()}` } },
    { url: '/auth/callback?code=bad', headers: { cookie: attempt.browser } },
    { url: '/auth/callback?state=bad&code=bad', headers: { cookie: attempt.browser } },
  ]) {
    const response = await context.app.inject(request);
    assert.equal(response.headers.location, '/?authError=1');
    assert.equal(activeCookie(response, 'scope_session'), undefined);
  }
  assert.equal((await sql`select * from application_sessions`.execute(context.db)).rows.length, 0);
  const callbacks = await Promise.all(Array.from({ length: 6 }, () => context.app.inject({ url: attempt.callback, headers: { cookie: attempt.browser } })));
  assert.equal(callbacks.filter(response => activeCookie(response, 'scope_session')).length, 1);
  assert.equal((await sql`select * from application_sessions`.execute(context.db)).rows.length, 1);
  const expired = await login(context);
  context.advance(LOGIN_LIFETIME_MS);
  const response = await context.app.inject({ url: expired.callback, headers: { cookie: expired.browser } });
  assert.equal(response.headers.location, '/?authError=1');
  assert.equal((await sql`select * from application_sessions`.execute(context.db)).rows.length, 1);
});

test('signed token validation, cancellation and provider failure never create a session and consume the transaction', async t => {
  const context = await setup(t);
  for (const mode of ['cancel', 'failure', 'signature', 'issuer', 'audience', 'expiry', 'nonce', 'future', 'missing-token'] satisfies ProviderMode[]) {
    context.fixture.mode = mode;
    const attempt = await login(context);
    const response = await context.app.inject({ url: attempt.callback, headers: { cookie: attempt.browser } });
    assert.equal(response.headers.location, '/?authError=1', mode);
    assert.equal(activeCookie(response, 'scope_session'), undefined, mode);
    assert.equal((await sql`select * from application_sessions`.execute(context.db)).rows.length, 0, mode);
    assert.equal((await sql`select * from login_transactions`.execute(context.db)).rows.length, 0, mode);
    assert.doesNotMatch(response.body, /private-|stack|token/);
  }
  assert.doesNotMatch(context.logs(), /private-|code-|fixture-secret/);
});

test('database errors never issue session cookies and produce sanitized service responses', async t => {
  const context = await setup(t);
  const attempt = await login(context);
  await sql`alter table application_sessions add constraint simulated_failure check (false)`.execute(context.db);
  const callback = await context.app.inject({ url: attempt.callback, headers: { cookie: attempt.browser } });
  assert.equal(callback.headers.location, '/?authError=1');
  assert.equal(activeCookie(callback, 'scope_session'), undefined);
  assert.equal((await sql`select * from users`.execute(context.db)).rows.length, 0);
  await sql`drop table application_sessions`.execute(context.db);
  const session = await context.app.inject({ url: '/api/session', headers: { cookie: `scope_session=${opaqueIdentifier()}` } });
  assert.equal(session.statusCode, 503); assert.deepEqual(session.json(), { error: 'authentication_unavailable' });
  const signedOut = await context.app.inject('/api/session');
  assert.equal(signedOut.statusCode, 503); assert.deepEqual(signedOut.json(), { error: 'authentication_unavailable' });
  await sql`drop table login_transactions`.execute(context.db);
  const start = await context.app.inject('/auth/login');
  assert.equal(start.statusCode, 503); assert.deepEqual(start.json(), { error: 'authentication_unavailable' });
  assert.equal(cookies(start).length, 0);
});

test('unconfigured production authentication is unavailable and readiness stays public', async t => {
  const app = buildProductionApp(undefined, {}); t.after(() => app.close());
  for (const url of ['/auth/login', '/api/session']) {
    const response = await app.inject(url);
    assert.equal(response.statusCode, 503); assert.deepEqual(response.json(), { error: 'authentication_unavailable' });
    assert.equal(cookies(response).length, 0);
  }
  assert.deepEqual((await app.inject('/api/ready')).json(), { status: 'not_ready' });
});
