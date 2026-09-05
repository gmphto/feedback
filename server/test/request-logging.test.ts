import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildApp } from '../src/app.js';

test('request logs retain route/status without query, headers, raw paths or provider errors', async t => {
  let output = '';
  const app = buildApp({ logStream: { write(message) { output += message; } } });
  t.after(() => app.close());
  app.get('/auth/callback', async () => { throw new Error('private-provider-payload'); });
  for (const url of ['/api/ready?code=private-code&state=private-state', '/auth/callback?error_description=private-description', '/private-path?token=private-token']) {
    await app.inject({ url, headers: { cookie: 'session=private-cookie', authorization: 'Bearer private-bearer', host: 'private-host' } });
  }
  assert.doesNotMatch(output, /private-|error_description|cookie|authorization/);
  const logs = output.trim().split('\n').map(line => JSON.parse(line));
  assert.deepEqual(logs.map(({ route, statusCode }) => ({ route, statusCode })), [
    { route: '/api/ready', statusCode: 200 },
    { route: '/auth/callback', statusCode: 500 },
    { route: 'unmatched', statusCode: 404 },
  ]);
});
