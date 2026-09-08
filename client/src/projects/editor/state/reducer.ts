import type { PayloadAction } from "@reduxjs/toolkit";
import { handleCloseEditor } from "../../state/handlers/handleCloseEditor";
import type { ProjectDraft } from "../types/projectDraft";
import type { ProjectState } from "../../state/state";
import { handleCancelCurrentEdits } from "./handlers/handleCancelCurrentEdits";
import { handleUpdateProject } from "./handlers/handleUpdateProject";

export type ProjectUpdate = Partial<ProjectDraft>

export const editorReducer = {

    stopEditProject(state: ProjectState) {
        handleCloseEditor(state)
    },

    cancelCurrentEdits(
        state: ProjectState,
        { payload: { readOnlySession }}: PayloadAction<{ readOnlySession: boolean }>
    ) {
        const shouldClose = handleCancelCurrentEdits(state.editor, readOnlySession)

        if(shouldClose) {
            handleCloseEditor(state)
        }
    },

    updateProjectDraft(
        state: ProjectState,
        { payload: update }: PayloadAction<ProjectUpdate>
    ) {
        handleUpdateProject(state.editor, update)
    },

    setShowValidationErrors(
        state: ProjectState,
        { payload }: PayloadAction<boolean>
    ) {
        state.editor.showValidationErrors = payload
    }
}