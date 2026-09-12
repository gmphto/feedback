import { createSlice } from '@reduxjs/toolkit'
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

    /** this is not needed, using rtk query which will own refresh logic */
    // extraReducers: (builder) => (
    //     builder.addCase(refreshAsync.fulfilled, (state, action) => {
    //         state.projects = action.payload.projects;
    //     })
    // ),

})

export default slice.reducer

export const projectActions = slice.actions
