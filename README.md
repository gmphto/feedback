# Codebase table of contents

| Folder | Purpose |
| --- | --- |
| [client/](client/) | HUB - for developers, engineers and vibe coders to structure what they are building |
| [server/src/](server/src/) | Backend APIs, authentication, project logic, and database access. |
| [server/test/](server/test/) | Backend tests, integration tests, and test helpers. |
| [scripts/](scripts/) | Development tooling and lifecycle tests. |
| [_docs/](_docs/) | Project plans, architecture, design guidelines, and team workflow. |

Dependency folders (`node_modules`) and generated build output (`dist`) are excluded.

```
feedback
├─ .agents
│  └─ karpathy.md
├─ .cate
│  ├─ session.json
│  ├─ session.json.bak
│  ├─ workspace.json
│  ├─ workspace.json.bak
│  └─ worktrees
│     └─ review-projects-feature
│        ├─ .agents
│        │  └─ karpathy.md
│        ├─ .codex
│        │  └─ hooks.json
│        ├─ AGENTS.md
│        ├─ client
│        │  ├─ index.html
│        │  ├─ package.json
│        │  ├─ src
│        │  │  ├─ app
│        │  │  │  ├─ App.test.tsx
│        │  │  │  └─ App.tsx
│        │  │  ├─ auth
│        │  │  │  ├─ api.ts
│        │  │  │  ├─ auth.test.tsx
│        │  │  │  ├─ model.ts
│        │  │  │  ├─ signOut.test.ts
│        │  │  │  ├─ signOut.ts
│        │  │  │  └─ signOutConfirmation.ts
│        │  │  ├─ index.css
│        │  │  ├─ main.tsx
│        │  │  ├─ projects
│        │  │  │  ├─ api
│        │  │  │  │  ├─ api.ts
│        │  │  │  │  ├─ projects.ts
│        │  │  │  │  └─ types.ts
│        │  │  │  ├─ api.ts
│        │  │  │  ├─ dashboard
│        │  │  │  │  ├─ Dashboard.tsx
│        │  │  │  │  ├─ grouping.test.ts
│        │  │  │  │  ├─ grouping.ts
│        │  │  │  │  ├─ sorting.test.ts
│        │  │  │  │  ├─ sorting.ts
│        │  │  │  │  ├─ state
│        │  │  │  │  │  └─ state.ts
│        │  │  │  │  └─ types.ts
│        │  │  │  ├─ editor
│        │  │  │  │  ├─ components
│        │  │  │  │  │  ├─ ProjectContent
│        │  │  │  │  │  │  ├─ Body
│        │  │  │  │  │  │  │  └─ ProjectContentBody.tsx
│        │  │  │  │  │  │  ├─ Footer
│        │  │  │  │  │  │  │  ├─ CloseAndCancelButton.tsx
│        │  │  │  │  │  │  │  ├─ CommitButton.test.tsx
│        │  │  │  │  │  │  │  ├─ CommitButton.tsx
│        │  │  │  │  │  │  │  ├─ DeleteButton.tsx
│        │  │  │  │  │  │  │  └─ Footer.tsx
│        │  │  │  │  │  │  ├─ Header
│        │  │  │  │  │  │  │  └─ Header.tsx
│        │  │  │  │  │  │  └─ PlanContent.tsx
│        │  │  │  │  │  └─ ValidationErrorDialog.tsx
│        │  │  │  │  ├─ Editor.tsx
│        │  │  │  │  ├─ hooks
│        │  │  │  │  │  └─ saveContext.ts
│        │  │  │  │  ├─ state
│        │  │  │  │  │  ├─ commands.test.ts
│        │  │  │  │  │  ├─ commands.ts
│        │  │  │  │  │  ├─ handlers
│        │  │  │  │  │  │  ├─ createNewDraftProject.ts
│        │  │  │  │  │  │  ├─ createProjectDraft.ts
│        │  │  │  │  │  │  ├─ handleCancelCurrentEdits.ts
│        │  │  │  │  │  │  ├─ handleCreateEditorProject.ts
│        │  │  │  │  │  │  ├─ handleStartCreateNewProject.ts
│        │  │  │  │  │  │  ├─ handleStartEditProject.ts
│        │  │  │  │  │  │  └─ handleUpdateProject.ts
│        │  │  │  │  │  ├─ reducer.ts
│        │  │  │  │  │  ├─ selector.ts
│        │  │  │  │  │  └─ state.ts
│        │  │  │  │  ├─ types
│        │  │  │  │  │  └─ projectDraft.ts
│        │  │  │  │  ├─ validation.ts
│        │  │  │  │  └─ validationMessages.ts
│        │  │  │  ├─ fields.ts
│        │  │  │  ├─ model.ts
│        │  │  │  ├─ ProjectIndex.tsx
│        │  │  │  ├─ projects.test.tsx
│        │  │  │  ├─ ProjectView.tsx
│        │  │  │  ├─ state
│        │  │  │  │  ├─ handlers
│        │  │  │  │  │  ├─ handleCloseEditor.ts
│        │  │  │  │  │  └─ handleOpenEditor.ts
│        │  │  │  │  ├─ reducer.test.ts
│        │  │  │  │  ├─ reducer.ts
│        │  │  │  │  ├─ selector.ts
│        │  │  │  │  ├─ slice.ts
│        │  │  │  │  └─ state.ts
│        │  │  │  ├─ store.ts
│        │  │  │  ├─ types
│        │  │  │  │  └─ project.ts
│        │  │  │  └─ types.ts
│        │  │  ├─ shared
│        │  │  │  ├─ ui
│        │  │  │  │  └─ MessageBox.tsx
│        │  │  │  └─ util
│        │  │  │     └─ state.ts
│        │  │  ├─ theme
│        │  │  │  ├─ index.ts
│        │  │  │  ├─ palette
│        │  │  │  │  ├─ dark.ts
│        │  │  │  │  ├─ index.tsx
│        │  │  │  │  ├─ light.ts
│        │  │  │  │  └─ refine.ts
│        │  │  │  └─ typography.ts
│        │  │  └─ transport
│        │  │     └─ schema.ts
│        │  ├─ tsconfig.json
│        │  └─ vite.config.ts
│        ├─ package.json
│        ├─ pnpm-lock.yaml
│        ├─ pnpm-workspace.yaml
│        ├─ README.md
│        ├─ scripts
│        │  ├─ dev.mjs
│        │  └─ dev.test.mjs
│        ├─ server
│        │  ├─ package.json
│        │  ├─ src
│        │  │  ├─ app.ts
│        │  │  ├─ auth
│        │  │  │  ├─ configuration.ts
│        │  │  │  ├─ oidc.ts
│        │  │  │  ├─ policy.ts
│        │  │  │  ├─ repository.ts
│        │  │  │  ├─ routes.ts
│        │  │  │  └─ service.ts
│        │  │  ├─ db
│        │  │  │  ├─ configuration.ts
│        │  │  │  ├─ database.ts
│        │  │  │  ├─ migrate-main.ts
│        │  │  │  ├─ migrate.ts
│        │  │  │  ├─ migrations
│        │  │  │  │  ├─ 0001_initial.ts
│        │  │  │  │  ├─ 0002_authentication.ts
│        │  │  │  │  ├─ 0003_project_ownership.ts
│        │  │  │  │  └─ 0004_project_context.ts
│        │  │  │  └─ migrations.ts
│        │  │  ├─ main.ts
│        │  │  ├─ production-app.ts
│        │  │  ├─ projects
│        │  │  │  ├─ creation.ts
│        │  │  │  ├─ module.ts
│        │  │  │  ├─ policy.ts
│        │  │  │  ├─ router-errors.ts
│        │  │  │  └─ routes.ts
│        │  │  └─ readiness.ts
│        │  ├─ test
│        │  │  ├─ auth-configuration.test.ts
│        │  │  ├─ auth-policy.test.ts
│        │  │  ├─ database-configuration.test.ts
│        │  │  ├─ fixtures
│        │  │  │  ├─ auth-browser.ts
│        │  │  │  └─ failing-migration.ts
│        │  │  ├─ integration
│        │  │  │  ├─ auth.test.ts
│        │  │  │  ├─ database.test.ts
│        │  │  │  └─ projects.test.ts
│        │  │  ├─ project-policy.test.ts
│        │  │  ├─ readiness.test.ts
│        │  │  ├─ request-logging.test.ts
│        │  │  └─ support
│        │  │     ├─ database.ts
│        │  │     └─ oidc-provider.ts
│        │  ├─ tsconfig.json
│        │  └─ tsconfig.test.json
│        └─ _docs
│           ├─ design-system.md
│           ├─ outdated
│           │  ├─ stack.md
│           │  └─ tasks.md
│           ├─ plan.md
│           ├─ process.md
│           ├─ projects-feature-review.md
│           ├─ stack.md
│           ├─ task-template.md
│           ├─ team
│           │  ├─ design-authority.md
│           │  ├─ pm.md
│           │  ├─ qa-engineer.md
│           │  └─ software-engineer.md
│           └─ testing-guidelines.md
├─ .codex
│  └─ hooks.json
├─ AGENTS.md
├─ client
│  ├─ index.html
│  ├─ package.json
│  ├─ playwright.config.ts
│  ├─ src
│  │  ├─ app
│  │  │  ├─ App.test.tsx
│  │  │  ├─ App.tsx
│  │  │  ├─ router.test.ts
│  │  │  ├─ router.tsx
│  │  │  └─ shell
│  │  │     ├─ AppRail.tsx
│  │  │     ├─ AppShell.tsx
│  │  │     ├─ AppTopBar.tsx
│  │  │     ├─ layout.ts
│  │  │     ├─ navigation.test.ts
│  │  │     └─ navigation.ts
│  │  ├─ auth
│  │  │  ├─ auth.ts
│  │  │  └─ contexts
│  │  │     ├─ AuthProvider.test.tsx
│  │  │     └─ AuthProvider.tsx
│  │  ├─ components
│  │  │  ├─ Auth
│  │  │  ├─ Context.tsx
│  │  │  ├─ Layout
│  │  │  ├─ LoginButton.tsx
│  │  │  └─ LogoutButton.tsx
│  │  ├─ core
│  │  │  ├─ api
│  │  │  │  ├─ api.ts
│  │  │  │  └─ useFocusSessionRevalidation.ts
│  │  │  ├─ routing
│  │  │  ├─ store
│  │  │  │  ├─ configure.ts
│  │  │  │  └─ hooks.ts
│  │  │  └─ theme
│  │  │     ├─ index.ts
│  │  │     ├─ palette
│  │  │     │  ├─ dark.ts
│  │  │     │  ├─ index.tsx
│  │  │     │  ├─ light.ts
│  │  │     │  └─ refine.ts
│  │  │     └─ typography.ts
│  │  ├─ index.css
│  │  ├─ main.tsx
│  │  ├─ projects
│  │  │  ├─ api
│  │  │  │  ├─ api.ts
│  │  │  │  ├─ projects.ts
│  │  │  │  └─ types.ts
│  │  │  ├─ api.ts
│  │  │  ├─ dashboard
│  │  │  │  ├─ components
│  │  │  │  ├─ Dashboard.tsx
│  │  │  │  ├─ grouping.test.ts
│  │  │  │  ├─ grouping.ts
│  │  │  │  ├─ sorting.test.ts
│  │  │  │  ├─ sorting.ts
│  │  │  │  ├─ state
│  │  │  │  │  ├─ handlers
│  │  │  │  │  └─ state.ts
│  │  │  │  └─ types.ts
│  │  │  ├─ editor
│  │  │  │  ├─ components
│  │  │  │  │  ├─ ProjectContent
│  │  │  │  │  │  ├─ Body
│  │  │  │  │  │  │  └─ ProjectContentBody.tsx
│  │  │  │  │  │  ├─ Footer
│  │  │  │  │  │  │  ├─ CloseAndCancelButton.tsx
│  │  │  │  │  │  │  ├─ CommitButton.test.tsx
│  │  │  │  │  │  │  ├─ CommitButton.tsx
│  │  │  │  │  │  │  ├─ DeleteButton.tsx
│  │  │  │  │  │  │  └─ Footer.tsx
│  │  │  │  │  │  ├─ Header
│  │  │  │  │  │  │  └─ Header.tsx
│  │  │  │  │  │  └─ PlanContent.tsx
│  │  │  │  │  └─ ValidationErrorDialog.tsx
│  │  │  │  ├─ Editor.tsx
│  │  │  │  ├─ hooks
│  │  │  │  │  └─ saveContext.ts
│  │  │  │  ├─ state
│  │  │  │  │  ├─ commands.test.ts
│  │  │  │  │  ├─ commands.ts
│  │  │  │  │  ├─ handlers
│  │  │  │  │  │  ├─ createNewDraftProject.ts
│  │  │  │  │  │  ├─ createProjectDraft.ts
│  │  │  │  │  │  ├─ handleCancelCurrentEdits.ts
│  │  │  │  │  │  ├─ handleCreateEditorProject.ts
│  │  │  │  │  │  ├─ handleStartCreateNewProject.ts
│  │  │  │  │  │  ├─ handleStartEditProject.ts
│  │  │  │  │  │  └─ handleUpdateProject.ts
│  │  │  │  │  ├─ reducer.ts
│  │  │  │  │  ├─ selector.ts
│  │  │  │  │  └─ state.ts
│  │  │  │  ├─ types
│  │  │  │  │  └─ projectDraft.ts
│  │  │  │  ├─ validation.ts
│  │  │  │  └─ validationMessages.ts
│  │  │  ├─ fields.ts
│  │  │  ├─ model.ts
│  │  │  ├─ ProjectIndex.tsx
│  │  │  ├─ projects.test.tsx
│  │  │  ├─ ProjectView.tsx
│  │  │  ├─ state
│  │  │  │  ├─ handlers
│  │  │  │  │  ├─ handleCloseEditor.ts
│  │  │  │  │  └─ handleOpenEditor.ts
│  │  │  │  ├─ reducer.test.ts
│  │  │  │  ├─ reducer.ts
│  │  │  │  ├─ selector.ts
│  │  │  │  ├─ slice.ts
│  │  │  │  └─ state.ts
│  │  │  └─ types
│  │  │     └─ project.ts
│  │  ├─ shared
│  │  │  ├─ ui
│  │  │  │  ├─ Badge.tsx
│  │  │  │  ├─ Button.tsx
│  │  │  │  ├─ Card.tsx
│  │  │  │  ├─ Field.tsx
│  │  │  │  ├─ Heading.tsx
│  │  │  │  ├─ MessageBox.tsx
│  │  │  │  └─ Tab.tsx
│  │  │  └─ util
│  │  │     └─ state.ts
│  │  └─ utils
│  │     ├─ authResponses.test.ts
│  │     └─ authResponses.ts
│  ├─ test
│  │  └─ browser
│  │     └─ auth.spec.ts
│  ├─ tsconfig.json
│  ├─ vite.config.ts
│  └─ vitest.config.ts
├─ package.json
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
├─ README.md
├─ scripts
│  ├─ dev.mjs
│  └─ dev.test.mjs
├─ server
│  ├─ package.json
│  ├─ src
│  │  ├─ app.ts
│  │  ├─ auth
│  │  │  ├─ configuration.ts
│  │  │  ├─ oidc.ts
│  │  │  ├─ policy.ts
│  │  │  ├─ repository.ts
│  │  │  ├─ routes.ts
│  │  │  └─ service.ts
│  │  ├─ db
│  │  │  ├─ configuration.ts
│  │  │  ├─ database.ts
│  │  │  ├─ migrate-main.ts
│  │  │  ├─ migrate.ts
│  │  │  ├─ migrations
│  │  │  │  ├─ 0001_initial.ts
│  │  │  │  ├─ 0002_authentication.ts
│  │  │  │  ├─ 0003_project_ownership.ts
│  │  │  │  └─ 0004_project_context.ts
│  │  │  └─ migrations.ts
│  │  ├─ main.ts
│  │  ├─ production-app.ts
│  │  ├─ projects
│  │  │  ├─ creation.ts
│  │  │  ├─ module.ts
│  │  │  ├─ policy.ts
│  │  │  ├─ router-errors.ts
│  │  │  └─ routes.ts
│  │  └─ readiness.ts
│  ├─ test
│  │  ├─ auth-configuration.test.ts
│  │  ├─ auth-policy.test.ts
│  │  ├─ database-configuration.test.ts
│  │  ├─ fixtures
│  │  │  ├─ auth-browser.ts
│  │  │  └─ failing-migration.ts
│  │  ├─ integration
│  │  │  ├─ auth.test.ts
│  │  │  ├─ database.test.ts
│  │  │  └─ projects.test.ts
│  │  ├─ project-policy.test.ts
│  │  ├─ readiness.test.ts
│  │  ├─ request-logging.test.ts
│  │  └─ support
│  │     ├─ database.ts
│  │     └─ oidc-provider.ts
│  ├─ tsconfig.json
│  └─ tsconfig.test.json
└─ _docs
   ├─ code-style.md
   ├─ plan.md
   ├─ process.md
   ├─ task-template.md
   ├─ team
   │  ├─ pm.md
   │  ├─ qa-engineer.md
   │  └─ software-engineer.md
   └─ testing-guidelines.md

```