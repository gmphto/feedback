# Projects boundary remediation — 2026-09-05

Design Authority: APPROVED FOR IMPLEMENTATION. This is a new post-audit
remediation design, not retrospective approval of the original issue #6 design.

Preserve issues #5/#6 behavior while correcting one server project-name rule,
one production creation command, executable client JSON Schema validation,
error-summary focus, rendered verification, readability, naming and exports.
No new product behavior, database/HTTP contract changes or dependencies.

The project model owns draft, route, status, errors, actor and operation lifecycle.
The API facade owns saved representations. Server policy owns name decisions;
creation validation delegates to it. The project module owns persistence.
Fastify owns server transport. A bounded client-local matcher shared by Auth and
Projects owns structural response validation; client/server wire types stay separate.

The name validator returns enough information for exact creation field messages
and rename rejection: trim, required, no NUL, maximum 200 Unicode code points.
Optional context remains exact text, defaulting to empty strings. Remove the
test-only createProject command; createDefinition remains the sole creation path.
Normal fixtures use that command with a small test-local empty-context helper.

Persistence clarification approved by Design Authority: only the explicit legacy
pre-0004 fixture may insert the minimum owner/name project rows directly in SQL.
createDefinition requires context columns that do not exist before that migration.
This preserves backfill coverage; it is not a reusable current-schema seed path.

Extract the existing Auth matcher and support only object/string/integer,
required, additionalProperties:false, nesting, minimum and maximum. Projects
executes an exact envelope schema with all eight string fields, positive
PostgreSQL integer id, and positive integer version before casting/caching.
Retain requested-id and created-version checks, operation/actor/route gates,
cancellation, explicit retries and creation navigation after confirmed success.

Derive hasErrors and depend on its false-to-true transition for summary focus.
Do not add focus state to the store. Expand compressed routes/model/view and
creation transitions without splitting cohesive modules. Clarify requireProjects,
response/cache handling, operation currentness and authentication callback names.
Remove demonstrably unused type exports only.

Sequence: shared matcher/Auth; Projects schema; name policy; creation fixtures;
focus; readability/naming; unused exports; focused policy/API and ReactDOM SSR
checks; manual browser focus; focused tests, typecheck, full tests and build.

SSR covers editing/errors, submitting, saved, missing/failure, semantic controls
and escaped content. It does not prove interaction. Manual focus must submit at
least two errors, follow a summary link, correct that field, and verify focus stays
while another error remains. No DOM packages or fake DOM. Preserve user changes.

Forbidden: Zod, shared wire types, extra controller/service/repository layers,
general schema engine, test-only production creation command, weakened validation,
changed asynchronous ordering/navigation/Auth behavior, unrelated formatting.
Raw SQL creation fixtures are forbidden except the explicit pre-0004 branch above.

```yaml
feature: {id: projects-boundary-remediation, status: approved}
ownership:
  project_workflow: createProjectModel
  saved_representation: createProjectApi
  project_name_rule: server/projects/policy single validator
  creation_validation: validateProjectInput
  persistence: createProjectModule
  server_transport: registerProjectRoutes
  client_transport: shared bounded schema matcher
public_contracts: [POST /api/projects unchanged, GET definition unchanged, issue5 list/read/rename/nested unchanged]
internal_contracts: [createDefinition only creation command, one name decision implementation, both Auth and Projects execute shared matcher]
data_flow: [HTTP body -> Fastify schema -> creation validation -> name rule -> createDefinition -> PostgreSQL, fetch response -> executable schema -> semantic id/version checks -> current gate -> saved cache -> model -> view]
validation:
  transport: [Fastify structural schema, client executable schema]
  domain: [single name rule, creation context rules]
  persistence: existing constraints
legacy_fixture_exception: pre-0004 branch only may seed minimum owner/name SQL rows to verify context backfill; all current fixtures use createDefinition
concurrency: {owner: createProjectModel, ordering: preserve version+actor+route gates, retries: explicit only, cancellation: abort observation/server may commit}
dependencies: {new: []}
checks: [one creation path, one name implementation, Auth+Projects matcher contracts, malformed Project envelopes, SSR state rendering, existing cancellation tests, manual focus]
tradeoffs: [automated DOM focus deferred pending explicit dependency approval, narrowly scoped old-schema SQL seed required for migration regression]
decision: APPROVED FOR IMPLEMENTATION
```
