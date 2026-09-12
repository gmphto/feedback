import { spawn } from 'node:child_process';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

try {
  loadEnvFile(new URL('../.env.local', import.meta.url));
} catch (error) {
  if (error.code !== 'ENOENT') {
    console.error('Could not load .env.local. Check that the file is readable.');
    process.exit(1);
  }
}

const children = [];
let stopping = false;

function stop(code) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) {
    if (!child.pid || child.exitCode !== null || child.signalCode !== null) continue;
    if (process.platform === 'win32') {
      // Windows signals do not propagate to descendants such as Vite's esbuild.
      spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      try { process.kill(-child.pid, 'SIGTERM'); } catch (error) {
        if (error.code !== 'ESRCH') throw error;
      }
    }
  }
}

for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => stop(0));

for (const [name, args] of [
  ['client', ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--strictPort', ...process.argv.slice(2)]],
  ['server', ['--import', 'tsx', 'src/main.ts']],
]) {
  const child = spawn(process.execPath, args, {
    cwd: `${root}/${name}`,
    stdio: 'inherit',
    detached: process.platform !== 'win32',
  });
  children.push(child);
  if (child.pid) console.log(`Starting ${name} (pid ${child.pid})`);
  child.on('error', (error) => {
    console.error(`${name} could not start:`, error);
    stop(1);
  });
  child.on('exit', (code, signal) => {
    if (!stopping) {
      console.error(`${name} exited (code ${code}, signal ${signal}); stopping development processes.`);
      stop(code || 1);
    }
  });
}
