import assert from 'node:assert/strict';
import { test } from 'node:test';
import { expectedVersion, pathIdentifier, projectListOptions, projectName } from '../src/projects/policy.js';
import { contextLimits, validateProjectInput } from '../src/projects/creation.js';

test('project identifiers and versions use positive PostgreSQL integers without coercion', () => {
  assert.equal(pathIdentifier('2147483647'), 2147483647);
  for (const value of [undefined, 1, '0', '01', '-1', '+1', '1e0', '1.0', ' 1', '2147483648']) assert.equal(pathIdentifier(value), undefined);
  assert.equal(expectedVersion(1), 1);
  for (const value of ['1', 0, -1, 1.5, Infinity, 2147483648]) assert.equal(expectedVersion(value), undefined);
});
test('project names trim whitespace and enforce Unicode character length', () => {
  assert.equal(projectName('  Clear scope \n'), 'Clear scope');
  assert.equal(projectName('🙂'.repeat(200)), '🙂'.repeat(200));
  for (const value of [undefined, '', ' \t\n', 'a'.repeat(201)]) assert.equal(projectName(value), undefined);
});
test('list filters stay literal with bounded canonical pagination and no extra fields', () => {
  assert.deepEqual(projectListOptions({}), { name: '', limit: 50, offset: 0 });
  assert.deepEqual(projectListOptions({ name: '%_', limit: '100', offset: '2147483648' }), { name: '%_', limit: 100, offset: 2147483648 });
  for (const value of [{ extra: 'bad' }, { name: 'x'.repeat(201) }, { limit: '0' }, { limit: '101' }, { limit: '1.0' }, { offset: '-1' }, { offset: '01' }, { offset: '9007199254740992' }]) assert.equal(projectListOptions(value), undefined);
});

test('creation validates every code-point limit without changing supplied optional text', () => {
  const result = validateProjectInput({ name: '  Name  ', roughIdea: ' \n raw <b>notes</b> ' });
  assert.ok(result.valid); assert.equal(result.input.name, 'Name'); assert.equal(result.input.roughIdea, ' \n raw <b>notes</b> '); assert.equal(result.input.coreJob, '');
  for (const [field, limit] of Object.entries({ name: 200, ...contextLimits })) {
    assert.ok(validateProjectInput({ name: 'Name', [field]: '🙂'.repeat(limit) }).valid);
    for (const value of ['x'.repeat(limit + 1), null, 1, [], {}, '\0']) {
      const invalid = validateProjectInput({ name: 'Name', [field]: value });
      assert.equal(invalid.valid, false);
      if (!invalid.valid) assert.ok(invalid.fields[field]);
    }
  }
  for (const input of [null, [], 'bad', { name: 'Name', ownerId: 1 }]) {
    const invalid = validateProjectInput(input); assert.equal(invalid.valid, false);
    if (!invalid.valid) assert.ok(invalid.fields._form);
  }
});
