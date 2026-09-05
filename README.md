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
and browser-bound, single-use login transactions. Session expiry is
fixed at eight hours (no sliding renewal); login transactions expire after ten
minutes. Both reject access at the expiry boundary. Provider verification must
succeed before creating a session, and persistence must commit before issuing
a cookie. No live Auth0 smoke test has been performed in this workspace.
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

## Project ownership API

Migration `0003_project_ownership` adds integer projects with an owner foreign
key, nonblank name (maximum 200 characters) and version initially 1. Minimal
feature-area/project and feature/feature-area foreign keys establish the actual
nested membership structure; later issues add product fields and workflows.
Apply migrations with `pnpm --filter server db:migrate` before using the API.

All project operations resolve the actor through the existing application
session guard. The server project module requires that actor for every query
and command and applies owner predicates in SQL. Nested reads constrain the
entire actual parent chain in the same query, even when all mismatched resources
belong to the same user. Production handlers cannot access an unscoped project
lookup/update or arbitrary database callback. Tests may seed relational fixtures
directly in their isolated databases.

| Route | Owner response |
| --- | --- |
| `GET /api/projects/:projectId` | `{ "project": { "id": 1, "name": "Scope", "version": 1 } }` |
| `GET /api/projects` | `{ "projects": [...] }` using the same representation |
| `PATCH /api/projects/:projectId` | Same project envelope with the saved name and incremented version |
| `GET /api/projects/:projectId/feature-areas/:featureAreaId` | `{ "featureArea": { "id": 1, "projectId": 1 } }` |
| `GET /api/projects/:projectId/feature-areas/:featureAreaId/features/:featureId` | `{ "feature": { "id": 1, "featureAreaId": 1 } }` |

PATCH accepts exactly `{ "name": "New name", "expectedVersion": 1 }`. It trims
the name, validates it, and increments version once inside an owner-scoped
transaction. A stale owner write returns 409
`{ "error": "conflict", "project": { "id": 1, "name": "Saved name", "version": 2 } }`
without changing data. Missing/foreign resources and parent mismatches return
the identical 404 `{ "error": "not_found" }`; foreign actors never see a
conflict representation. Submitted owner IDs, identity fields and extra PATCH
fields are rejected rather than silently removed. An internal create command
sets the owner from its actor; there is no public creation endpoint or UI yet.

Lists accept only optional `name` (case-insensitive literal substring, at most
200 characters), `limit` (1–100, default 50), and `offset` (nonnegative safe
integer, default 0). Ownership and filtering apply before name-then-ID ascending
ordering and pagination. `%` and `_` are literal search characters. Path IDs
are canonical positive decimals in PostgreSQL's integer range.

Authentication runs before resource validation. Missing/invalid sessions return
the existing 401, and unavailable auth returns its existing sanitized 503.
Unsafe methods require exact application Origin before authentication, so even
an unauthenticated cross-site PATCH returns 403 without mutation. Authenticated
invalid IDs, names, versions, list parameters or extra fields return 400
`{ "error": "invalid_request" }` independently of resource existence. A project
database failure returns 503 `{ "error": "project_unavailable" }`. Protected
project responses use `Cache-Control: no-store`.

Real PostgreSQL/Fastify tests exercise two users, same-owner projects, multiple
areas within one project, cross-owner and same-owner parent swaps, forged
ownership, unchanged rejected writes and concurrent expected-version conflicts.
Run focused policy tests with
`pnpm --filter server exec tsx --test test/project-policy.test.ts`, then supply
`TEST_DATABASE_URL` and run
`pnpm --filter server exec tsx --test test/integration/projects.test.ts` before
the full test/build commands.

## Auth0 authentication

Fastify owns OIDC Authorization Code with PKCE S256, callback verification,
local identity and PostgreSQL application sessions. The client uses Auth0
Universal Login, with no provider tokens in cookies, browser storage or API
responses. Configure an Auth0 **Regular Web Application**, then set these
server environment variables before starting development:

| Variable | Contract |
| --- | --- |
| `AUTH0_ISSUER_BASE_URL` | Required HTTPS Auth0 issuer origin, e.g. `https://tenant.example/`; normalized with a trailing slash. |
| `AUTH0_CLIENT_ID` | Required nonblank Auth0 Regular Web Application client ID; preserved exactly. |
| `AUTH0_CLIENT_SECRET` | Required nonblank server-only client secret; preserved exactly. Never use a `VITE_` prefix or send it to the browser. |
| `APP_ORIGIN` | Required HTTPS application origin, e.g. `https://scope.example`; normalized without a trailing slash. |
| `AUTH_ALLOW_LOCAL_HTTP` | Absent or literal `false` by default; literal `true` requires `NODE_ENV=development` or `NODE_ENV=test`. Other values are invalid. |

Issuer and application URLs reject credentials, non-root paths, queries and
fragments. The callback URL is always normalized `APP_ORIGIN` plus
`/auth/callback`; request Host/forwarded headers cannot select it. This is the
callback URL to allow in the Auth0 Regular Web Application setup.
For explicit local development only, the HTTP opt-in allows `APP_ORIGIN` such
as `http://127.0.0.1:5173` (also literal `localhost` or `[::1]`, with an optional
port). Production and unspecified environments reject the opt-in entirely.
HTTPS applications always require Secure cookies even with the flag enabled;
the issuer must always use HTTPS. Fake provider transport belongs only in tests.

