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

Add database migration commands here when Task 3 establishes them. Do not
invent or document a command before its script exists.

## Rules

- Read `_docs/plan.md` and `_docs/stack.md` before planning implementation.
- Use the GitHub issues as the implementation backlog.
- Work on one issue at a time unless the user explicitly requests a larger scope.
- Keep each change small enough to validate in one session.
- Follow the selected TypeScript modular-monolith architecture.
- Use a pnpm workspace with separate `client` and `server` packages.
- Use Vite, React 19, strict TypeScript, and Tailwind CSS 4 in the client.
- Use Zustand, Immer draft recipes, and listener middleware for client state.
- Use Fastify 5, Kysely, and PostgreSQL on the server.
- Use JSON Schema for runtime transport validation. Do not use Zod.
- Keep client and server wire types separate. Do not add a shared types package.
- Use integer identifiers for relational entities. Do not use GUIDs.
- Use plain exported command functions. Do not add class-based processors.
- Do not use Redux.
- Add dependencies in the owning package's `package.json`.
- Do not add, remove, or upgrade a dependency without asking the user first.
- Prefer platform and framework features before adding a package.
- Keep domain rules outside React components and HTTP route handlers.
- Keep deterministic decisions separate from database, network, AI, time, and logging effects.
- Treat PostgreSQL as the authoritative source for persisted project state.
- Keep cached server state and editable drafts as separate representations.
- Give each mutable representation one mutation authority during each lifecycle phase.
- Use optimistic concurrency for editable aggregates and reject stale writes.
- Keep project health deterministic. AI must not calculate or override health scores.
- Treat AI output as untrusted input. Validate it before creating draft commands or proposals.
- Do not let AI output mutate approved scope directly.
- Use Server-Sent Events for AI response streaming.
- Do not add WebSockets without a demonstrated bidirectional requirement.
- Do not add microservices, a message broker, a graph database, or a vector database without new evidence.
- Do not store derived values when they can be calculated reliably from authoritative facts.
- Add tests for successful behavior, validation failures, authorization, cancellation, and stale-state conflicts.
- Run the smallest relevant test first, then run `pnpm test` and `pnpm build` before completion.
- Do not rewrite unrelated code or change public contracts without necessity.
- Update `_docs/stack.md` when an architectural decision changes.
- Report files changed, commands run, results, and remaining risks when work finishes.
- `_docs/process.md` - how work is organized
- Before writing tests, read `_docs/testing-guidelines.md`
- For anything touching the UI, read `_docs/design-system.md`

