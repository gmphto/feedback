import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import {
  copyFile,
  mkdir,
  mkdtemp,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

for (const scenario of [
  {
    name: 'loads root .env.local into both children',
    file: 'from-file',
    expected: 'from-file',
  },
  {
    name: 'preserves shell values over .env.local',
    file: 'from-file',
    shell: 'from-shell',
    expected: 'from-shell',
  },
  {
    name: 'starts without .env.local',
    expected: null,
  },
]) {
  test(scenario.name, { timeout: 15_000 }, async (context) => {
    const root = await mkdtemp(join(tmpdir(), 'feed-dev-env-'));
    context.after(async () => {
      await rm(root, { recursive: true, force: true });
    });
    await mkdir(join(root, 'scripts'));
    await mkdir(join(root, 'client/node_modules/vite/bin'), { recursive: true });
    await mkdir(join(root, 'server/node_modules/tsx'), { recursive: true });
    await mkdir(join(root, 'server/src'));
    await copyFile(new URL('./dev.mjs', import.meta.url), join(root, 'scripts/dev.mjs'));
    await writeFile(join(root, 'server/node_modules/tsx/package.json'), JSON.stringify({ main: 'index.js' }));
    await writeFile(join(root, 'server/node_modules/tsx/index.js'), '');

    const probe = `
      const { existsSync, writeFileSync } = require('node:fs');
      const { basename, resolve } = require('node:path');
      const name = basename(process.cwd());
      console.log('PROBE ' + JSON.stringify({ name, value: process.env.FEED_DEV_ENV_TEST ?? null }));
      writeFileSync(resolve('..', name + '.ready'), '');
      setInterval(() => {
        if (existsSync(resolve('../client.ready')) && existsSync(resolve('../server.ready'))) {
          process.exit(1);
        }
      }, 20);
    `;
    await writeFile(join(root, 'client/node_modules/vite/bin/vite.js'), probe);
    await writeFile(join(root, 'server/src/main.ts'), probe);
    if (scenario.file !== undefined) {
      await writeFile(join(root, '.env.local'), `FEED_DEV_ENV_TEST=${scenario.file}\n`);
    }

    const env = { ...process.env };
    delete env.FEED_DEV_ENV_TEST;
    if (scenario.shell !== undefined) {
      env.FEED_DEV_ENV_TEST = scenario.shell;
    }
    const child = spawn(process.execPath, [join(root, 'scripts/dev.mjs')], {
      cwd: tmpdir(),
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', (data) => {
      output += data;
    });
    child.stderr.on('data', (data) => {
      output += data;
    });
    await once(child, 'close');
    const observed = [...output.matchAll(/PROBE (.+)/g)].map((match) => JSON.parse(match[1]));
    assert.deepEqual(observed.sort((a, b) => a.name.localeCompare(b.name)), [
      { name: 'client', value: scenario.expected },
      { name: 'server', value: scenario.expected },
    ]);
  });
}

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
