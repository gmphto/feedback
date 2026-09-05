import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readAuthConfiguration, type AuthEnvironment } from '../src/auth/configuration.js';

const valid: AuthEnvironment = {
  AUTH0_ISSUER_BASE_URL: 'https://tenant.example', AUTH0_CLIENT_ID: ' client-id ',
  AUTH0_CLIENT_SECRET: ' secret ', APP_ORIGIN: 'https://app.example/',
};
const unavailable = { available: false, error: 'authentication_unavailable' };

test('auth configuration normalizes trusted origins and preserves nonblank server credentials', () => {
  assert.deepEqual(readAuthConfiguration(valid), { available: true, configuration: {
    issuer: 'https://tenant.example/', clientId: ' client-id ', clientSecret: ' secret ',
    applicationOrigin: 'https://app.example', callbackUrl: 'https://app.example/auth/callback', secureCookies: true,
  } });
  assert.deepEqual(readAuthConfiguration({ ...valid, AUTH0_ISSUER_BASE_URL: 'https://tenant.example/' }), readAuthConfiguration(valid));
});

test('missing, blank and malformed configuration yields only a sanitized unavailable result', () => {
  assert.deepEqual(readAuthConfiguration({}), unavailable);
  for (const key of ['AUTH0_ISSUER_BASE_URL', 'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET', 'APP_ORIGIN'] as const) {
    for (const value of [undefined, '', '  ']) assert.deepEqual(readAuthConfiguration({ ...valid, [key]: value }), unavailable);
  }
  for (const key of ['AUTH0_ISSUER_BASE_URL', 'APP_ORIGIN'] as const) {
    for (const value of ['garbage-secret', 'https://user:secret@private.example', 'https://private.example/path', 'https://private.example/?secret', 'https://private.example/#secret', 'https://private.example/?', 'https://private.example/#', ' https://private.example', 'https://private.example\\path', 'https://private.example:70000']) {
      assert.deepEqual(readAuthConfiguration({ ...valid, [key]: value }), unavailable);
    }
  }
});

test('local HTTP requires literal opt-in and an explicit development or test environment', () => {
  for (const NODE_ENV of ['development', 'test']) {
    for (const hostname of ['localhost', '127.0.0.1', '[::1]']) {
      const result = readAuthConfiguration({ ...valid, NODE_ENV, AUTH_ALLOW_LOCAL_HTTP: 'true', APP_ORIGIN: `http://${hostname}:5173` });
      assert.ok(result.available);
      assert.equal(result.configuration.secureCookies, false);
      assert.equal(result.configuration.callbackUrl, `http://${hostname}:5173/auth/callback`);
    }
  }
  for (const NODE_ENV of [undefined, 'production', 'staging']) {
    assert.deepEqual(readAuthConfiguration({ ...valid, NODE_ENV, AUTH_ALLOW_LOCAL_HTTP: 'true' }), unavailable);
  }
  for (const AUTH_ALLOW_LOCAL_HTTP of [undefined, 'false', '', 'TRUE', '1', ' true ']) {
    assert.deepEqual(readAuthConfiguration({ ...valid, NODE_ENV: 'development', AUTH_ALLOW_LOCAL_HTTP, APP_ORIGIN: 'http://localhost:5173' }), unavailable);
  }
  for (const APP_ORIGIN of ['http://app.example', 'http://localhost.example', 'http://127.1', 'http://2130706433', 'http://127.0.0.2', 'ftp://localhost']) {
    assert.deepEqual(readAuthConfiguration({ ...valid, NODE_ENV: 'development', AUTH_ALLOW_LOCAL_HTTP: 'true', APP_ORIGIN }), unavailable);
  }
});

test('local HTTP opt-in never downgrades HTTPS cookies or permits an HTTP issuer', () => {
  const local = { ...valid, NODE_ENV: 'development', AUTH_ALLOW_LOCAL_HTTP: 'true' };
  assert.deepEqual(readAuthConfiguration(local), readAuthConfiguration(valid));
  assert.deepEqual(readAuthConfiguration({ ...local, AUTH0_ISSUER_BASE_URL: 'http://localhost:9000' }), unavailable);
  assert.deepEqual(readAuthConfiguration({ ...valid, NODE_ENV: 'production', AUTH_ALLOW_LOCAL_HTTP: 'false' }), readAuthConfiguration(valid));
});
