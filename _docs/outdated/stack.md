# Project Scope Tool — Selected Technology Stack

## Status

**Selected:** Option 1 — React, Fastify, and PostgreSQL.

This document records the initial architecture decision for the MVP. It does
not define implementation details that belong in feature-level design.

## Decision Summary

Build the product as a TypeScript modular monolith with one web client, one
application server, and one PostgreSQL database.

Use Server-Sent Events for AI response streaming. Keep ordinary reads and
writes on HTTP JSON endpoints.

The selected stack is:

| Area | Selection |
| --- | --- |
| Workspace | pnpm workspace |
| Client | React 19, Vite 8, strict TypeScript |
| Client state | Zustand, Immer, listener middleware |
| Styling | Tailwind CSS 4 and CSS custom properties |
| Server | Fastify 5 on a supported Node.js LTS release |
| Runtime validation | JSON Schema with `json-schema-to-ts` |
| Database | PostgreSQL |
| Query layer | Kysely |
| Identity provider | Auth0 Universal Login over OpenID Connect |
| AI integration | AI SDK Core behind an application-owned boundary |
| Streaming | Server-Sent Events |
| Unit and integration tests | Vitest |
| Browser tests | Playwright |
| Deployment | One application container and managed PostgreSQL |

Use current stable patch releases within these major versions. Pin exact
versions in the lockfile when the workspace is created.

## Why This Stack

The product needs a rich editor, deterministic domain rules, transactional
scope changes, and streamed AI responses.

React and Vite support the split-screen scoping workspace. They also follow
the project owner's established frontend conventions.

Fastify provides a small TypeScript server with runtime schema validation,
request lifecycle hooks, OpenAPI support, and SSE support.

Kysely keeps SQL and transaction boundaries visible. It adds compile-time
query checking without hiding PostgreSQL behind a large object graph.

PostgreSQL fits the relational domain model. Recursive queries support feature
dependency traversal and Product Map projections. Transactions protect scope
baselines, approved changes, and immutable decisions.

AI SDK Core supports provider adapters, structured output, streaming,
cancellation, and timeouts. The application will not expose its types directly
to the domain model.

## Architecture Shape

Use a modular monolith. Do not create microservices for the MVP.

Organize server modules around the product boundaries from
[`plan.md`](plan.md):

- Portfolio
- Project Definition
- Scope
- Features
- Dependencies
- AI Scoping
- Delivery
- Weekly Review
- Scope Governance
- Decisions
- Export

Each module owns its domain rules and persistence operations. Share utilities
only after a real second consumer establishes shared ownership.

Keep deterministic decisions separate from effects:

```text
domain rules and state transitions
            ↓
application commands and queries
            ↓
PostgreSQL, AI provider, time, logging, and HTTP
```

Do not add repositories, mediators, event buses, or rules engines by default.
Add an abstraction only when it protects an invariant or hides real
integration complexity.

## State and Ownership

PostgreSQL owns authoritative project state.

The client API facade owns the refreshed client representation. The editor
owns a separate baseline and editable draft. These representations must not
share one mutable object.

Components read narrow view models and issue semantic commands. Components do
not mutate cached server state or domain records directly.

Use this lifecycle for editing:

```text
PostgreSQL record
→ HTTP response
→ client API facade
→ editor baseline and draft
→ validated command
→ server transaction
→ updated response
→ facade refresh
→ editor close, refresh, or conflict resolution
```

Use integer relational identifiers. Add an integer version value to editable
aggregates for optimistic concurrency checks.

Reject stale writes. Return the current server representation so the editor
can refresh or present a conflict.

## AI Scoping Boundary

The AI is advisory. It does not own project scope or project health.

The AI can return conversation text and structured proposals. The server must
validate each proposal before it reaches domain state.

Major scope changes remain proposals until the user approves them. Minor draft
edits can update the active editing representation without changing an
approved baseline.

Use this flow:

```text
user message and current project context
→ AI request
→ streamed conversational response
→ structured proposed commands
→ runtime schema validation
→ domain validation
→ draft update or pending proposal
```

Propagate request cancellation to the model provider. Record completion,
failure, cancellation, and incomplete responses explicitly.

