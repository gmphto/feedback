import assert from 'node:assert/strict';
import { test } from 'node:test';
import { allowsBrowserMutation, hasExpired, LOGIN_LIFETIME_MS, safeReturnPath, SESSION_LIFETIME_MS } from '../src/auth/policy.js';

test('return paths remain local and unsafe redirect forms fall back to root', () => {
  assert.equal(safeReturnPath('/projects?view=list#current'), '/projects?view=list#current');
  for (const value of [undefined, '', 'https://evil.example', '//evil.example', '/\\evil.example', '/%2fevil.example', '/%5cevil.example', '/\n/evil.example', '/%0d%0aevil.example', '/%zz']) {
    assert.equal(safeReturnPath(value), '/');
  }
});

test('browser mutations require the exact configured origin', () => {
  const origin = 'https://app.example';
  assert.equal(allowsBrowserMutation(origin, origin), true);
  for (const value of [undefined, 'null', 'https://evil.example', 'https://app.example.evil', 'http://app.example', 'https://app.example/']) {
    assert.equal(allowsBrowserMutation(value, origin), false);
  }
});

test('sessions and login transactions have fixed absolute lifetimes and expire at the boundary', () => {
  assert.equal(SESSION_LIFETIME_MS, 28_800_000);
  assert.equal(LOGIN_LIFETIME_MS, 600_000);
  const now = new Date('2026-01-01T00:00:00Z');
  for (const duration of [SESSION_LIFETIME_MS, LOGIN_LIFETIME_MS]) {
    const expiry = new Date(now.getTime() + duration);
    assert.equal(hasExpired(expiry, new Date(expiry.getTime() - 1)), false);
    assert.equal(hasExpired(expiry, expiry), true);
    assert.equal(hasExpired(expiry, new Date(expiry.getTime() + 1)), true);
  }
});