Missing or invalid configuration returns only `authentication_unavailable` from
the parser, never input values, credentials or parser errors. Sign-in and session
routes map unavailable configuration/database/provider services to HTTP 503
`{"error":"authentication_unavailable"}`. Request logging records only the
registered route and response status, excluding raw URLs, queries, headers and
framework request-error payloads. Provider failures are never explicitly logged.

For local development, set `NODE_ENV=development`, `AUTH_ALLOW_LOCAL_HTTP=true`,
and `APP_ORIGIN=http://127.0.0.1:5173`. Set the real tenant issuer/client ID and
client secret in your shell or secret manager; do not put secrets in source code
or Vite variables. In Auth0, allow callback URL
`http://127.0.0.1:5173/auth/callback` and application origin
`http://127.0.0.1:5173`. Apply migrations, then run `pnpm dev`. Vite proxies
`/auth` and `/api` to Fastify on `PORT` (default 3000), keeping browser requests
on the configured application origin. Always open the exact configured origin;
`localhost` and `127.0.0.1` are different origins. In production, terminate HTTPS
and route `/auth` and `/api` to Fastify under the same `APP_ORIGIN`; do not enable
the HTTP opt-in. There is no implicit `.env` loader.

The browser sign-in control requests `GET /auth/login?returnTo=/` with
`Accept: application/json`, receiving only `{ "authorizationUrl": "..." }`
and an HttpOnly login-transaction cookie before navigating to Auth0. This lets
the UI show retryable availability errors. Ordinary browser GETs to that route
redirect directly to hosted login. Unsafe return paths fall back to `/`.
Callbacks consume browser-bound state exactly once before code exchange and
validate nonce, PKCE, signature, issuer, audience and token timing through
`openid-client`. Failed/cancelled callbacks redirect to `/?authError=1` with a
generic retry UI and no new session.

Production uses `__Host-scope_session` and `__Host-scope_login` cookies with
HttpOnly, Secure, SameSite=Lax and Path=/; explicit local HTTP uses `scope_session`
and `scope_login` without Secure. No Domain attribute is set. Session cookies
expire no later than their fixed eight-hour server expiry; there is no sliding
renewal. Login transactions expire after ten minutes. Both reject use at the
expiry boundary. PostgreSQL stores SHA-256 identifier digests, never raw session
identifiers or provider tokens. Local users are unique by issuer plus subject,
not email.

`GET /api/session` returns exactly `{"user":{"id":<integer>}}` for an active
session, or 401 `{"error":"unauthorized"}` and clears an invalid cookie.
`POST /auth/logout` revokes the app session and clears the cookie with HTTP 204;
replay fails and repeated logout is safe. Unsafe authentication requests reject
missing, `null` or mismatched Origin with 403 `{"error":"forbidden"}` before
mutation. The expected value is the exact normalized `APP_ORIGIN`. The callback
GET uses its single-use browser binding instead. `GET /api/ready` remains public.
Signing out ends only this application's session; Auth0 may retain its own SSO
session, so a later sign-in may not ask for credentials again.

The client API facade owns transport; Zustand with Immer draft recipes and
selector listener middleware owns pending, signed-out, signed-in and retry
state. New requests cancel older work and ignore late results. A 401 clears
signed-in state, service failures show retry controls, and returning focus to
the page rechecks the session. No editable project draft exists yet.

### Automated and browser checks without a live tenant

The full suite includes a listening local fake OIDC provider that signs RSA
fixtures with Node crypto and exercises the real `openid-client` discovery,
exchange and token validation boundary. It tests invalid signature, issuer,
audience, expiry, nonce, future timing, missing ID token, bad PKCE, state/browser
binding, replay, cancellation and provider failure. Real PostgreSQL HTTP tests
also verify session cookies, CSRF, revocation, expiry and database failure.
These are deterministic provider contract tests, not a live Auth0 smoke result.

For interactive QA, with `TEST_DATABASE_URL` configured as described above:

```powershell
# Terminal 1: test-only API/provider, with a unique run-owned database
pnpm --filter server exec tsx test/fixtures/auth-browser.ts
# Terminal 2: client only (do not run pnpm dev alongside the test API)
pnpm --filter client dev --host 127.0.0.1
```

Open `http://127.0.0.1:5173`. Sign-in completes through the signed fake provider.
For a retry case, open `/api/test/provider-mode?mode=cancel` on that origin,
return to `/`, and sign in again; use `mode=valid` to restore success. Other
modes include `failure`, `signature`, `issuer`, `audience`, `expiry` and `nonce`.
Only this explicitly launched test harness exposes that control; production
does not import or expose the fake provider. A brief harness-only delay makes
pending/cancel controls observable. Check Tab/Enter interaction, cancellation,
retry, sign-out, and narrow/wide layouts. Ctrl+C on the API closes pools/provider
and drops only its uniquely created test database.

### Live Auth0 smoke procedure (not yet performed)

1. Configure a real Auth0 Regular Web Application and the exact allowed callback
   and application origin above; supply server credentials and migrated database.
2. Start the app at the configured origin. Sign in through the actual Universal
   Login screen and confirm the signed-in view and 200 `/api/session` response.
3. Inspect browser storage: only opaque app/login cookies, no provider tokens;
   on HTTPS confirm HttpOnly, Secure, SameSite=Lax and Path=/.
4. Cancel a fresh hosted login and confirm generic retry with no new session.
5. Sign out of this app; verify 204, cleared cookie, and old-cookie replay 401.
   Confirm a cross-origin logout attempt returns 403 without revoking the session.
6. Record tenant/environment, date and observed results without credentials or
   token values. No live tenant credentials were available for the implementation
   tests, so this procedure must not be reported as passed until actually run.
