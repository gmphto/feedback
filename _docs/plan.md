# Project Scope Tool — MVP Product Spec

## 1. Product Goal

A tool for turning messy project ideas into a precise, user-focused MVP scope.

The tool should prevent two main problems:

1. MVPs becoming too large through scope creep.
2. Vague requirements leading to poor implementations.

It should act as a product partner, not a passive note-taking tool.

---

## 2. Primary User

Solo builders working on software projects.

The MVP is designed around one primary user per project.

---

## 3. Core Job

Turn a messy project idea into a clear, justified, buildable MVP scope.

Everything included in the MVP should support this job directly or be necessary supporting functionality.

---

# 4. Product Structure

## Portfolio

Shows all projects.

Primary purpose: identify project health.

Each project shows:

- Health: Healthy / Drifting / Blocked
- Health score: 0–100
- MVP completion
- Scope-creep risk
- Last review
- Main current issue
- Next recommended action

Health is calculated using deterministic rules.

AI does not control the health score in the MVP.

---

## Project Dashboard

Balances two questions equally:

### Are we building the right thing?

Shows:

- Primary user
- Core job
- MVP scope status
- MVP cut line
- Scope-creep warnings
- Low-confidence features
- High-effort features
- Unresolved dependencies
- Proposed scope changes

### Are we making progress?

Shows:

- MVP completion
- Planned work
- Completed work
- Slipped work
- Blocked work
- Unplanned work
- Shipped features
- Next recommended work

---

# 5. Project Creation

Creating a project starts with a structured form.

Initial fields:

- Project name
- Rough idea / notes
- Primary user
- Core job
- Main user problem
- Desired MVP outcome
- Initial product areas
- Known constraints

The user does not need to complete these perfectly.

They provide starting context for the AI scoping session.

---

# 6. AI Scoping Workspace

The AI behaves as a product partner.

It should:

- challenge assumptions
- identify vague requirements
- challenge unnecessary features
- ask questions one at a time
- detect scope creep
- identify hidden dependencies
- identify missing user value
- test whether features belong in the MVP
- raise uncertainty around critical scope

The user can use text or dictation.

## Layout

Split screen:

### Left
Conversation with the AI.

### Right
Live evolving project specification.

The specification updates as the conversation progresses.

The user can directly edit the specification.

Direct edits become part of the AI's context.

Major AI-driven scope changes show a short explanation.

Minor edits do not require explanations.

---

# 7. Scope Model

Projects are structured around product/domain boundaries.

```text
Project
└── Feature Area
    ├── Feature
    │   ├── Sub-feature
    │   ├── Requirement
    │   └── Acceptance Criteria
    └── Dependencies
```

Each feature area has its own page.

A feature-area page contains:

- Purpose
- User problem
- Features
- Dependencies
- Accepted decisions
- MVP status

---

# 8. Feature Definition

Each feature records:

- Name
- Feature area
- User problem
- Why it matters
- Expected user outcome
- Feature description
- Sub-features
- Requirements
- Acceptance criteria
- Stage
- Status
- MVP justification
- Dependencies
- Confidence
- Evidence
- Effort

---

# 9. Product Stages

Every feature belongs to one stage:

## MVP

Smallest product that provides real value to the primary user.

## Workable Product

The next stage after MVP.

Makes the product more complete and practical for continued use.

## Later

Useful ideas deliberately deferred.

---

# 10. MVP Cut Line

The system displays a clear boundary between:

```text
MVP
────────────── MVP CUT LINE
WORKABLE PRODUCT
LATER
```

Features above the line are required for MVP.

Features below it are explicitly deferred.

This cut line must be approved before the MVP scope becomes ready.

---

# 11. Feature Classification

Features are classified as:

## Core

Directly support the core job.

## Supporting

Required to make the product usable, secure, or manageable.

Examples:

- authentication
- basic settings
- persistence

Supporting features still require MVP justification.

---

# 12. Feature Justification

Every MVP feature must explain:

- What user problem does this solve?
- How does it support the core job?
- Why is it needed now?
- Why does it belong in MVP?
- What happens if it is removed?
- What proves it is complete?

Features without strong justification should be challenged.

---

# 13. Feature Scoring

Each candidate feature is scored.

## User Value
1–5

How much value it provides to the primary user.

## Necessity
1–5

How necessary it is for the core MVP experience.

## Confidence
1–5

Confidence that the user actually needs the feature.

Evidence may include:

- user feedback
- observed behaviour
- interviews
- prior experience
- assumption

Evidence is optional but encouraged.

## Effort

Effort consists of separate scores for:

- engineering effort
- design effort
- operational complexity

These should remain visible separately rather than being reduced to one opaque score.

---

# 14. Feature Risk

Features that combine:

- low confidence
- high effort

receive a strong warning.

Example:

> MVP Risk: High-cost feature with weak evidence of user need.

The system recommends removing or deferring it.

The user makes the final decision.

---

# 15. Dependencies

Features can depend on other features.

The tool should detect both:

## Explicit dependencies

Dependencies added by the user.

## Hidden dependencies

Dependencies implied by the proposed feature.

Example:

```text
Team collaboration
↓
User accounts
↓
Invitations
↓
Permissions
↓
Shared persistence
```

Hidden dependencies should always be surfaced.

They must not automatically become approved scope.

---

# 16. Build Sequences

The tool generates two separate build orders.

## Dependency Sequence

The technically correct implementation order based on dependencies.

## Value Sequence

The order that reaches useful user value fastest.

The two sequences should not be merged into one unexplained priority list.

---

# 17. Feature Workflow

Feature states:

```text
Backlog
→ Ready
→ In Progress
→ In Review
→ Shipped
```

`Blocked` is an overlay that can apply to an active feature.

