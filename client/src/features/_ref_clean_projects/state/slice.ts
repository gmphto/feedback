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

  // extraReducers intentionally unused: RTK Query owns refresh, the slice must
  // not re-fetch server state (see _docs/redux-toolkit.md).
});

export default slice.reducer;

export const projectActions = slice.actions;