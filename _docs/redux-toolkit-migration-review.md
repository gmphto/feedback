# Engineering Review

Decision: PASS

BLOCKER: 0 | MAJOR: 0 | MINOR: 0 | NOTE: 2 | NOT ASSESSED: 0 (migration architecture)

## Contract compliance and evidence

Reviewed against [_docs/redux-toolkit-migration-design.md](redux-toolkit-migration-design.md) and [_docs/redux-toolkit-migration-contract.json](redux-toolkit-migration-contract.json), both approved before implementation. All specified architecture constraints are satisfied: three private Redux stores, two per-model RTK listeners, four native React subscriptions, unchanged model/facade commands and snapshots, independent editable/saved representations, and preserved freshness guards.

Files inspected in full: `client/src/auth/model.ts`, `client/src/auth/api.ts`, `client/src/auth/auth.test.tsx`, `client/src/projects/model.ts`, `client/src/projects/api.ts`, `client/src/projects/fields.ts`, `client/src/projects/ProjectView.tsx`, `client/src/projects/projects.test.tsx`, `client/src/app/App.tsx`, `client/src/app/App.test.tsx`, `client/src/main.tsx`, `client/src/transport/schema.ts`, `client/package.json`, `client/tsconfig.json`, `AGENTS.md`, `_docs/stack.md`. Inspected the complete `pnpm-lock.yaml` change, all migration exports and every client caller found by `rg`. Pre-existing/concurrently edited untracked project-state and shared-state stubs were inspected for competing imports/ownership and build diagnostics; they are not migrated runtime owners.

Public exports and callers:

- `auth/model.ts`: `createAuthModel`, `AuthModel`, `observeSession` → `App`, `AuthView`, `auth.test.tsx`. Returned refresh/signIn/signOut/cancel commands drive controls; pause/observeSession drive focus/StrictMode cleanup; dispose is lifecycle cleanup in tests.
- `projects/model.ts`: `createProjectModel`, `ProjectModel` → `App`, `ProjectView`, `projects.test.tsx`. Open/setActor/pause/resume drive App orchestration; edit/submit/retryRead/cancel/open drive ProjectView; tests also dispose isolated instances.
- `projects/api.ts`: `createProjectApi`, `ProjectApi`, `projectFailure` → App construction, project model effects and project tests. Only its validated completion and clear write saved state.
- `app/App.tsx`: default `App` → `main.tsx` and App smoke test; `AuthView` → App and auth tests. `ProjectView` → App. All four `useSyncExternalStore` calls read stable getState snapshots and Redux subscribe functions.
- Adjacent exports `createAuthApi`/`AuthApi`/`User`, `projectFields`/`fieldKeys`/`emptyDraft`/`validateDraft` and their types, `matchesSchema`/`Schema` retain the same consumer boundaries. No new production export exists solely to enable tests.

## Ownership matrix

| Concern | Authoritative owner | Competing owner/path inspected | Verdict |
| --- | --- | --- | --- |
| Auth mutable state and lifecycle | `auth/model.ts:createAuthModel` private slice/store/listener | App/AuthView only read/subscribe and invoke commands; observeSession owns observation, not state | PASS |
| Project mutable state and lifecycle | `projects/model.ts:createProjectModel` private slice/store/listener | App calls actor/navigation lifecycle commands; ProjectView calls editor commands; no external dispatch | PASS |
| Saved representation | `projects/api.ts:createProjectApi`, `validateAndCacheResponse`, `clear` | ProjectModel exposes the same read surface; ProjectView reads it; no competing cache writer | PASS |
| Business rules and validation | `fields.ts:validateDraft`; API decoding and `transport/schema.ts:matchesSchema` | Model submit invokes draft validation; views derive presentation only; no moved/duplicated rules | PASS |
| Persistence mutations | Existing server; client mutation transport remains `projects/api.ts:create` | Migration adds no server storage path; changed server files belong to baseline work | PASS |
| Transport/public contracts | `auth/api.ts:createAuthApi`, `projects/api.ts:decodeResponse`/`validateAndCacheResponse` | Model consumes validated definitions; React has no fetch/decoder; no server wire imports | PASS |

## Architecture, domain, dependencies and abstractions

`configureStore` and `createSlice` are instantiated inside each existing owner factory. The facades expose `{getState, subscribe}` rather than dispatch/setState or reducer action creators. `createProjectModel` continues to own draft/status/route while `createProjectApi` owns saved definitions; there is no central cache, singleton store or component mirror. Reducer payloads contain concrete transition data; controllers, injected API callbacks, versions and navigation remain in model closures. No recipe adapter, generic mutation abstraction, provider hierarchy or extra production module was introduced.

`client/package.json` replaces Zustand with `@reduxjs/toolkit:^2.12.0`; the lock change adds its dependencies and removes Zustand entries without unrelated package upgrades. RTK reuses the existing Immer version. `App` and `ProjectView` use installed React functionality; no react-redux dependency is needed. `AGENTS.md` and `_docs/stack.md` consistently authorize/document Redux Toolkit. Historical references do not drive active implementation.

