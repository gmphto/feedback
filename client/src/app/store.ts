import {
  combineReducers,
  configureStore,
  createAction,
  type Action,
} from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Injects the auth endpoints into feedApi before the store is built, so the
// endpoint inventory does not depend on which module the bundler evaluates first.
import { projectApi } from '../features/projects/api/api';
import projectReducer from '../features/projects/state/slice';
import { feedApi } from '../shared/api/api';
import '../features/auth/api/auth';

/**
 * Fired exactly once when an application session ends: the root reducer re-runs
 * every slice and RTK Query cache from `undefined`, so each feature returns to
 * its own `createInitialState()` without registering per-feature reset actions
 * here.
 */
export const sessionEnded = createAction('app/sessionEnded');

const appReducer = combineReducers({
  project: projectReducer,

  /** https://redux-toolkit.js.org/rtk-query/api/created-api/redux-integration */
  [projectApi.reducerPath]: projectApi.reducer,
  [feedApi.reducerPath]: feedApi.reducer,
});

// https://redux.js.org/usage/structuring-reducers/initializing-state#resetting-state
const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: Action,
) => (sessionEnded.match(action) ? appReducer(undefined, action) : appReducer(state, action));

export const store = configureStore({
  reducer: rootReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(projectApi.middleware, feedApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
