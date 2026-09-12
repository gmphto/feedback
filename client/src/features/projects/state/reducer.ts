import { type PayloadAction } from '@reduxjs/toolkit';
import type { ProjectState } from './state';
import type { Project } from '../types/project';
import { handleOpenEditor } from './handlers/handleOpenEditor';
import { handleStartCreateNewProject } from '../editor/state/handlers/handleStartCreateNewProject';
import { handleStartEditProject } from '../editor/state/handlers/handleStartEditProject';

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
            payload: { readOnlySession },
        }: PayloadAction<{
            readOnlySession: boolean;
        }>
    ) => {
        handleOpenEditor(
            state, 
            handleStartCreateNewProject(state.editor, readOnlySession)
        );
    },

    startEdit: (
        state: ProjectState,
        {
            payload: { projectToOpen, readOnlySession },
        }: PayloadAction<StartEditPayload>
    ) => {
        handleOpenEditor(
            state, 
            handleStartEditProject(state.editor, projectToOpen, readOnlySession)
        );
    },

    // startCopy: (
    //     state: ProjectState,
    //     {
    //         payload: { projectToOpen, readOnlySession },
    //     }: PayloadAction<StartEditPayload>
    // ) => {
    //     const {} = state;
    //     handleOpenEditor(state, handleStartCopyProject(state.editor, projectToOpen, readOnlySession));
    // },
}