## Shipped

A feature is only Shipped when deployed to production.

Development/staging deployment is not tracked as a separate MVP state.

---

# 18. MVP Progress

MVP completion is derived from feature completion.

It is not manually entered.

Simple feature count should not be used because many tiny features could distort progress.

Feature effort should contribute to weighting.

---

# 19. MVP Ready Gate

The tool has an explicit **MVP Ready** state.

The MVP cannot be considered ready until required checks pass.

Example checklist:

```text
✓ Primary user defined
✓ Core job defined
✓ Core problem defined
✓ MVP outcome defined
✓ MVP features justified
✗ Acceptance criteria missing for 2 features
✗ 1 unresolved dependency
✓ MVP cut line approved
✓ Build sequence generated
```

Every item inside the MVP scope is considered critical.

Low-confidence MVP-critical items should trigger further questions or warnings.

---

# 20. Scope Baseline

Once MVP Ready passes, the user can establish the current MVP as a baseline.

The baseline is soft-locked.

It can still change, but modifications become explicit scope changes.

---

# 21. Scope Versions

Approved changes create new versions.

Example:

```text
MVP v1
↓
Approved scope changes
↓
MVP v2
```

Every version records:

- what changed
- why
- approval
- scope impact
- date

Side-by-side version comparison can be added later.

---

# 22. Weekly Review

Each project supports a weekly review.

The review focuses on delivery rather than project-management ceremony.

Questions include:

- What did you work on this week?
- What shipped?
- What slipped?
- What was blocked?
- What distracted you?
- What unplanned work appeared?
- Was that work justified?
- Did scope creep occur?
- Does the MVP scope need changing?

---

# 23. Planned vs Actual

Weekly work is automatically classified into:

- Planned + completed
- Planned + slipped
- Unplanned but valid
- Unplanned scope creep
- Blocked

The weekly review can affect the project health score.

---

# 24. Scope Change Proposals

Weekly reviews do not automatically change the baseline.

Instead they produce proposals.

Example:

```text
Move collaboration out of MVP

Reason:
Hidden auth and permission dependencies substantially increase scope.

Impact:
Estimated MVP effort decreases significantly.

[Approve] [Reject]
```

Changes are approved individually.

No bulk approval is required for the MVP.

---

# 25. Decision Log

Accepted scope decisions are recorded permanently.

Accepted decisions are immutable.

If a decision changes, a new decision supersedes the old one.

A decision records:

- decision
- rationale
- date
- target feature area
- superseded decision, if applicable

Each decision targets exactly one feature area/domain boundary.

Decisions appear:

- on the relevant feature-area page
- in the global decision log

---

# 26. Parking Lot

Deferred ideas can be placed in a parking lot.

Each item records:

- idea
- why it was deferred
- potential future stage
- reason to revisit

The tool does not continuously re-score parked ideas.

During reviews it may flag relevant parked items as candidates for reconsideration.

---

# 27. Product Map

The Product Map is a separate page.

It visually represents:

```text
Feature Area
↓
Features
↓
Sub-features
↓
Dependencies
```

It should help expose:

- domain boundaries
- feature relationships
- hidden complexity
- dependency chains
- MVP vs deferred scope

It does not belong directly on the main dashboard.

---

# 28. Project Health

Project health is deterministic.

Displayed as:

```text
Healthy
Drifting
Blocked
```

Alongside:

```text
Health Score: 82 / 100
```

Clicking the score explains exactly why points were lost.

Inputs can include:

- slipped work
- blockers
- scope creep
- unplanned work
- unresolved high-risk features
- MVP progress
- stale weekly reviews

AI recommendations may be added later, but AI does not determine health in the MVP.

---

# 29. Export

Approved project context can be exported for coding agents.

Exports remain generic and tool-independent.

Possible files:

```text
project-spec.md
mvp-scope.md
features.md
acceptance-criteria.md
dependencies.md
build-order.md
agent-context.md
project.json
project.yaml
```

Users can export:

- individual files
- complete project bundle

Exports include:

- approved scope
- all accepted decisions

Exports do not include:

- rejected proposals
- parking-lot ideas
- weekly-review chatter

---

# 30. MVP Navigation

```text
Portfolio
│
├── Project
│   ├── Dashboard
│   ├── Scope
│   ├── Product Map
│   ├── Feature Areas
│   ├── Weekly Reviews
│   ├── Decisions
│   ├── Parking Lot
│   └── Exports
│
└── New Project
    ├── Initial Form
    └── AI Scoping Workspace
```

---

# 31. MVP Product Areas

For the application itself, the MVP can be divided into these boundaries:

## Portfolio
Project listing and health.

## Project Definition
Primary user, core job, problems, outcomes and project-level scope.

## Scope
MVP/workable/later classification and cut line.

## Features
Feature hierarchy, justification, scoring and status.

## Dependencies
Explicit and inferred feature dependencies.

## AI Scoping
Conversational product-partner workflow and live specification.

## Delivery
Feature workflow, progress and build sequencing.

## Weekly Review
Planned vs actual delivery review.

## Scope Governance
Baselines, versions, proposed changes and approval.

## Decisions
Immutable accepted decisions.

## Export
Agent-ready project context.

---

# 32. Explicit MVP Non-Goals

Do not build these initially:

- team collaboration
- multi-user permissions
- project owners/assignees
- complex sprint management
- timelines/Gantt charts
- issue tracking replacement
- GitHub/Jira integrations
- AI-controlled project health
- autonomous scope modification
- automatic parking-lot prioritisation
- agent-specific export formats
- complex MVP version comparison
- development/staging deployment tracking

The MVP should remain a **scope-definition and scope-control product**, not become another general project-management platform.
