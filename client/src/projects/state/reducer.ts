import { type PayloadAction } from '@reduxjs/toolkit';
import type { ProjectState } from './state';
import type { Project } from '../types/project';

interface StartEditPayload {

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