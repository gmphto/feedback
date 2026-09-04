# Project Scope Tool

Turn rough project ideas into a precise, justified MVP scope.

## Requirements

- Node.js 22.13 or newer
- pnpm 11.5.0

## Commands

- `pnpm install` installs workspace dependencies.
- `pnpm dev` starts the client and server development processes.
- `pnpm test` runs the client and server test suites.
- `pnpm --filter client test` runs all client tests.
- `pnpm --filter client test -- src/app/App.test.tsx` runs one client test file.
- `pnpm --filter server test` type-checks and runs all server tests.
- `pnpm --filter server exec tsx --test test/readiness.test.ts` runs the readiness API tests.
- `pnpm build` builds all workspace packages.
- `pnpm --filter client build` builds the client.
- `pnpm --filter server build` builds the server.

## Application readiness

The server's persistent API tests use Fastify injection, Node's built-in test
runner, and the existing `tsx` dependency; they require no listening port or
external service. They cover success, failure, safe error responses, and recovery.

With the server running, request `GET http://localhost:3000/api/ready`
(or use the port configured through `PORT`). No sign-in is required.

- HTTP 200 with `{"status":"ready"}` means the application check succeeded.
- HTTP 503 with `{"status":"not_ready"}` means the check failed, including
  an unexpected exception. The response contains no internal error details.

Each request runs the check again, so the endpoint can recover after a failed
check without restarting the server. This currently checks application
readiness only and makes no external calls. PostgreSQL connectivity and schema
readiness are added by [issue #3](https://github.com/gmphto/project-scope-tool/issues/3).

## Local development

From a clean checkout, run `pnpm install --frozen-lockfile`, then `pnpm dev`.
Open http://127.0.0.1:5173 for the client. The API listens on
http://localhost:3000 by default. No database, Auth0, or AI credentials are
required. Vite refreshes client edits; restart `pnpm dev` after server edits.
Ctrl+C stops both development processes. If either process cannot start or
exits, the supervisor stops its companion and returns a nonzero status.
The client port defaults to 5173; an occupied port fails visibly. Vite CLI
options can be forwarded, for example `pnpm dev -- --port 5174`.

The server currently reads only `PORT` (default `3000`), an integer from 1
through 65535. For example, in PowerShell:

```powershell
$env:PORT = '3001'
pnpm dev
Remove-Item Env:PORT
```

On a POSIX shell: `PORT=3001 pnpm dev`. There is no `.env` loader or required
secret file. Vite's standard development/production mode is managed by its
commands; the client reads no application environment variables.

`pnpm test` runs isolated tests without external services. `pnpm build`
type-checks both packages and emits `client/dist/index.html` with its assets
and `server/dist/main.js` with its server modules. After building,
`pnpm --filter client preview` previews the client output and
`pnpm --filter server start` starts the compiled API. `pnpm typecheck`
checks all workspace packages without building server output.

Current contributor guidance: [_docs/plan.md](_docs/plan.md),
[_docs/stack.md](_docs/stack.md),
[_docs/testing-guidelines.md](_docs/testing-guidelines.md), and
[_docs/design-system.md](_docs/design-system.md).

