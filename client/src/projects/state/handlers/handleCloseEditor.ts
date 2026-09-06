import { createInitialEditorState } from "../../editor/state/state";
import type { ProjectState } from "../state";
/**
 * Projects state owns the editor 
 * So its incharge of mounting and unmounting the editor
 * Basically its entire lifecycle is managed by the project state
 */

export function handleCloseEditor(state: ProjectState) {
    state.view = 'dashboard';
    state.editor = createInitialEditorState()
}