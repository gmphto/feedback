import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { emptyDraft } from '../fields';
import type { EditorState } from '../editor/state/state';
import type { ProjectState } from './state';
import type { Project } from '../types/project';
import type { GuidString } from '../../shared/util/types';
// import { PayloadA}


interface StartEditPayload {

    // projectKey: GuidString

    /** The project to open in the editor */
    projectToOpen: Project

    /** Indicates if the session is read-only */
    readOnlySession: boolean;

}

export const projectReducer = {
    startCreate: (
        state: ProjectState,
        {
            payload: { readOnlySession, userInfo },
        }: PayloadAction<{
            readOnlySession: boolean;
            userInfo: UserInfo;
        }>
    ) => {
        const {} = state;
        handleOpenEditor(state, { isNew: true, isReadOnly: readOnlySession });
    },

    startEdit: (
        state: ProjectState,
        {
            payload: { projectToOpen, readOnlySession },
        }: PayloadAction<StartEditPayload>
    ) => {
        const {} = state;
        handleOpenEditor(state, { ...projectToOpen, isNew: false, isReadOnly: readOnlySession });
    },

    stopEdit: (state: ProjectState) => {
        state.view = 'dashboard';
        state.editor = { activeKey: undefined, original: undefined, draft: undefined };
    },

    startCopy: (
        state: ProjectState,
        {
            payload: { projectToOpen, readOnlySession },
        }: PayloadAction<StartEditPayload>
    ) => {
        const {} = state;
        handleOpenEditor(state, { ...projectToOpen, isNew: true, isReadOnly: readOnlySession });
    },
}

// const projectsSlice = createSlice({
//   name: 'projects',
//   initialState,
//   reducers: {
//     startCreate(state) {
//       state.view = 'editor';
//       state.editor = { activeKey: undefined, original: undefined, draft: emptyDraft() };
//     },
//     startEdit(state, { payload }: PayloadAction<NonNullable<EditorState['original']>>) {
//       const { id, version: _version, ...draft } = payload;
//       state.view = 'editor';
//       state.editor = { activeKey: id, original: { ...payload }, draft };
//     },
//     stopEdit(state) {
//       state.view = 'dashboard';
//       state.editor = { activeKey: undefined, original: undefined, draft: undefined };
//     },
//   },
// });

export const { startCreate, startEdit, stopEdit } = projectsSlice.actions;
export const projectsReducer = projectsSlice.reducer;
