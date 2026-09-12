# Redux Toolkit + RTK Query setup

How client state is organized so agents can extend it without breaking conventions.

## Two kinds of state, two owners

All client state lives in Redux, but it is split by **ownership**, not by file type:

| State | Owned by | Lives in |
| --- | --- | --- |
| Server state (fetched data, loading, errors) | RTK Query APIs | `features/<feature>/api/` |
| Client state (view, filters, drafts, validation) | Redux Toolkit slices | `features/<feature>/state/` |

- RTK Query owns request data, loading and errors. Do **not** copy those into a slice or local component state.
- Slices own everything the server does not care about: navigation between views, editable drafts, validation flags, UI preferences.

A feature owns its data. `features/projects/` is the reference feature: its `api/`, `state/`, nested `dashboard/` and `editor/` sub-states, and components all live under one folder.

## Feature directory layout

```
client/src/
  app/                                  # app-wide wiring, no feature logic
    store.ts                            # configureStore + RootState/AppDispatch
    hooks.ts                            # useAppDispatch / useAppSelector
  shared/
    api/api.ts                          # feedApi (shared API factory), injected per feature
  features/
    <feature>/
      api/
        api.ts                          # feature API, OR endpoint injection into a shared API
        projects.ts                     # server <-> client converters
      state/
        slice.ts                        # createSlice + slice.actions export
        reducer.ts                      # state transitions (handlers), spread into slice
        state.ts                        # FeatureState interface + createInitialState
        selector.ts                     # useAppSelector / createSelector selectors
        handlers/                       # pure transition functions per action
      <view>/                           # e.g. dashboard/, editor/
        components/
        state/                          # nested view state (state.ts, reducer.ts, selector.ts)
```

## Store setup — `client/src/app/store.ts`

```ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { projectApi } from '../features/projects/api/api';
import projectReducer from '../features/projects/state/slice';
import { feedApi } from '../shared/api/api';
import '../features/auth/api/auth'; // injects auth endpoints into feedApi

export const store = configureStore({
  reducer: {
    project: projectReducer,

    /** https://redux-toolkit.js.org/rtk-query/api/created-api/redux-integration */
    [projectApi.reducerPath]: projectApi.reducer,
    [feedApi.reducerPath]: feedApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(projectApi.middleware, feedApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

Rules:

- One entry in `reducer` per slice, keyed by the slice name (`project:`).
- One entry per RTK Query API, keyed by `[api.reducerPath]` (this is required so the API can find its own cache).
- Every API reducer must also have its `middleware` concatenated, or its cache/refetch behavior breaks.
- Add every new slice and every new API here; forgetting one silently loses that state.
- `setupListeners(store.dispatch)` enables refetch-on-reconnect / refetch-on-focus. Done once here.

## Typed hooks — `client/src/app/hooks.ts`

All components use these typed hooks instead of `useDispatch`/`useSelector` directly.

```ts
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

## State — `features/<feature>/state/state.ts`

Each feature exports a `FeatureState` interface and a `createInitialState()` factory.

```ts
export interface FeatureState {
  /** ...feature state goes here */
  /** ...can nest how you like, depending on components and ownership */
}

export const createInitialState = (): FeatureState => ({
  /** ...initial values for state */
});
```

Reference example — `features/projects/state/state.ts`:

```ts
export interface ProjectState {
  view: 'dashboard' | 'editor';       // navigation between the feature's views
  projects: Project[];                // (currently duplicated RTK server state)
  dashboard: DashboardState;          // nested view sub-state
  editor: EditorState;                // editable values + validation stay in the slice
}

export const createInitialState = (): ProjectState => ({
  view: 'dashboard',
  projects: [],
  dashboard: createInitialDashboardState(),
  editor: createInitialEditorState(),
});
```

Ownership guidance:

- Editable, in-progress values (`draft`, validation flags) go in slice state.
- Server values that must be read/written via the API belong to RTK Query. If a slice needs server data, derive it with a selector from the API cache instead of copying it into the slice.
- Sub-state per view (`dashboard`, `editor`) is normal: each view exports its own `XState` interface and `createInitialXState()` factory, nested under the feature state.

## Slice — `features/<feature>/state/slice.ts`

The slice is the single entry point that registers a feature's state with Redux. It composes state-transition objects ("reducers") and owns the `reset` action.

```ts
import { createSlice } from '@reduxjs/toolkit';
import { createInitialState } from './state';

export const slice = createSlice({
  name: 'featureName',
  initialState: createInitialState(),

  reducers: {
    reset: () => createInitialState(),
    ...nestedReducer,
  },
});

export default slice.reducer;
```

Reference example — `features/projects/state/slice.ts`:

```ts
import { createSlice } from '@reduxjs/toolkit';
import { projectReducer } from './reducer';
import { createInitialState } from './state';
import { editorReducer } from '../editor/state/reducer';

export const slice = createSlice({
  name: 'projects',
  initialState: createInitialState(),
  reducers: {
    reset: () => createInitialState(),
    ...projectReducer,
    ...editorReducer,
  },
  // extraReducers intentionally unused:
  // RTK Query owns refresh, the slice must not re-fetch server state
});

export default slice.reducer;

export const projectActions = slice.actions;
```

Rules:

