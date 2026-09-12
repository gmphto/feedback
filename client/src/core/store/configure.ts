import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Injects the auth endpoints into feedApi before the store is built, so the
// endpoint inventory does not depend on which module the bundler evaluates first.
import { projectApi } from '../../projects/api/api';
import projectReducer from '../../projects/state/slice';
import { feedApi } from '../api/api';
import '../../auth/auth';

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
