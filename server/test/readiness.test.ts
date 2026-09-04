import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildApp } from '../src/app.js';
import { getReadiness } from '../src/readiness.js';
import type { ReadinessCheck } from '../src/readiness.js';

function assertReadiness(
  response: { statusCode: number; headers: Record<string, unknown>; body: string },
  statusCode: number,
  status: 'ready' | 'not_ready',
) {
  assert.equal(response.statusCode, statusCode);
  assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
  assert.deepEqual(JSON.parse(response.body), { status });
}

test('GET /api/ready succeeds without authentication and returns only readiness', async t => {
  const app = buildApp();
  t.after(() => app.close());

  const response = await app.inject({ method: 'GET', url: '/api/ready' });

  assertReadiness(response, 200, 'ready');
});

test('a false readiness check returns 503 and is evaluated again on the next request', async t => {
  let ready = false;
  const app = buildApp({ readinessCheck: () => ready });
  t.after(() => app.close());

  assertReadiness(await app.inject({ method: 'GET', url: '/api/ready' }), 503, 'not_ready');

  ready = true;
  assertReadiness(await app.inject({ method: 'GET', url: '/api/ready' }), 200, 'ready');
});

test('an asynchronous readiness check is awaited before responding', async t => {
  let finishCheck: (ready: boolean) => void = () => assert.fail('check has not started');
  let checkStarted: () => void = () => {};
  const started = new Promise<void>(resolve => { checkStarted = resolve; });
  const app = buildApp({ readinessCheck: () => new Promise<boolean>(resolve => {
    finishCheck = resolve;
    checkStarted();
  }) });
  t.after(() => app.close());

  const response = app.inject({ method: 'GET', url: '/api/ready' });
  await started;
  finishCheck(false);

  assertReadiness(await response, 503, 'not_ready');
});

test('an asynchronous successful check returns ready', async t => {
  const app = buildApp({ readinessCheck: async () => true });
  t.after(() => app.close());

  assertReadiness(await app.inject({ method: 'GET', url: '/api/ready' }), 200, 'ready');
});

const failures: { name: string; check: ReadinessCheck }[] = [
  {
    name: 'synchronous exception',
    check: () => { throw new Error('secret=password; project=private; dependency=internal'); },
  },
  {
    name: 'rejected asynchronous check',
    check: async () => { throw new Error('secret=password; project=private; dependency=internal'); },
  },
];

for (const failure of failures) {
  test(`${failure.name} returns sanitized 503 and recovers without restarting`, async t => {
    let calls = 0;
    const app = buildApp({ readinessCheck: () => {
      calls += 1;
      return calls === 1 ? failure.check() : true;
    } });
    t.after(() => app.close());

    // Exact shape excludes error messages, stack traces, and private fields.
    assertReadiness(await app.inject({ method: 'GET', url: '/api/ready' }), 503, 'not_ready');
    assertReadiness(await app.inject({ method: 'GET', url: '/api/ready' }), 200, 'ready');
    assert.equal(calls, 2);
  });
}

test('readiness can be evaluated independently of an HTTP application', async () => {
  assert.equal(await getReadiness(), 'ready');
  assert.equal(await getReadiness(() => false), 'not_ready');
  assert.equal(await getReadiness(failures[1].check), 'not_ready');
});
