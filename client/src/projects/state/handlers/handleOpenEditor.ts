import type { ProjectState } from "../state";
import type { EditorState } from "../../editor/state/state";

export function handleOpenEditor(
    state: ProjectState, editorState: EditorState): ProjectState {

    state.editor = editorState;

    state.view = 'editor';
    state.editor.showValidationErrors = false;
    
    return state;
}