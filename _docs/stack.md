# Current stack

Use a TypeScript modular monolith with separate pnpm `client` and `server` packages. Each package owns its dependencies and strict TypeScript configuration; client and server wire types remain separate.

Installed: React 19, Vite, Tailwind CSS 4, TypeScript and client Vitest; Fastify 5, TypeScript and tsx on the server. Server tests use Node's built-in test runner through tsx, not Vitest. Scaffold tests require no external services.

Selected for future issues, not installed: Zustand with Immer draft recipes and listener middleware for client state; PostgreSQL as authoritative persisted state with Kysely. Add dependencies only after user approval. Use JSON Schema for runtime transport validation, integer relational identifiers, and plain exported commands. Do not use Redux, Zod, shared wire packages, or class-based processors.

Keep domain rules outside React and HTTP handlers, and deterministic decisions separate from database, network, AI, time, and logging effects. Separate cached server state from editable drafts, with one mutation authority per representation and lifecycle phase. Reject stale aggregate writes using optimistic concurrency. Calculate reliable derived values from authoritative facts.

AI output is untrusted: validate it before creating drafts or proposals, and never let it directly mutate approved scope or calculate health. Use Server-Sent Events for AI response streaming. Do not add WebSockets, microservices, brokers, graph databases, or vector databases without new evidence.

Provider and hosting configuration belongs to later issues. Archived stack statements do not authorize additional tools or dependencies.
