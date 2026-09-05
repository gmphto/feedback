import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { test, type TestContext } from 'node:test';
import { sql } from 'kysely';
import { createDatabase } from '../../src/db/database.js';
import { readDatabaseConfiguration } from '../../src/db/configuration.js';
import { runMigrations } from '../../src/db/migrate.js';
import { createAuthRepository, opaqueIdentifier } from '../../src/auth/repository.js';
import { createProjectModule } from '../../src/projects/module.js';
import { buildApp } from '../../src/app.js';
import type { AuthDependencies } from '../../src/auth/service.js';

const config = readDatabaseConfiguration(process.env.TEST_DATABASE_URL, 'TEST_DATABASE_URL');
if (!config.valid) throw new Error(config.message);
const testUrl = config.connectionString;

async function setup(t: TestContext) {
  const admin = createDatabase(testUrl);
  const name = `scope_test_${Date.now()}_${randomBytes(6).toString('hex')}`;
  let created = false; let db: ReturnType<typeof createDatabase> | undefined;
  t.after(async () => {
    await db?.destroy();
    try { if (created) await sql`drop database ${sql.id(name)}`.execute(admin); }
    finally { await admin.destroy(); }
  });
  await sql`create database ${sql.id(name)}`.execute(admin); created = true;
  const url = new URL(testUrl); url.pathname = `/${name}`;
  assert.equal(await runMigrations(url.href), 0);
  db = createDatabase(url.href);
  const repository = createAuthRepository(db);
  const alice = await repository.createSession({ issuer: 'https://issuer.example/', subject: 'alice' });
  const bob = await repository.createSession({ issuer: 'https://issuer.example/', subject: 'bob' });
  const projects = createProjectModule(db);
  const first = await projects.createProject(alice.user, 'Alpha');
  const second = await projects.createProject(alice.user, 'Beta');
  const foreign = await projects.createProject(bob.user, 'A foreign project');
  const areas = (await sql<{ id: number; project_id: number }>`insert into feature_areas (project_id)
    values (${first.id}), (${first.id}), (${second.id}), (${foreign.id}) returning id, project_id`.execute(db)).rows;
  const features = (await sql<{ id: number; feature_area_id: number }>`insert into features (feature_area_id)
    values (${areas[0]!.id}), (${areas[1]!.id}), (${areas[2]!.id}), (${areas[3]!.id}) returning id, feature_area_id`.execute(db)).rows;
  const origin = 'https://app.example';
  const auth: AuthDependencies = {
    configuration: { issuer: 'https://issuer.example/', clientId: 'id', clientSecret: 'secret', applicationOrigin: origin, callbackUrl: `${origin}/auth/callback`, secureCookies: true },
    repository, provider: {
      async authorizationUrl() { throw new Error('Provider not used by project tests'); },
      async verifyCallback() { throw new Error('Provider not used by project tests'); },
    },
  };
  const app = buildApp({ auth, projects, logStream: { write() {} } }); t.after(() => app.close());
  const headers = { cookie: `__Host-scope_session=${alice.identifier}`, origin };
  return { app, db, auth, projects, first, second, foreign, areas, features, alice, bob, headers, origin };
}
function shape(response: { statusCode: number; headers: Record<string, unknown>; json(): unknown }, status: number, body: unknown) {
  assert.equal(response.statusCode, status); assert.deepEqual(response.json(), body);
  assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
  assert.equal(response.headers['cache-control'], 'no-store');
}
async function snapshot(context: Awaited<ReturnType<typeof setup>>) {
  return (await sql`select * from projects order by id`.execute(context.db)).rows;
}