- `name` is unique and matches the store reducer key.
- `initialState` always comes from `createInitialState()`, never a literal.
- `reset` is always defined so any feature can return to `createInitialState()` with one dispatch.
- Spreading reducer-objects (`...projectReducer, ...editorReducer`) is how sub-states contribute actions without owning the slice. Keep each nested reducer file next to the state it transitions.
- `extraReducers` is **not** used for server data — RTK Query owns refresh. (See the commented-out code in the reference slice.)
- Do not add actions here that are not state transitions. Reducers must stay synchronous and pure.

## Reducers as transition collections — `features/<feature>/state/reducer.ts`

Reducer objects are just named transition functions keyed by action name. They may delegate to pure handlers in `state/handlers/`.

```ts
export const projectReducer = {
  startCreate(state, { payload: { readOnlySession } }: PayloadAction<{ readOnlySession: boolean }>) {
    handleOpenEditor(state, handleStartCreateNewProject(state.editor, readOnlySession));
  },
  startEdit(state, { payload: { projectToOpen, readOnlySession } }: PayloadAction<StartEditPayload>) {
    handleOpenEditor(state, handleStartEditProject(state.editor, projectToOpen, readOnlySession));
  },
};
```

## Actions — export from the slice

The accumulated action creators are exported from the slice and used by components:

```ts
import { projectActions } from '../features/projects/state/slice';

dispatch(projectActions.reset());
dispatch(projectActions.updateProjectDraft(update));
dispatch(projectActions.cancelCurrentEdits({ readOnlySession: draft?.isReadOnly ?? true }));
```

## Selectors — `features/<feature>/state/selector.ts`

Components subscribe with selectors, not inline slice paths where possible.

- Small leaf selectors return one field: `selectView = (state) => state.project.view`.
- Derived selectors use `createSelector` from `@reduxjs/toolkit`.
- Server data needed by a slice is selected from the RTK Query cache by endpoint:

```ts
export const selectEditorProject = createSelector(
  [(state: RootState) => state, selectActiveId],
  (state, projectId) =>
    projectApi.endpoints.getProject.select(projectId)(state).data,
);
```

## RTK Query APIs — `features/<feature>/api/`

There are two valid patterns. Match whichever the target feature already uses.

### Feature-owned API — `createApi`

Used when a feature owns a full API surface (reference: `features/projects/api/api.ts`):

```ts
export const projectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Project'],
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => '/projects',
      transformResponse: (res) => setupProjects(res),
      providesTags: (projects) => [
        { type: 'Project', id: 'LIST' },
        ...(projects ?? []).map(({ projectId }) => ({ type: 'Project' as const, projectId })),
      ],
    }),
    createProject: builder.mutation<Project, ProjectDraft>({
      query: (draft) => ({ url: '/projects', method: 'POST', body: convertProjectToApi(draft) }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),
  }),
});
```

### Endpoint injection — `injectEndpoints`

Used when feature endpoints are attached to the shared `feedApi`. The shared factory holds the `baseQuery`, so each feature only defines its endpoints. Reference: `shared/api/api.ts` + `features/auth/api/auth.ts`.

```ts
// shared/api/api.ts
export const feedApi = createApi({
  reducerPath: 'feedApi',
  baseQuery: fetchBaseQuery({
    baseUrl: globalThis.location?.origin ?? 'http://localhost',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { accept: 'application/json' },
  }),
  endpoints: () => ({}),
});
```

```ts
// features/auth/api/auth.ts — imported for its side effect in app/store.ts
export const { useGetSessionQuery, useLoginMutation, useLogoutMutation } = feedApi.injectEndpoints({
  endpoints: (builder) => ({
    getSession: builder.query<User | null, void>({ query: () => '/api/session', ... }),
    login: builder.mutation<string, void>({ query: () => '/auth/login?...', ... }),
    logout: builder.mutation<void, void>({ query: () => ({ url: '/auth/logout', method: 'POST' }), ... }),
  }),
});
```

Rules:

- `reducerPath` must be unique. It becomes both the store key and the middleware key.
- Queries `providesTags`, mutations `invalidatesTags`. Cache invalidation must use these tags; do not dispatch manual refetches.
- Server ↔ client shape conversion stays in files like `projects.ts` (`setupProjects` server→client, `convertProjectToApi` client→server).
- Endpoint injection files that must load before the store is built are imported for their side effect in `app/store.ts`.

## Using RTK Query in components

Generated hooks are used directly; do not copy `isLoading`/`error` into local state.

```ts
const { data: projects, isLoading, error } = useGetProjectsQuery();
const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
```

## Checklist when adding a new feature

1. Create `features/<feature>/state/state.ts` — `FeatureState` + `createInitialState()`.
2. Create reducer objects (`state/reducer.ts`, and `state/handlers/` for pure transitions).
3. Create `state/slice.ts` — `createSlice` with `reset` + spread reducers; export `default slice.reducer` and `<feature>Actions`.
4. Create selectors in `state/selector.ts` and register the feature state in `app/store.ts`.
5. If the feature talks to the server, add its RTK Query API (or inject endpoints) and register `[api.reducerPath]` + `api.middleware` in `app/store.ts`.
6. Never add server-fetching logic to the slice; it belongs to RTK Query.