Use SSE for the initial one-way response stream. Do not add WebSockets until a
demonstrated bidirectional real-time requirement exists.

## Persistence Approach

Store the core model relationally:

- projects and feature areas;
- features and sub-features;
- acceptance criteria;
- dependency edges;
- scope stages and feature status;
- weekly reviews;
- pending scope-change proposals;
- approved scope versions;
- immutable decisions and supersession links.

Use `jsonb` only for flexible AI message content, provider metadata, and
captured structured output. Do not store the complete domain model as one JSON
document.

Calculate health, completion, risk, and build sequences from authoritative
facts. Persist a derived value only when a measured performance need requires
it.

Use ordinary dependency edges with recursive PostgreSQL queries. Do not add a
graph database for the MVP.

Assemble AI context from the current project records. Do not add embeddings or
a vector database until context size or retrieval quality proves the need.

## Client Conventions

Follow the owner's TypeScript React conventions:

- use a pnpm workspace;
- use Vite, React 19, and strict TypeScript;
- use Zustand, Immer draft recipes, and listener middleware;
- keep feature code under `features/<feature>/`;
- keep the application shell and API client under `app/`;
- keep generic UI under `shared/ui/`;
- use plain exported command functions;
- keep filtering, sorting, and grouping client-side where practical;
- declare wire contracts separately in the client and server;
- use integer relational identifiers;
- do not use Redux, Zod, or class-based processors.

The client and server must map their separate wire types at the HTTP boundary.
Static TypeScript types do not replace runtime validation.

## Suggested Workspace Shape

```text
/
├── client/
│   └── src/
│       ├── app/
│       ├── features/
│       ├── shared/ui/
│       ├── util/
│       └── lib/
├── server/
│   └── src/
│       ├── app/
│       ├── modules/
│       ├── db/
│       └── integrations/
├── _docs/
├── package.json
└── pnpm-workspace.yaml
```

This shape shows ownership boundaries. It does not require one file or layer
for every noun.

## Authentication

Authentication is required supporting functionality. Keep authorization and
session enforcement on the server.

Use Auth0 as the identity provider through its hosted Universal Login and the
OpenID Connect Authorization Code flow. The Fastify server owns the callback,
creates the application session, and stores that session in PostgreSQL. The
browser receives only an opaque session cookie; it does not store Auth0 tokens.

Auth0 owns authentication only. It must not own project data, application
sessions, or domain authorization rules.

## Deployment

Deploy the Vite output and Fastify server together from one application
container. Use a managed PostgreSQL service with automated backups.

Run one deployment unit initially. Add separate workers only when measured AI
request duration or background work requires them.

Generate exports on demand. Do not add object storage until export size or
retention requirements justify it.

## Validation Strategy

Use several focused test layers:

- unit tests for health, risk, progress, gates, and build sequences;
- transition tests for feature and scope workflows;
- database integration tests for transactions and dependency queries;
- API tests for runtime validation and concurrency conflicts;
- browser tests for project creation, scoping, approval, and export;
- AI contract tests with recorded provider-independent fixtures.

Do not make ordinary domain tests depend on a live model provider.

## Deferred Decisions

Decide these items before their implementation starts:

- AI model provider and model selection;
- managed PostgreSQL vendor;
- application hosting vendor;
- observability provider;
- retention policy for AI conversations.

These choices do not change the selected architecture.

## Explicit Non-Choices

Do not use these technologies in the MVP without new evidence:

- microservices;
- WebSockets;
- a graph database;
- a vector database;
- a message broker;
- a workflow engine;
- a shared client-server types package;
- a client-side database;
- direct AI writes to authoritative scope.

## References

- [React 19](https://react.dev/blog/2024/12/05/react-19)
- [Vite documentation](https://vite.dev/guide/)
- [Fastify documentation](https://fastify.dev/docs/latest/)
- [Fastify 5 LTS policy](https://fastify.dev/docs/v5.7.x/Reference/LTS/)
- [Kysely documentation](https://www.kysely.dev/)
- [PostgreSQL documentation](https://www.postgresql.org/docs/current/)
- [Auth0 authentication flows](https://auth0.com/docs/get-started/authentication-and-authorization-flow)
- [AI SDK Core](https://ai-sdk.dev/docs/reference/ai-sdk-core)
