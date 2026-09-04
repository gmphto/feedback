import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { test } from 'node:test';

// Actual child processes exercise failure propagation and companion cleanup.
test('a server startup failure terminates the development workspace', { timeout: 15_000 }, async () => {
  const child = spawn(process.execPath, ['scripts/dev.mjs', '--port', '0'], {
    env: { ...process.env, PORT: 'invalid' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (data) => { output += data; });
  child.stderr.on('data', (data) => { output += data; });
  const [code] = await once(child, 'close');
  assert.notEqual(code, 0, output);
  assert.match(output, /PORT must be an integer between 1 and 65535/);
  const started = [...output.matchAll(/Starting (?:client|server) \(pid (\d+)\)/g)];
  assert.equal(started.length, 2, output);
  for (const [, pid] of started) {
    assert.throws(() => process.kill(Number(pid), 0), { code: 'ESRCH' }, `Process ${pid} survived startup failure`);
  }
});

