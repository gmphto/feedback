# Current plan

Lumera turns rough project ideas into a precise, justified MVP scope.

[GitHub issues](https://github.com/gmphto/feedback/issues) are the implementation backlog. Follow the [current process](process.md): groom, implement, independently verify, then close one issue at a time.

The application contains a minimal React authentication UI, a Fastify database/schema readiness endpoint, ordered PostgreSQL migrations, isolated unit tests and real database integration tests. Issue #4 adds Auth0 OIDC authentication, PostgreSQL identities/application sessions, expiry/revocation, browser-bound callbacks and exact-Origin mutation protection. Automated signed fake-provider contracts cover token validation; a live Auth0 tenant smoke test remains unperformed. Project workflows, AI integration, navigation, and deployment belong to their later issues.

Issue #5 establishes actor-owned projects, complete nested parent checks, scoped read/list/name-update APIs and optimistic concurrency. Issue #6 adds the structured create form and atomic starting-context persistence, with owner-scoped saved definition reload. Optional user text remains unstructured text, not requirements or approved scope. Portfolio UI, definition editing and structured areas remain later work.

`_docs/outdated/` is historical reference, not the current product specification. Use current issues and AGENTS.md for scope and constraints.