## State, concurrency, errors and persistence

Both `listener.startListening` predicates compare operation identity before and after the reducer, preventing `sessionReceived`, `saved`, `edited`, `failed` and `interrupted` from launching another request. Listener middleware is prepended to defaults and installed separately per model. Intent dispatch updates status before the listener effect starts; `submit` checks editing/actor first, suppressing duplicate pending POSTs.

Auth `isCurrent` checks signal and generation, while pause/cancel/dispose abort current requests and dispose unregisters only its listener. Project `invalidate` advances generation, aborts and clears the facade; project `isOperationCurrent` adds actor and route equality. The facade checks this guard and signal immediately before dispatching `received`, and the model checks again before completion/error/navigation. Existing App subscribers only synchronize actors and render; no caller introduces a competing continuation during completion dispatch. Existing history and pause/resume behavior remains intact.

`decodeResponse`/`decodeDefinition`/`validateAndCacheResponse` retain JSON Schema, status, matching ID and create-version checks. Auth catch dispatches no raw error; project catch translates through `projectFailure` and retains existing draft/error messages. Unauthorized project responses clear cached protected content before sign-in transition. No transport, persistence schema, transaction or authorization implementation was changed by the migration.

## Coding quality

Modules remain cohesive: model reducers encode transitions, listener effects perform I/O, commands enforce prerequisites, facades validate transport and own cached representations, and views render. Names describe current transitions (`requested`, `sessionReceived`, `opened`, `submitted`, `interrupted`). Some short assignments share lines, consistent with current source conventions; branches and ownership remain locally traceable. No test-only exports, dead adapters, duplicate rule implementations, new DTO layers or unrelated restructuring appeared. Tests exercise observable behavior and use existing Vitest rather than implementation-shaped architecture scaffolding.

Added auth checks cover instance/listener isolation, subscription delivery and paused/disposed abort-ignoring login completion. Added project checks cover isolated drafts/cache/disposal, pause/resume interrupted create without retrigger, read restart/disposal and malformed/mismatched/stale facade responses. Existing tests retain successful outcomes, field validation, generic errors, 401, navigation races, duplicate submit and StrictMode callback-failure checks.

## Adversarial checks

- Where else can state be mutated? `rg` found dispatch only within the three private owners. App/ProjectView and tests receive read surfaces; unused state stubs have no runtime connections to migrated stores.
- Where is the same rule implemented twice? Existing field validation belongs to `fields.ts`; schema checks belong to APIs. Model/facade freshness checks are intentional guards at different commit boundaries, not independent competing rules.
- Which production export exists only for tests? None introduced. Factory/lifecycle APIs remain the existing boundary, with disposal intentionally available to the creator.
- Which function owns more than one lifecycle? `createProjectModel` coordinates one project workflow lifecycle; App coordinates browser subscriptions and actor propagation without taking over request ownership. No new mixed-lifecycle service exists.
- Which name hides a responsibility? `validateAndCacheResponse` explicitly names both boundary duties; `invalidate` is local to its lifecycle owner and visibly advances generation, aborts and clears. No newly misleading abstraction found.
- What did type checking/tests not prove? They do not prove mounted React repaint/focus/history behavior or live PostgreSQL integration in the current environment. The approved design assigns browser checks to QA, which remains required; the architectural subscription wiring was independently inspected.

## Automated checks and findings

Independent source searches confirm no Zustand imports/client dependency/active lock entries, three configureStore calls, two createListenerMiddleware calls and four useSyncExternalStore calls. `node client/node_modules/typescript/bin/tsc -p client/tsconfig.json --noEmit` passed against the then-current direct `include: [src, vite.config.ts]` configuration (no solution references). A later `node client/node_modules/typescript/bin/tsc -b client/tsconfig.json` encountered TS1109 in concurrently changing, untracked `client/src/projects/editor/state/state.ts(18,3)`; this is outside migration ownership and was not modified during review.

NOTE 1: Engineer reports 22 passing client tests and full-suite progress through lifecycle/client/server units, with integrations blocked by missing TEST_DATABASE_URL. Independent review's pnpm invocation could not read user pnpm config under sandbox permissions; direct Vitest startup could not write `.vite-temp`. Those reruns produced no behavioral result. QA should use its authorized execution path and record current full-build results because concurrent source has changed.

NOTE 2: Existing rendered tests use server markup; subscription behavior/focus/history still needs the designed mounted-browser QA check. This is a QA handoff requirement, not an uninspected architecture claim.

No BLOCKER, MAJOR or MINOR findings. No implementation changes required by engineering review.

## Final gate

READY FOR QA. This PASS covers independently inspected migration architecture and coding quality; it does not declare full product acceptance or unavailable integration validation complete.
