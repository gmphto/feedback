# Project Scope Tool — MVP Backlog

## 1. Set up an empty project with a passing test
Goal: Create the empty pnpm workspace and prove its test pipeline works.
Description: Scaffold separate React client and Fastify server packages using the conventions in the selected stack. Add one minimal test and document commands that pass locally.

## 2. Add application readiness checks
Goal: Expose a readiness result from the running application.
Description: Add a Fastify endpoint that reports whether the server process can accept requests. Cover the successful response and an internal failure with automated tests.

## 3. Establish PostgreSQL migrations
Goal: Make database schema changes repeatable in development and tests.
Description: Configure Kysely with PostgreSQL and add an empty initial migration. Prove a clean database can migrate forward during an integration test.

## 4. Add authenticated sessions
Goal: Let a user sign in and maintain a secure server-side session.
Description: Select the standards-based identity provider recorded in the stack decision and integrate its OpenID Connect flow. Test sign-in, sign-out, session expiry, and rejected unauthenticated requests.

## 5. Enforce project ownership
Goal: Prevent users from reading or changing another user's projects.
Description: Associate each project with its authenticated user and enforce ownership in every project query. Test allowed access, missing projects, and cross-user access attempts.

## 6. Create a project
Goal: Let a user create a project from the structured initial form.
Description: Add the project fields defined in the product plan, including rough notes, primary user, core job, outcome, and constraints. Persist the project and show it after submission with validation tests.

## 7. List projects in the portfolio
Goal: Show the signed-in user's projects in one portfolio view.
Description: Return owned projects through the API and render a portfolio card for each project. Include empty, loading, error, and populated states in tests.

## 8. Edit the project definition
Goal: Let a user refine the project's core definition after creation.
Description: Provide an editor for primary user, core job, main problem, outcome, product areas, and constraints. Save through an optimistic concurrency check and test stale-write handling.

## 9. Create and list feature areas
Goal: Let a user divide a project into clear product boundaries.
Description: Add feature areas with a name, purpose, user problem, and MVP status. Display them inside the selected project and test ownership and validation rules.

## 10. Show a feature-area page
Goal: Give each feature area a focused working surface.
Description: Render its purpose, user problem, features, dependencies, accepted decisions, and MVP status. Test missing data, empty sections, and unauthorized access.

## 11. Create and edit a feature
Goal: Let a user define a feature inside one feature area.
Description: Support the feature name, user problem, expected outcome, description, classification, stage, status, confidence, and effort fields. Persist edits and test required fields and stale versions.

## 12. Manage sub-features
Goal: Let a user break one feature into smaller owned parts.
Description: Add, rename, reorder, and remove sub-features inside a feature. Preserve stable integer identities and test that removing a parent handles its children consistently.

## 13. Manage feature requirements
Goal: Let a user record the requirements that define a feature.
Description: Add, edit, reorder, and remove requirements from a feature. Test validation, persistence, ordering, and unauthorized changes.

## 14. Manage acceptance criteria
Goal: Let a user define observable completion conditions for a feature.
Description: Add, edit, reorder, and remove acceptance criteria from a feature. Show missing criteria clearly and test the condition used by the MVP Ready gate.

## 15. Record feature justification
Goal: Require a clear reason for every feature placed in the MVP.
Description: Capture the six justification answers defined in the product plan. Flag incomplete MVP justification without blocking drafts, and test complete and incomplete cases.

## 16. Score feature value and confidence
Goal: Let a user score user value, necessity, and confidence independently.
Description: Store each score on the required one-to-five scale and capture optional evidence. Show validation errors without changing accepted values and test every boundary.

## 17. Record separate effort scores
Goal: Keep engineering, design, and operational effort visible as separate values.
Description: Add the three effort scores without calculating one opaque effort number. Test score boundaries and the read model used by feature views.

## 18. Warn about high-effort, low-confidence features
Goal: Identify costly features that have weak evidence of user need.
Description: Implement the deterministic risk rule and show its explanation beside affected features. Test threshold boundaries and confirm unrelated features receive no warning.

## 19. Manage product stages and the MVP cut line
Goal: Separate MVP, Workable Product, and Later features with an explicit cut line.
Description: Let users move features between stages and render the cut line in scope order. Test stage changes, ordering, and the unapproved cut-line state.

## 20. Approve the MVP cut line
Goal: Record explicit approval of the current MVP boundary.
Description: Add a semantic approval command tied to the current scope version. Invalidate approval after relevant stage changes and test both transitions.

