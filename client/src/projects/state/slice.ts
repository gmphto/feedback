import { createSlice } from '@reduxjs/toolkit'
import { projectReducer } from './reducer';
import { createInitialState } from './state';
import { refreshAsync } from './actions';

export const slice = createSlice({

    name: 'projects',

    initialState: createInitialState(),

    reducers: {
        ...projectReducer
    },

    extraReducers: (builder) => (
        builder.addCase(refreshAsync.fulfilled, (state, action) => {
            state.projects = action.payload.projects;
        })
    ),

})

export default slice.reducer

export const projectActions = slice.actions