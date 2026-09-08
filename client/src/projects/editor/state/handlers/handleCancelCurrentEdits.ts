import type { EditorState } from "../state";
import { createProjectDraft } from "./createProjectDraft";

/**
 * Cancels all edits on the active project screen
 * if the active project is new, it is removed from the editor instead
 * @param state 
 * @param readOnlySession 
 */
export function handleCancelCurrentEdits(state: EditorState, readOnlySession: boolean): boolean {

    const { draft, original } = state

    if (!draft || readOnlySession) {
        return false
    }

    if (draft.isNew) {
        // delete state.
         return true; // Close the editor and clear its state.
    } else if (original) {
        state.draft = createProjectDraft(original, readOnlySession)
        state.activeKey = state.original?.projectId
        state.showValidationErrors = false
    }

    return false // Keep the editor open with the same activeKey

}