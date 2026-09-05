## Goal

Replace Zustand with Redux Toolkit for all existing client application state while preserving authentication, project creation, saved-project loading, and their visible behavior. This task comes directly from the user's migration request; no matching GitHub migration issue was found, and external issue creation is not authorized.

## Acceptance criteria

- [ ] The client uses Redux Toolkit for authentication, project workflow/draft state, and saved server representations; no client code imports Zustand, and Zustand is absent from the client manifest and active dependency lock entries.
- [ ] Sign-in, session refresh, sign-out, cancellation, and generic failure/retry controls retain their existing outcomes; provider tokens and raw service errors never appear in state or UI.
- [ ] Focus refresh and React StrictMode effect replay remain functional; an authentication callback failure stays visible until the user explicitly retries.
- [ ] Project creation keeps all existing fields and validation, sends one request while submitting, and navigates to the saved project only after a validated successful response.
- [ ] Field and network failures retain the entered draft; an interrupted create requires deliberate retry and keeps the warning that the server may already have saved it.
- [ ] Direct project URLs, browser history, missing/unavailable displays, and retry loading behave as before; a project 401 clears protected cached content and returns to sign-in.
- [ ] Cancel, pause/dispose, navigation, superseding operations, and actor changes abort applicable requests and prevent late success or failure from replacing newer drafts, saved data, errors, or navigation.
- [ ] Saved definitions remain separate from editable drafts; malformed or mismatched server definitions never enter the cache, and separate model instances do not leak state or effects.
- [ ] React screens react to state changes and preserve existing accessible controls, error summaries, focus behavior, and layout.
- [ ] Current architecture guidance documents Redux Toolkit consistently; focused affected tests, `pnpm test`, and `pnpm build` are run, with results and any environment limitation recorded.

## Out of scope

No requested functionality is deferred. This is a client state-management migration, with no new product workflows, server contract changes, persistence changes, or UI redesign.

## Constraints

- The explicit user request supersedes the older Zustand requirement and Redux prohibition and authorizes the dependencies required for this replacement. Keep dependency changes in the client package and workspace lockfile; do not upgrade unrelated packages.
- Preserve all existing uncommitted edits, including current client boundary remediation and server changes. Work from the present files, not a clean historical revision.
- Follow [the current stack](stack.md), [process](process.md), [design conventions](design-system.md), and [testing guidelines](testing-guidelines.md), except the superseded state-library choice.
- Keep plain exported commands, Immer draft updates, and listener-owned effects; keep domain decisions outside React, API validation at the transport boundary, and one mutation authority per representation.
- Target existing client state and consumers plus necessary package, test, and architecture-documentation updates. Design Authority must inspect the actual callers and define the migration design before engineering begins.
