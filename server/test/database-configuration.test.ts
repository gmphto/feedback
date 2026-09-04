import assert from 'node:assert/strict';
import { test } from 'node:test';

import { readDatabaseConfiguration } from '../src/db/configuration.js';

test('database configuration accepts PostgreSQL URLs without exposing them in errors', () => {
  for (const value of ['postgres://local@127.0.0.1/app', 'postgresql://local@localhost:5432/app']) {
    assert.deepEqual(readDatabaseConfiguration(value), { valid: true, connectionString: value });
  }
});

test('missing database configuration names the required variable', () => {
  for (const value of [undefined, '', ' ']) {
    assert.deepEqual(readDatabaseConfiguration(value, 'TEST_DATABASE_URL'), {
      valid: false,
      message: 'TEST_DATABASE_URL is required; supply a PostgreSQL connection URL.',
    });
  }
});

test('invalid configuration has a sanitized actionable error', () => {
  for (const value of ['secret-password', 'postgresql://user:%ZZ@localhost/app', 'https://user:secret@private/app', 'postgres://user:secret@private', 'postgres://private:70000/app']) {
    const result = readDatabaseConfiguration(value);
    assert.equal(result.valid, false);
    if (!result.valid) {
      assert.equal(result.message, 'DATABASE_URL must be a valid PostgreSQL connection URL with a host and database name.');
    }
  }
});
