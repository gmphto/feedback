# Project Scope Tool

A full-stack workspace for planning and tracking software projects.

## Codebase table of contents

The purpose of each top-level directory:

| Folder | Purpose |
| --- | --- |
| [client/](client/) | Frontend - for developers, engineers, and vibe coders to structurally express what they are building |
| [server/src/](server/src/) | Backend APIs, authentication, project logic, and database access |
| [server/test/](server/test/) | Backend tests, integration tests, and test helpers |
| [scripts/](scripts/) | Development tooling and lifecycle tests |
| [_docs/](_docs/) | Project plans, architecture, design guidelines, and team workflow |

Dependency folders (`node_modules`) and generated build output (`dist`) are excluded.

### Repository layout

The layout below shows the folders that are checked into version control;
it omits generated build output and dependency folders such as `node_modules`.

```text
feedback
├─ .agents
│  └─ karpathy.md
├─ .gitignore
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
│  │  │  ├─ Context.tsx
│  │  │  ├─ LoginButton.tsx
│  │  │  └─ LogoutButton.tsx
│  │  ├─ core
│  │  │  ├─ api
│  │  │  │  ├─ api.ts
│  │  │  │  └─ useFocusSessionRevalidation.ts
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
│  │  │  ├─ ProjectIndex.tsx
│  │  │  ├─ ProjectView.tsx
│  │  │  ├─ api
│  │  │  │  ├─ api.ts
│  │  │  │  ├─ projects.ts
│  │  │  │  └─ types.ts
│  │  │  ├─ api.ts
│  │  │  ├─ dashboard
│  │  │  │  ├─ Dashboard.tsx
│  │  │  │  ├─ grouping.test.ts
│  │  │  │  ├─ grouping.ts
│  │  │  │  ├─ sorting.test.ts
│  │  │  │  ├─ sorting.ts
│  │  │  │  ├─ state
│  │  │  │  │  └─ state.ts
│  │  │  │  └─ types.ts
│  │  │  ├─ editor
│  │  │  │  ├─ Editor.tsx
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
│  │  │  ├─ projects.test.tsx
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