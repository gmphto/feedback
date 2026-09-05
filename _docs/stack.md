# Current stack

Use a TypeScript modular monolith with separate pnpm `client` and `server` packages. Each package owns its dependencies and strict TypeScript configuration; client and server wire types remain separate.

Installed: React 19, Vite, Tailwind CSS 4, TypeScript and client Vitest; Fastify 5, TypeScript and tsx on the server. Server tests use Node's built-in test runner through tsx, not Vitest. Focused readiness/configuration tests require no external services. The full suite includes real PostgreSQL integration tests with a separately supplied TEST_DATABASE_URL.

Selected for future issues, not installed: Zustand with Immer draft recipes and listener middleware for client state. Introduce this infrastructure only when used by later issues. Installed server database tooling is Kysely with pg and its development types; PostgreSQL remains authoritative persisted state. Add dependencies only after user approval. Use JSON Schema for runtime transport validation, integer relational identifiers, and plain exported commands. Do not use Redux, Zod, shared wire packages, or class-based processors.

Keep domain rules outside React and HTTP handlers, and deterministic decisions separate from database, network, AI, time, and logging effects. Separate cached server state from editable drafts, with one mutation authority per representation and lifecycle phase. Reject stale aggregate writes using optimistic concurrency. Calculate reliable derived values from authoritative facts.

AI output is untrusted: validate it before creating drafts or proposals, and never let it directly mutate approved scope or calculate health. Use Server-Sent Events for AI response streaming. Do not add WebSockets, microservices, brokers, graph databases, or vector databases without new evidence.

Provider and hosting configuration belongs to later issues. Archived stack statements do not authorize additional tools or dependencies.

Authentication persistence uses integer users unique by issuer and subject, SHA-256 digests of cryptographically random session identifiers, and browser-bound login transactions consumed with atomic DELETE RETURNING. Identity upsert and session insert share a database transaction. Absolute session expiry is eight hours; login transactions expire after ten minutes, using an injected clock. The maintained OIDC adapter, cookie integration and authentication UI are still pending dependency approval and implementation.

Authentication configuration targets an Auth0 Regular Web Application with server-only client credentials, a normalized HTTPS issuer and a configured application origin that determines the callback. Explicit local HTTP is restricted to literal loopback hosts in development/test; HTTPS always requires Secure cookies. The parser is not yet wired to routes. Fastify automatic per-request logging is replaced by route/status-only completion logs so callback queries and raw provider errors are not logged by framework request logging.
