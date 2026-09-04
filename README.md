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
