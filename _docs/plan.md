# Current plan

Project Scope Tool turns rough project ideas into a precise, justified MVP scope.

[GitHub issues](https://github.com/gmphto/project-scope-tool/issues) are the implementation backlog. Follow the [current process](process.md): groom, implement, independently verify, then close one issue at a time.

The current scaffold contains a minimal React shell, a Fastify database/schema readiness endpoint, ordered PostgreSQL migrations, isolated unit tests and real database integration tests. Issue #4 has deterministic authentication policy and a PostgreSQL identity/session/login-transaction persistence foundation; authentication routes, provider integration and UI remain unfinished. Project workflows, AI integration, navigation, and deployment belong to their later issues.

`_docs/outdated/` is historical reference, not the current product specification. Use current issues and AGENTS.md for scope and constraints.
