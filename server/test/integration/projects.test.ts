import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';
import { sql } from 'kysely';
import { isolated } from '../support/database.js';
import { runMigrations } from '../../src/db/migrate.js';
import { createAuthRepository, opaqueIdentifier } from '../../src/auth/repository.js';
import { createProjectModule } from '../../src/projects/module.js';
import { buildApp } from '../../src/app.js';
import type { AuthDependencies } from '../../src/auth/service.js';
import { contextLimits } from '../../src/projects/creation.js';
import { migrationProvider } from '../../src/db/migrations.js';

async function seedProject(projects: ReturnType<typeof createProjectModule>, actor: { id: number }, name: string) {
  const saved = await projects.createDefinition(actor, {
    name, roughIdea: '', primaryUser: '', coreJob: '', mainProblem: '',
    mvpOutcome: '', initialProductAreas: '', constraints: '',
  });
  return { id: saved.id, name: saved.name, version: saved.version };
}

async function setup(t: TestContext, legacy = false) {
  const { db, url } = await isolated(t);
  assert.equal(await runMigrations(url, legacy ? { async getMigrations() {
    const migrations = await migrationProvider.getMigrations(); delete migrations['0004_project_context']; return migrations;
  } } : migrationProvider), 0);
  const repository = createAuthRepository(db);
  const alice = await repository.createSession({ issuer: 'https://issuer.example/', subject: 'alice' });
  const bob = await repository.createSession({ issuer: 'https://issuer.example/', subject: 'bob' });
  const projects = createProjectModule(db);
  // Only the migration regression seeds the old schema; createDefinition needs 0004.
  const seeds = legacy
    ? (await sql<{ id: number; name: string; version: number }>`insert into projects (owner_id, name)
        values (${alice.user.id}, 'Alpha'), (${alice.user.id}, 'Beta'), (${bob.user.id}, 'A foreign project')
        returning id, name, version`.execute(db)).rows
    : [await seedProject(projects, alice.user, 'Alpha'),
       await seedProject(projects, alice.user, 'Beta'),
       await seedProject(projects, bob.user, 'A foreign project')];
  const [first, second, foreign] = [seeds[0]!, seeds[1]!, seeds[2]!];
  const areas = (await sql<{ id: number; project_id: number }>`insert into feature_areas (project_id)
    values (${first.id}), (${first.id}), (${second.id}), (${foreign.id}) returning id, project_id`.execute(db)).rows;
  const features = (await sql<{ id: number; feature_area_id: number }>`insert into features (feature_area_id)
    values (${areas[0]!.id}), (${areas[1]!.id}), (${areas[2]!.id}), (${areas[3]!.id}) returning id, feature_area_id`.execute(db)).rows;
  if (legacy) assert.equal(await runMigrations(url), 0);
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
});