test('owner-scoped create/read/update returns exact representations and never accepts a new owner', async t => {
  const context = await setup(t);
  shape(await context.app.inject({ url: `/api/projects/${context.first.id}`, headers: context.headers }), 200, { project: context.first });
  for (const id of [context.foreign.id, 2147483647]) {
    shape(await context.app.inject({ url: `/api/projects/${id}`, headers: context.headers }), 404, { error: 'not_found' });
    shape(await context.app.inject({ method: 'PATCH', url: `/api/projects/${id}`, headers: context.headers, payload: { name: 'stolen', expectedVersion: 9 } }), 404, { error: 'not_found' });
  }
  const saved = { ...context.first, name: 'Renamed', version: 2 };
  shape(await context.app.inject({ method: 'PATCH', url: `/api/projects/${context.first.id}`, headers: context.headers, payload: { name: '  Renamed  ', expectedVersion: 1 } }), 200, { project: saved });
  assert.deepEqual(await context.projects.readProject(context.alice.user, context.first.id), saved);
  const owners = (await sql<{ owner_id: number }>`select owner_id from projects where id = ${context.first.id}`.execute(context.db)).rows;
  assert.equal(owners[0]!.owner_id, context.alice.user.id);
  assert.equal((await context.projects.readProject(context.bob.user, context.first.id)), undefined);
  assert.equal((await context.app.inject({ method: 'POST', url: '/api/projects', headers: context.headers, payload: { name: 'Not exposed' } })).statusCode, 404);
});

test('lists scope/filter before pagination, sort stably and interpret wildcard characters literally', async t => {
  const context = await setup(t);
  const alpha = await context.projects.createProject(context.alice.user, 'Alpha');
  const percent = await context.projects.createProject(context.alice.user, 'Special % value');
  const underscore = await context.projects.createProject(context.alice.user, 'Special _ value');
  await context.projects.createProject(context.bob.user, 'Alpha hidden');
  shape(await context.app.inject({ url: '/api/projects?name=ALPHA&limit=1&offset=1', headers: context.headers }), 200, { projects: [alpha] });
  shape(await context.app.inject({ url: '/api/projects?name=%25', headers: context.headers }), 200, { projects: [percent] });
  shape(await context.app.inject({ url: '/api/projects?name=_', headers: context.headers }), 200, { projects: [underscore] });
  shape(await context.app.inject({ url: '/api/projects?name=missing', headers: context.headers }), 200, { projects: [] });
  shape(await context.app.inject({ url: '/api/projects?offset=2147483648', headers: context.headers }), 200, { projects: [] });
  shape(await context.app.inject({ url: '/api/projects?limit=2', headers: context.headers }), 200, { projects: [context.first, alpha] });
  const all = (await context.app.inject({ url: '/api/projects', headers: context.headers })).json().projects;
  assert.equal(all.length, 5); assert.ok(all.every((row: { id: number }) => row.id !== context.foreign.id));
});

test('nested reads constrain every actual parent including mismatches within one owner and one project', async t => {
  const context = await setup(t);
  const [firstArea, siblingArea, secondArea, foreignArea] = context.areas;
  const [firstFeature, siblingFeature, secondFeature, foreignFeature] = context.features;
  const path = (project: number, area: number, feature?: number) => `/api/projects/${project}/feature-areas/${area}${feature ? `/features/${feature}` : ''}`;
  shape(await context.app.inject({ url: path(context.first.id, firstArea!.id), headers: context.headers }), 200, { featureArea: { id: firstArea!.id, projectId: context.first.id } });
  shape(await context.app.inject({ url: path(context.first.id, firstArea!.id, firstFeature!.id), headers: context.headers }), 200, { feature: { id: firstFeature!.id, featureAreaId: firstArea!.id } });
  for (const url of [
    path(context.first.id, secondArea!.id), path(context.second.id, firstArea!.id), path(context.first.id, foreignArea!.id),
    path(context.foreign.id, foreignArea!.id), path(context.first.id, 2147483647), path(2147483647, firstArea!.id),
    path(context.first.id, firstArea!.id, siblingFeature!.id), path(context.first.id, siblingArea!.id, firstFeature!.id),
    path(context.first.id, firstArea!.id, secondFeature!.id), path(context.first.id, firstArea!.id, foreignFeature!.id),
    path(context.second.id, firstArea!.id, firstFeature!.id), path(context.foreign.id, foreignArea!.id, foreignFeature!.id),
    path(context.first.id, firstArea!.id, 2147483647),
  ]) shape(await context.app.inject({ url, headers: context.headers }), 404, { error: 'not_found' });
});

