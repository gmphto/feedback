# Testing guidelines

Client tests use Vitest; server tests use Node's built-in runner through the installed tsx loader. Keep tests deterministic and isolated, with no database, identity provider or AI service needed for scaffold tests. Use Fastify injection for API contracts and close each application after its test.

Auth browser checks use Playwright against the real application with intercepted HTTP responses: `pnpm --filter client exec playwright test`. The config starts Vite on port 5187. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an existing Chromium executable when using a cached browser; otherwise install the runner's browser with `pnpm --filter client exec playwright install chromium`. Browser specs live in `client/test/browser` and are excluded from Vitest. These checks cover navigation, confirmation focus/cancellation, pending controls, retries, draft retention, and document replacement on logout or expiry.

Test observable behavior: successful outcomes and validation failures, plus authorization, cancellation and stale-state conflicts when the feature has those behaviors. Inject failing effects instead of relying on external outages; assert status, content type and exact API response shape. Do not invent authentication or concurrency behavior for the scaffold.

Run the smallest relevant test first, then the complete suite and build:

- `pnpm --filter client test -- src/app/App.test.tsx` runs one client file.
- `pnpm --filter client test` runs the client suite.
- `pnpm --filter server exec tsx --test test/readiness.test.ts` runs readiness tests.
- `pnpm --filter server test` type-checks and runs server tests.
- `pnpm test` runs all workspace tests.
- `pnpm build` type-checks and builds all packages.

For workspace lifecycle changes, exercise actual development startup, interrupt cleanup, and startup failure cleanup. Confirm test commands propagate a deliberately failing assertion, then remove it. Browser-check the minimal shell and its console when validating the scaffold.

Workspace lifecycle regression uses Node's built-in runner: `node --test scripts/dev.test.mjs`. The root suite runs it before package tests. It uses an ephemeral client port and an invalid server port to exercise startup failure and child-process cleanup.

Database integration tests use Node/tsx and real PostgreSQL. `pnpm --filter server test:integration` requires TEST_DATABASE_URL (never DATABASE_URL fallback), fails clearly if absent, and is included in server and root test commands. The role needs CONNECT and CREATEDB on a dedicated test instance. Tests create unique run-owned databases and close pools/drop only databases successfully created by that case, using cleanup registered before creation. Never reset/drop the supplied database or require it to be empty.

Run focused service-free tests first, then the integration suite, full `pnpm test`, and `pnpm build`. Assert real rollback state/history, concurrent migration history, empty/migrated readiness, sanitized configuration/connectivity errors and recovery. Migration completion and application shutdown must release their pools. Required migration names come from the application migration provider.