test('lists scope/filter before pagination, sort stably and interpret wildcard characters literally', async t => {
  const context = await setup(t);
  const alpha = await seedProject(context.projects, context.alice.user, 'Alpha');
  const percent = await seedProject(context.projects, context.alice.user, 'Special % value');
  const underscore = await seedProject(context.projects, context.alice.user, 'Special _ value');
  await seedProject(context.projects, context.bob.user, 'Alpha hidden');
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
  for (const url of ['/api/projects', `/api/projects/${context.first.id}`, `/api/projects/${context.first.id}/definition`, `/api/projects/${context.first.id}/feature-areas/${context.areas[0]!.id}`]) {
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

test('minimal/full creation saves exact context and reloads owner-scoped definitions without changing summaries', async t => {
  const context = await setup(t, true);
  const empty = Object.fromEntries(Object.keys(contextLimits).map(key => [key, '']));
  shape(await context.app.inject({ url: `/api/projects/${context.first.id}/definition`, headers: context.headers }), 200, { project: { ...context.first, ...empty } });
  const minimal = await context.app.inject({ method: 'POST', url: '/api/projects', headers: context.headers, payload: { name: '  New  ' } });
  assert.equal(minimal.statusCode, 201); const id = minimal.json().project.id;
  shape(minimal, 201, { project: { id, name: 'New', version: 1, ...empty } });
  assert.equal(minimal.headers.location, `/api/projects/${id}/definition`);
  const payload = { name: ' Full ', ...Object.fromEntries(Object.keys(contextLimits).map(key => [key, `  ${key}\n<script>plain text</script>🙂  `])) };
  const full = await context.app.inject({ method: 'POST', url: '/api/projects', headers: context.headers, payload });
  assert.equal(full.statusCode, 201); const saved = full.json().project;
  assert.deepEqual(saved, { ...payload, name: 'Full', id: saved.id, version: 1 });
  shape(await context.app.inject({ url: full.headers.location!, headers: context.headers }), 200, { project: saved });
  shape(await context.app.inject({ url: full.headers.location!, headers: { ...context.headers, cookie: `__Host-scope_session=${context.bob.identifier}` } }), 404, { error: 'not_found' });
  shape(await context.app.inject({ method: 'PATCH', url: `/api/projects/${saved.id}`, headers: context.headers, payload: { name: 'Renamed', expectedVersion: 1 } }), 200, { project: { id: saved.id, name: 'Renamed', version: 2 } });
  shape(await context.app.inject({ url: full.headers.location!, headers: context.headers }), 200, { project: { ...saved, name: 'Renamed', version: 2 } });
  assert.equal((await sql`select * from feature_areas`.execute(context.db)).rows.length, 4);
  assert.equal((await context.app.inject({ method: 'POST', url: '/api/projects', headers: context.headers, payload: { name: 'New' } })).statusCode, 201);
});

test('creation field errors preserve atomicity and reject wrong types, NUL and forged identity', async t => {
  const context = await setup(t); const before = await snapshot(context);
  for (const [field, limit] of Object.entries({ name: 200, ...contextLimits })) {
    for (const value of ['x'.repeat(limit + 1), null, 1, [], {}, '\0']) {
      const response = await context.app.inject({ method: 'POST', url: '/api/projects', headers: context.headers, payload: { name: 'Good', [field]: value } });
      assert.equal(response.statusCode, 400); assert.deepEqual(Object.keys(response.json()).sort(), ['error', 'fields']);
      assert.equal(response.json().error, 'invalid_request'); assert.equal(typeof response.json().fields[field], 'string');
    }
  }
  for (const key of ['ownerId', 'owner_id', 'id', 'version', 'extra']) {
    const response = await context.app.inject({ method: 'POST', url: '/api/projects', headers: context.headers, payload: { name: 'Good', [key]: 1 } });
    assert.equal(response.statusCode, 400); assert.ok(response.json().fields._form);
  }
  for (const payload of ['{bad', 'null', '[]', '1']) {
    const response = await context.app.inject({ method: 'POST', url: '/api/projects', headers: { ...context.headers, 'content-type': 'application/json' }, payload });
    assert.equal(response.statusCode, 400); assert.ok(response.json().fields._form);
  }
  assert.deepEqual(await snapshot(context), before);
  const astral = await context.app.inject({ method: 'POST', url: '/api/projects', headers: context.headers, payload: { name: '🙂'.repeat(200), primaryUser: '🙂'.repeat(4000) } });
  assert.equal(astral.statusCode, 201); assert.equal(astral.json().project.primaryUser, '🙂'.repeat(4000));
});

test('creation authenticates before input validation and handles database failure without a partial project', async t => {
  const context = await setup(t); const before = await snapshot(context);
  shape(await context.app.inject({ method: 'POST', url: '/api/projects', headers: { origin: context.origin }, payload: {} }), 401, { error: 'unauthorized' });
  shape(await context.app.inject({ method: 'POST', url: '/api/projects', headers: { cookie: context.headers.cookie }, payload: { name: 'Denied' } }), 403, { error: 'forbidden' });
  await sql`alter table projects add constraint simulated_creation_failure check (name <> 'Fails')`.execute(context.db);
  shape(await context.app.inject({ method: 'POST', url: '/api/projects', headers: context.headers, payload: { name: 'Fails', roughIdea: 'Must not partially persist' } }), 503, { error: 'project_unavailable' });
  assert.deepEqual(await snapshot(context), before);
});
