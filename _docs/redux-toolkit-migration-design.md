# Client Redux Toolkit migration design

## Feature and scope

Replace all three existing client Zustand stores with Redux Toolkit, preserving the behavior in [PM requirements](redux-toolkit-migration-requirements.md). This is a direct user task without a matching GitHub issue. Includes state owners, subscriptions, dependencies, focused regression coverage and current architecture guidance. Excludes server work, UI redesign, new workflows and speculative project state stubs. Preserve all existing working-tree changes.

## Existing architecture discovered

Read in full: `client/src/auth/{api.ts,model.ts,auth.test.tsx}`, `client/src/projects/{api.ts,model.ts,fields.ts,ProjectView.tsx,projects.test.tsx}`, `client/src/app/{App.tsx,App.test.tsx}`, `client/src/main.tsx`, `client/src/transport/schema.ts`, client manifest and the three unused `projects/**/state/state.ts` stubs. Searched every caller of both model factories, the project facade, store subscriptions and saved-state access.

`createAuthModel` owns authentication state and one selector-triggered request effect. `createProjectModel` owns route/actor/draft/workflow state and one selector-triggered request effect. `createProjectApi` owns validated saved representations. `App` synchronizes actor identity, focus and browser history. `AuthView`, `App` and `ProjectView` subscribe to whole immutable snapshots; no caller needs Zustand selectors or external arbitrary state writes.

## Domain concepts and actor/process

An application user authenticates, creates a project from an editable starting-context draft, and reads an owner-scoped saved definition. Session identity, editable draft, validated saved definition and in-flight operation are distinct concepts. This migration introduces no domain concepts.

## Ownership and boundaries

| Concern | Owner and allowed writes |
| --- | --- |
| Authentication snapshot and lifecycle | `createAuthModel`; private reducers, public commands, one RTK listener instance per model |
| Project actor, route, draft, errors and status | `createProjectModel`; private reducers, public commands, one RTK listener instance per model |
| Saved project snapshot | `createProjectApi`; private Redux store, validated completion and `clear` are sole writers |
| Draft business checks | Existing `fields.ts` metadata and `validateDraft` |
| Transport validation and failure translation | Existing auth/project API facades and `matchesSchema` |
| UI and browser orchestration | Existing `App` effects, model command calls, navigation callbacks and `ProjectView` focus effects |
| Authoritative persistence and authorization | Existing server/PostgreSQL; unchanged |

Keep these boundaries and module locations. The three isolated stores are intentional: consolidating them would move the facade's saved representation into the form owner or introduce new cross-module wiring. Do not introduce a singleton root store or parallel copies of state.

## Contracts and models

Preserve model factory parameters, existing command names and their effects, `observeSession`, `ProjectApi` facade signatures and all snapshot shapes. Replace each internal Zustand store with `configureStore` and a feature-local `createSlice` reducer using Immer draft assignments. Reducer actions express concrete transitions, carrying serializable data; do not dispatch recipes, arbitrary partial-state patches, errors, controllers, callbacks or API objects.

Expose only `{ getState, subscribe }` on returned `model.store`, `api.saved` and `model.saved`. Keep dispatch, action creators and reducers private. This intentionally narrows the old mutable store surface; every existing caller uses only these read/subscription operations. Model commands and facade methods remain the only mutation entry points. A small object literal at each owner is sufficient; no common adapter is required.

Use `useSyncExternalStore(store.subscribe, store.getState, store.getState)` directly at the four current `useStore` calls. Stable immutable Redux snapshots satisfy React's subscription and server-render contract. Keep subscriptions and snapshots directly bound to the supplied model, including standalone `AuthView` rendering. No React Redux provider, selector helper, context or new hook is needed for current whole-state subscriptions.

Keep current domain, transport and persistence representations. `ProjectDraft` remains separate from `ProjectDefinition`; do not add DTO mapping layers or shared server wire types.

## State transitions and data flow

Authentication: refresh/sign-in/sign-out records a new operation and pending state; refresh/logout completes signed-in or signed-out; failure yields generic failure; cancel clears to signed-out; pause aborts/invalidate effects without dismissing visible failure; dispose also removes the listener. Sign-in success navigates while retaining existing pending behavior. Focus/StrictMode replay must preserve callback failure until an explicit retry.

Projects: open/actor changes invalidate old work and select home/editing/loading/missing from the current route; edit changes fields only while editing; invalid submit sets field errors; valid submit records one create operation and submitting; success clears the draft, sets saved and the validated destination; field/create network failure returns to editing with the original draft; read failure becomes missing/failure; 401 clears cache and invokes sign-in transition. Resume restarts reads where required, but converts interrupted submission to editing with its existing uncertainty warning; no automatic create retry.

Flow: component command → owner dispatch → Immer reducer → RTK listener → API facade validation → guarded saved-cache dispatch → guarded workflow completion → optional history navigation → subscribed render. App's existing auth subscription remains the actor synchronization owner.

## Effects and concurrency

Instantiate `createListenerMiddleware<State>()` inside each effect-owning model factory. Prepend its middleware to `configureStore` default middleware. Register one listener with a predicate comparing `current.operation !== previous.operation`; its effect reads the new operation and retains existing async behavior. Completion/edit/status actions must not restart requests, so preserve operation references unless intent changes. Register before commands can run.