test('authentication precedes resource validation and global Origin denial precedes unauthenticated mutations', async t => {
  const context = await setup(t); const before = await snapshot(context);
  for (const cookie of [undefined, '__Host-scope_session=invalid', `__Host-scope_session=${opaqueIdentifier()}`]) {
    const headers = { ...(cookie ? { cookie } : {}), origin: context.origin };
    for (const url of ['/api/projects?extra=bad', '/api/projects/not-an-id', '/api/projects/0/feature-areas/0/features/0']) {
      shape(await context.app.inject({ url, headers }), 401, { error: 'unauthorized' });
    }
    shape(await context.app.inject({ method: 'PATCH', url: '/api/projects/not-an-id', headers, payload: { forged: 'bad' } }), 401, { error: 'unauthorized' });
  }
  for (const origin of [undefined, 'null', 'https://foreign.example']) {
    for (const cookie of [undefined, context.headers.cookie]) {
      shape(await context.app.inject({ method: 'PATCH', url: `/api/projects/${context.first.id}`, headers: { ...(origin ? { origin } : {}), ...(cookie ? { cookie } : {}) }, payload: { name: 'bad', expectedVersion: 1 } }), 403, { error: 'forbidden' });
    }
  }
  assert.deepEqual(await snapshot(context), before);
  const unavailable = buildApp({ projects: context.projects, logStream: { write() {} } }); t.after(() => unavailable.close());
  shape(await unavailable.inject('/api/projects/not-an-id'), 503, { error: 'authentication_unavailable' });
});

test('malformed authenticated inputs and forged identity fields consistently fail without mutation', async t => {
  const context = await setup(t); const before = await snapshot(context);
  for (const id of ['0', '-1', '01', '+1', '1.5', '1e0', '2147483648', 'bad']) {
    shape(await context.app.inject({ url: `/api/projects/${id}`, headers: context.headers }), 400, { error: 'invalid_request' });
    shape(await context.app.inject({ url: `/api/projects/${context.first.id}/feature-areas/${id}/features/1`, headers: context.headers }), 400, { error: 'invalid_request' });
  }
  for (const query of ['extra=1', 'limit=0', 'limit=101', 'limit=1.5', 'limit=01', 'limit=1&limit=2', 'offset=-1', 'offset=1e0', `name=${'a'.repeat(201)}`]) {
    shape(await context.app.inject({ url: `/api/projects?${query}`, headers: context.headers }), 400, { error: 'invalid_request' });
  }
  for (const payload of [
    {}, { name: '', expectedVersion: 1 }, { name: ' \n\t', expectedVersion: 1 }, { name: 'a'.repeat(201), expectedVersion: 1 },
    { name: 'good', expectedVersion: '1' }, { name: 'good', expectedVersion: 0 }, { name: 'good', expectedVersion: 1.5 },
    { name: 'good', expectedVersion: 2147483648 }, { name: 'good', expectedVersion: 1, owner_id: context.bob.user.id },
    { name: 'good', expectedVersion: 1, ownerId: context.bob.user.id }, { name: 'good', expectedVersion: 1, id: context.second.id },
    { name: 'good', expectedVersion: 1, extra: true },
  ]) {
    for (const id of [context.first.id, context.foreign.id, 2147483647]) {
      shape(await context.app.inject({ method: 'PATCH', url: `/api/projects/${id}`, headers: context.headers, payload }), 400, { error: 'invalid_request' });
    }
  }
  shape(await context.app.inject({ method: 'PATCH', url: `/api/projects/${context.first.id}`, headers: { ...context.headers, 'content-type': 'application/json' }, payload: '{bad' }), 400, { error: 'invalid_request' });
  assert.deepEqual(await snapshot(context), before);
});

