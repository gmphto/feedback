# AGENTS.md

## Commands

Keep this section synchronized with the workspace `package.json` scripts.

- `pnpm install` - install workspace dependencies
- `pnpm dev` - run the client and server development processes
- `pnpm test` - run workspace lifecycle tests and the complete client/server suite
- `node --test scripts/dev.test.mjs` - run the development lifecycle regression test
- `pnpm typecheck` - type-check every workspace package
- `pnpm --filter client test` - run all client tests
- `pnpm --filter client test -- <test-file>` - run one client test file
- `pnpm --filter server test` - type-check and run all server tests
- `pnpm --filter server exec tsx --test test/readiness.test.ts` - run the readiness API tests
- `pnpm build` - build every workspace package
- `pnpm --filter client build` - type-check and build the React client
- `pnpm --filter server build` - type-check and build the Fastify server

- `pnpm --filter server db:migrate` - apply PostgreSQL migrations using `DATABASE_URL`
- `pnpm --filter server test:integration` - run real PostgreSQL tests using `TEST_DATABASE_URL`; requires CONNECT/CREATEDB and drops only run-owned databases

## Rules