## 21. Add explicit feature dependencies
Goal: Let a user declare that one feature depends on another.
Description: Create and remove directed dependency edges within one project. Reject self-links, duplicates, cross-project links, and cycles through tested domain rules.

## 22. Explain dependency chains
Goal: Show why a feature is blocked by its dependency graph.
Description: Use a recursive PostgreSQL query to return upstream and downstream dependency paths. Test branching graphs, deep chains, and cycle-safe query behavior.

## 23. Generate the dependency build sequence
Goal: Produce a technically valid implementation order from feature dependencies.
Description: Topologically order scoped features and explain any unresolved ordering problem. Test independent nodes, branching graphs, deterministic ties, and invalid cycles.

## 24. Generate the value build sequence
Goal: Produce the order that reaches useful user value fastest.
Description: Rank eligible features using visible value, necessity, confidence, effort, and dependency rules. Keep this sequence separate from dependency order and test deterministic explanations.

## 25. Implement feature workflow transitions
Goal: Move features through Backlog, Ready, In Progress, In Review, and Shipped.
Description: Enforce valid transitions and require production deployment before Shipped. Test every allowed transition, every rejected transition, and idempotent repeated commands.

## 26. Add the Blocked workflow overlay
Goal: Mark an active feature blocked without replacing its workflow state.
Description: Store the blocker reason and show it beside the underlying active status. Test applying, updating, and clearing the overlay on valid and invalid states.

## 27. Calculate weighted MVP progress
Goal: Derive MVP completion without letting tiny features distort the result.
Description: Calculate progress from shipped MVP features and their visible effort values. Test zero-feature, mixed-effort, fully shipped, and excluded-stage cases.

## 28. Implement the MVP Ready gate
Goal: Explain whether the current MVP scope is ready for a baseline.
Description: Evaluate every readiness check from authoritative project data and return each result separately. Test complete scope, multiple failures, low-confidence critical items, and unresolved dependencies.

## 29. Establish a scope baseline
Goal: Let a user soft-lock a scope that passes the MVP Ready gate.
Description: Store an immutable snapshot of the approved MVP scope and its approval metadata. Reject failed readiness checks and test that later edits cannot change the stored baseline.

## 30. Create scope-change proposals
Goal: Capture proposed baseline changes without applying them automatically.
Description: Record the requested change, reason, and calculated scope impact against the active baseline. Display pending proposals and test invalid, duplicate, and stale proposals.

## 31. Approve or reject one scope-change proposal
Goal: Let a user decide each proposed scope change independently.
Description: Apply one approved proposal transactionally or record its rejection without changing scope. Test stale baseline conflicts, repeated decisions, and rollback after failure.

## 32. Create approved scope versions
Goal: Preserve a new immutable version after approved scope changes.
Description: Record what changed, why, who approved it, its impact, and its date. Link versions in order and test that historical versions remain unchanged.

## 33. Record immutable decisions
Goal: Keep accepted product decisions permanently attached to one feature area.
Description: Create decisions with rationale, date, and exactly one feature-area target. Show them globally and locally, while tests reject updates and cross-project targets.

## 34. Supersede a decision
Goal: Change an accepted decision without rewriting its history.
Description: Create a new immutable decision that references the decision it replaces. Test valid chains, repeated supersession, cycles, and feature-area consistency.

## 35. Manage the parking lot
Goal: Preserve deferred ideas without treating them as active scope.
Description: Add, edit, and remove parking-lot items with deferral reason, possible stage, and revisit reason. Keep them outside progress and health calculations, with tests proving that separation.

## 36. Record a weekly review
Goal: Let a user review delivery activity for one project and week.
Description: Capture work performed, shipped, slipped, blocked, distracting, and unplanned work. Persist one review per project period and test edits, ownership, and date boundaries.

## 37. Classify planned and actual work
Goal: Categorize weekly work using the five classifications from the product plan.
Description: Derive planned-completed, planned-slipped, valid-unplanned, scope-creep, and blocked results from review data. Show the reason for each classification and test ambiguous inputs.

## 38. Calculate project health
Goal: Produce an explainable deterministic health status and score.
Description: Calculate Healthy, Drifting, or Blocked from the defined delivery and scope inputs. Return every point deduction and test thresholds, stale reviews, blockers, and scope creep.