test('concurrent owner writes yield one commit and one scoped conflict without exposing foreign versions', async t => {
  const context = await setup(t);
  const results = await Promise.all(['One', 'Two'].map(name => context.app.inject({ method: 'PATCH', url: `/api/projects/${context.first.id}`, headers: context.headers, payload: { name, expectedVersion: 1 } })));
  assert.deepEqual(results.map(result => result.statusCode).sort(), [200, 409]);
  const winner = results.find(result => result.statusCode === 200)!.json().project;
  assert.equal(winner.version, 2);
  shape(results.find(result => result.statusCode === 409)!, 409, { error: 'conflict', project: winner });
  const before = await snapshot(context);
  shape(await context.app.inject({ method: 'PATCH', url: `/api/projects/${context.first.id}`, headers: context.headers, payload: { name: 'stale', expectedVersion: 1 } }), 409, { error: 'conflict', project: winner });
  for (const expectedVersion of [1, 2, 999]) {
    shape(await context.app.inject({ method: 'PATCH', url: `/api/projects/${context.first.id}`, headers: { ...context.headers, cookie: `__Host-scope_session=${context.bob.identifier}` }, payload: { name: 'stolen', expectedVersion } }), 404, { error: 'not_found' });
  }
  assert.deepEqual(await snapshot(context), before);
});

test('real constraints reject missing parents and unavailable project effects return sanitized 503', async t => {
  const context = await setup(t);
  await assert.rejects(sql`insert into projects (owner_id, name) values (2147483647, 'orphan')`.execute(context.db));
  await assert.rejects(sql`insert into projects (owner_id, name) values (${context.alice.user.id}, '   ')`.execute(context.db));
  await assert.rejects(sql`insert into feature_areas (project_id) values (2147483647)`.execute(context.db));
  await assert.rejects(sql`insert into features (feature_area_id) values (2147483647)`.execute(context.db));
  await sql`alter table projects rename to unavailable_projects`.execute(context.db);
  for (const url of ['/api/projects', `/api/projects/${context.first.id}`, `/api/projects/${context.first.id}/feature-areas/${context.areas[0]!.id}`]) {
    shape(await context.app.inject({ url, headers: context.headers }), 503, { error: 'project_unavailable' });
  }
  shape(await context.app.inject({ method: 'PATCH', url: `/api/projects/${context.first.id}`, headers: context.headers, payload: { name: 'fails', expectedVersion: 1 } }), 503, { error: 'project_unavailable' });
});

test('router-level malformed URLs preserve Origin/session precedence and sanitized no-store validation', async t => {
  const context = await setup(t); const before = await snapshot(context);
  const malformed = ['/api/projects/%ZZ', `/api/projects/${'1'.repeat(101)}`,
    `/api/projects/${context.first.id}/feature-areas/%ZZ`,
    `/api/projects/${context.first.id}/feature-areas/${context.areas[0]!.id}/features/${'1'.repeat(101)}`];
  const unavailable = buildApp({ projects: context.projects, logStream: { write() {} } }); t.after(() => unavailable.close());
  const failingAuth = buildApp({ auth: { ...context.auth, repository: { ...context.auth.repository,
    async findSession() { throw new Error('private-database-failure'); },
  } }, projects: context.projects, logStream: { write() {} } }); t.after(() => failingAuth.close());
  for (const url of malformed) {
    const methods: ('GET' | 'PATCH')[] = url.includes('/feature-areas/') ? ['GET'] : ['GET', 'PATCH'];
    for (const method of methods) {
      const payload = method === 'PATCH' ? { name: 'Must not save', expectedVersion: 1 } : undefined;
      for (const cookie of [undefined, '__Host-scope_session=invalid']) {
        shape(await context.app.inject({ method, url, payload, headers: { origin: context.origin, ...(cookie ? { cookie } : {}) } }), 401, { error: 'unauthorized' });
      }
      shape(await context.app.inject({ method, url, payload, headers: context.headers }), 400, { error: 'invalid_request' });
      shape(await unavailable.inject({ method: 'GET', url }), 503, { error: 'authentication_unavailable' });
      shape(await failingAuth.inject({ method: 'GET', url, headers: context.headers }), 503, { error: 'authentication_unavailable' });
      for (const origin of method === 'PATCH' ? [undefined, 'null', 'https://foreign.example'] : []) {
        for (const cookie of [undefined, context.headers.cookie]) {
          shape(await context.app.inject({ method: 'PATCH', url, payload: { name: 'Must not save', expectedVersion: 1 }, headers: { ...(origin ? { origin } : {}), ...(cookie ? { cookie } : {}) } }), 403, { error: 'forbidden' });
        }
      }
    }
  }
  assert.deepEqual(await snapshot(context), before);
});
