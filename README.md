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
check without restarting the server. Production readiness includes PostgreSQL connectivity and required migration history established by [issue #3](https://github.com/gmphto/project-scope-tool/issues/3).

## Local development

From a clean checkout, run `pnpm install --frozen-lockfile`, then `pnpm dev`.
Open http://127.0.0.1:5173 for the client. The API listens on
http://localhost:3000 by default. No database, Auth0, or AI credentials are
required to start; database configuration and migrations are required for ready status.
Vite refreshes client edits; restart `pnpm dev` after server edits.
Ctrl+C stops both development processes. If either process cannot start or
exits, the supervisor stops its companion and returns a nonzero status.
The client port defaults to 5173; an occupied port fails visibly. Vite CLI
options can be forwarded, for example `pnpm dev -- --port 5174`.

The server reads `DATABASE_URL` (no default) and `PORT` (default `3000`), an integer from 1
through 65535. For example, in PowerShell:

```powershell
$env:PORT = '3001'
pnpm dev
Remove-Item Env:PORT
```

On a POSIX shell: `PORT=3001 pnpm dev`. There is no `.env` loader or required
secret file. Vite's standard development/production mode is managed by its
commands; the client reads no application environment variables.

`pnpm test` includes real PostgreSQL tests and requires `TEST_DATABASE_URL` (no default). `pnpm build`
type-checks both packages and emits `client/dist/index.html` with its assets
and `server/dist/main.js` with its server modules. After building,
`pnpm --filter client preview` previews the client output and
`pnpm --filter server start` starts the compiled API. `pnpm typecheck`
checks all workspace packages without building server output.

Current contributor guidance: [_docs/plan.md](_docs/plan.md),
[_docs/stack.md](_docs/stack.md),
[_docs/testing-guidelines.md](_docs/testing-guidelines.md), and
[_docs/design-system.md](_docs/design-system.md).

## PostgreSQL migrations and integration tests

PostgreSQL 17 is the verified local version. Supply an existing application
database and a role allowed to create tables in its `public` schema. Application
startup never creates databases or applies migrations. From installation to start:

```powershell
pnpm install --frozen-lockfile
$env:DATABASE_URL = 'postgresql://app_user:example_only@127.0.0.1:5432/scope_app'
pnpm --filter server db:migrate
pnpm dev
```

Replace the example role/password with local configuration; never commit real
credentials. Environment variables must be set in the process environment;
there is no `.env` loader. The migration command uses ordered immutable files
under `server/src/db/migrations`; never modify an already-applied migration.
The initial migration creates only Kysely metadata, with no product tables.
The second migration adds local identities, digest-only application sessions,
and browser-bound, single-use login transactions. This persistence foundation
is not yet connected to authentication routes or a login UI. Session expiry is
fixed at eight hours (no sliding renewal); login transactions expire after ten
minutes. Both reject access at the expiry boundary. Provider verification must
succeed before creating a session, and persistence must commit before issuing
a cookie. No live Auth0 smoke test has been performed for this foundation.
Repeated migrations are safe. Kysely serializes migrations using its PostgreSQL
locking and transactions; failure returns a sanitized nonzero result and rolls
back the failed migration.

Database connection acquisition and PostgreSQL statements each have a 3-second
timeout; the client query timeout is 4 seconds. Readiness checks only read
migration history and never migrate. The production endpoint now returns 503
when database configuration is absent/invalid, connectivity fails, or a required
migration is absent, and recovers to 200 on a successful recheck. Responses still
contain only `status`. Pools are closed by migration completion and server
shutdown.

Real PostgreSQL tests require a separately supplied `TEST_DATABASE_URL`:

```powershell
$env:TEST_DATABASE_URL = 'postgresql://test_user:example_only@127.0.0.1:5432/scope_test_host'
pnpm --filter server test:integration
pnpm test
pnpm build
```

Use a dedicated local/test PostgreSQL instance. The test role needs `CONNECT`
on the supplied database and `CREATEDB`; it owns each temporary database it
creates. Each case creates a unique `scope_test_...` database, migrates from
empty, closes all connections and drops only its own successfully created
database in test cleanup, including assertion failures. The supplied database is
never reset/dropped and need not be empty. Tests never fall back to
`DATABASE_URL`. Missing test configuration fails the integration and full suites
with a setup message instead of skipping coverage.

`pnpm --filter server test` type-checks and runs service-free tests followed by
integration tests. `pnpm --filter server exec tsx --test test/readiness.test.ts`
still runs the isolated injected API coverage without PostgreSQL.