## 39. Complete portfolio health cards
Goal: Let users identify project health and the next concern from the portfolio.
Description: Add health, score, progress, risk, last review, current issue, and next action to each card. Test deterministic ordering and projects with incomplete setup.

## 40. Build the project dashboard
Goal: Balance scope quality and delivery progress on one project page.
Description: Present the plan's “right thing” and “making progress” sections from existing read models. Test empty, warning, blocked, and healthy project states without duplicating derived data.

## 41. Store AI scoping conversations
Goal: Preserve ordered user and assistant messages for each project.
Description: Store message role, content, status, timestamps, and provider metadata without making messages authoritative scope. Test ordering, failed messages, ownership, and conversation reloads.

## 42. Stream an AI response
Goal: Show a cancellable assistant response progressively in the scoping workspace.
Description: Send project context to the configured model through AI SDK Core and stream events over SSE. Test normal completion, cancellation, provider failure, timeout, and client disconnect.

## 43. Assemble approved AI project context
Goal: Give the model accurate project context without including rejected material.
Description: Build a bounded context from current scope, accepted decisions, and relevant draft edits. Exclude rejected proposals, parking-lot ideas, and weekly chatter, with fixture-based tests.

## 44. Apply structured AI draft proposals
Goal: Let validated AI proposals update the editable specification safely.
Description: Parse model output through JSON Schema and domain validation before creating draft commands. Test malformed output, invalid references, stale versions, and successful draft updates.

## 45. Surface hidden dependency proposals
Goal: Let the AI suggest implied dependencies without approving new scope.
Description: Convert structured model findings into pending dependency proposals with explanations. Let users accept or reject each proposal and test that no proposal applies automatically.

## 46. Detect AI scope-creep proposals
Goal: Warn when a requested feature expands the approved MVP boundary.
Description: Compare structured model proposals with the active baseline and existing dependencies. Show the reasoning and require a normal scope-change approval before any baseline change.

## 47. Coordinate conversation and specification edits
Goal: Keep direct edits and AI responses coherent in the split workspace.
Description: Give the editor sole ownership of its draft while AI requests use versioned snapshots. Detect concurrent changes and test refresh, rebase, cancellation, and stale proposal behavior.

## 48. Add one-question AI scoping behavior
Goal: Make the assistant challenge scope through one focused question at a time.
Description: Define the prompt contract for vague requirements, assumptions, missing value, risk, and unnecessary features. Verify behavior with provider-independent fixtures and a small manual evaluation set.

## 49. Add browser dictation input
Goal: Let a user dictate a message when browser speech input is available.
Description: Add dictation as an optional input method without changing message semantics. Test permission denial, unsupported browsers, cancellation, editing, and normal text fallback.

## 50. Render the Product Map
Goal: Visualize feature areas, features, sub-features, stages, and dependencies.
Description: Build a separate project page from existing dependency and scope read models. Test empty maps, branching graphs, deferred features, keyboard access, and large-map navigation.

## 51. Export individual context files
Goal: Let a user download each approved agent-context file separately.
Description: Generate the specified Markdown, JSON, and YAML exports from approved scope and accepted decisions. Exclude rejected proposals, parking-lot items, and weekly chatter through snapshot tests.

## 52. Export the complete project bundle
Goal: Let a user download every approved context file in one archive.
Description: Package the individual exports with deterministic names and content. Test archive integrity, empty optional sections, authorization, and consistency with separate downloads.

## 53. Add accessible application navigation
Goal: Make every MVP page reachable and understandable by keyboard and screen-reader users.
Description: Implement the portfolio, project, and creation navigation from the product plan. Test route protection, focus movement, active labels, small screens, and missing routes.

## 54. Add operational logging and request tracing
Goal: Make production failures traceable across browser, server, database, and AI requests.
Description: Add structured correlation identifiers and redact secrets and project content by default. Test propagation through HTTP and AI calls, plus cancellation and failure logs.

## 55. Create the production deployment
Goal: Deploy one application container with managed PostgreSQL and automated migrations.
Description: Configure health checks, secrets, TLS, migration execution, and rollback-safe releases for the selected providers. Prove deployment with a smoke test covering sign-in, project creation, and AI streaming.

## 56. Verify backup and restore
Goal: Prove that authoritative project data can recover after database loss.
Description: Configure managed PostgreSQL backups and document the restore procedure. Restore a test backup into an isolated database and verify projects, baselines, versions, and decisions.
