# Testing guidelines

Client tests use Vitest; server tests use Node's built-in runner through the installed tsx loader. Keep tests deterministic and isolated, with no database, identity provider or AI service needed for scaffold tests. Use Fastify injection for API contracts and close each application after its test.

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
