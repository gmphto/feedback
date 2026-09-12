# AGENTS.md

Project code: `FEED`.

## Commands

Root scripts are `dev`, `build`, `test`, and `typecheck`; keep this list synchronized with the workspace `package.json`. Every package script also runs as `pnpm --filter <client|server> <script>`.

- `pnpm install` - install workspace dependencies
- `pnpm dev` - load optional root `.env.local`, then run client and server; existing shell variables take precedence
- `pnpm test` - lifecycle tests plus all client and server suites, including PostgreSQL integration tests
- `pnpm typecheck` / `pnpm build` - for every package; a package build type-checks first
- `pnpm --filter client test [-- <file>]` - client suite, or one client test file
- `pnpm --filter server exec tsx --test test/<file>.ts` - one server test file, for example `readiness.test.ts`
- `pnpm --filter server db:migrate` - PostgreSQL migrations using `DATABASE_URL`
- `pnpm --filter server test:integration` - real PostgreSQL tests using `TEST_DATABASE_URL`; requires CONNECT/CREATEDB and drops only run-owned databases
- `node --test scripts/dev.test.mjs` - development lifecycle regression test

## Rules

- `_docs/process.md` - how work is organized
- `_docs/code-style.md` - coding requirements and review criteria; read before writing or reviewing code
- `_docs/testing-guidelines.md` - read before writing tests