Keep generation/version counters and `AbortController` in each model closure, outside Redux. Invalidation remains synchronous and precedes subsequent commands. Auth guards require un-aborted signal and current generation; project guards additionally require matching actor and route. The facade checks signal and the supplied operation guard immediately before every cache write; the model checks again before success/failure/navigation. Removing listeners alone does not cancel fetch, and RTK cancellation alone does not prevent an abort-ignoring dependency from resolving: preserve both controller abort and freshness guards. Disposal aborts and unregisters its own listener, without touching another model. Pause keeps listeners available for resume/StrictMode replay.

Request effects begin synchronously when intent dispatch reaches the listener (before its first await), preserving duplicate-submit and cancellation checks in current tests. Retain current manual-only retries, no timeout policy, no claim of server-side create idempotency, and no rollback on abort. A dispatched create may already have committed; preserve warnings exactly.

## Validation, persistence and error model

Keep JSON Schema validation, expected response statuses, matching read ID, initial create version and validated cache commits in `projects/api.ts`. Keep draft validation in `fields.ts` and submit orchestration in the model. No database, query, transaction, schema or transport changes are required. Authentication errors remain generic; project failure translation remains at the facade/model boundary. Raw errors and provider tokens must not enter Redux state or actions. Existing server authorization remains authoritative.

## Dependencies and files

Add only `@reduxjs/toolkit` to `client/package.json` and remove Zustand, updating `pnpm-lock.yaml`. User authorization supersedes the previous no-Redux rule. Retain existing direct Immer unless removing it is necessary to resolve the replacement; no unrelated dependency changes. React's installed `useSyncExternalStore` covers subscriptions, so do not add `react-redux`.

Modify `client/src/auth/model.ts`, `client/src/projects/model.ts`, `client/src/projects/api.ts`, `client/src/app/App.tsx`, `client/src/projects/ProjectView.tsx`, relevant existing client test files, `client/package.json`, `pnpm-lock.yaml`, `AGENTS.md`, `_docs/stack.md`. No new production modules are needed. Update active state-library instructions and listener descriptions; historical `_docs/outdated` records and illustrative library names in general doctrine need no rewrite. This design and its JSON contract are the only required new documentation artifacts.

## Implementation sequence

1. Read this design, JSON contract and baseline dirty files; add the authorized RTK dependency and remove Zustand without touching unrelated packages.
2. Migrate the private saved-cache store, preserving facade validation and guarded writes.
3. Migrate auth state/actions/listener and project state/actions/listener, retaining command contracts and lifecycle guards.
4. Replace the four React subscriptions; preserve markup, focus, browser history and session synchronization.
5. Read testing guidelines, retain existing behavior tests and add targeted missing migration checks; update current architecture guidance.
6. Run focused client tests, full client tests, `pnpm test` and `pnpm build`; report actual results and infrastructure blockers. Request independent engineering review, then QA.

## Engineering verification and design-level tests

Check no client Zustand imports, no client manifest/active lock dependency on Zustand, three real Redux stores, actual RTK listener middleware, no exported dispatch/actions/setState, and no effects or nonserializable values in reducers/state/actions. Inspect whole changed modules and all callers, including App's subscription (Redux subscribers run on every dispatch). Run existing auth/project/App tests first. Preserve coverage for validation, 401, cancellation, stale results and duplicate pending commands.

Add focused observable checks where absent: independent model/facade instances; pause/resume/dispose and abort-ignoring late completions; malformed/mismatched read and create definitions never cached; non-operation transitions do not trigger duplicate requests. Avoid test-only production exports and string-snapshot architecture test scaffolding. QA must verify a mounted React screen updates through pending/completion and project edit/save, plus preserved focus/history behavior; server-render markup alone cannot prove subscriptions. Use an available browser with intercepted local API responses if no DOM test dependency is already installed; do not add a test framework just for this migration. Use existing typecheck/build tools and formatting conventions; no new formatter is required.

## Forbidden approaches, trade-offs and debt

No Zustand compatibility wrapper, generic recipe action, broad state replacement API, RTK Query rewrite, Redux singleton, reducer I/O, new provider tree, state copied into React, weakened transport validation/freshness guards, server edits, unrelated cleanup or changes to unused state stubs.

Explicit exception: old Zustand/no-Redux project rules are superseded by the user's request. Multiple model-local Redux stores preserve proven ownership and factory isolation at less risk than a root-store redesign. Whole-state subscriptions preserve present behavior; selector optimization can be considered only when an actual rendering problem exists. Unused draft state stubs are deferred existing work, not migration debt. No blocking design debt was found.

## Risks and decision

Primary risks are listener retrigger loops, changed synchronous ordering, stale facade commits, disposal leaking effects, and UI subscriptions not updating. The predicate, existing guards, isolated factories and targeted checks above address these. Full tests may require unavailable PostgreSQL configuration; report that limitation without weakening required test commands.

APPROVED FOR IMPLEMENTATION. Machine-readable contract: [redux-toolkit-migration-contract.json](redux-toolkit-migration-contract.json).
