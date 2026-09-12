import { createInitialDashboardState, type DashboardState } from "../dashboard/state/state"
import { createInitialEditorState, type EditorState } from "../editor/state/state"
import type { Project } from "../types/project";

/**
 * The state of the project, which can be either in the dashboard view or the editor view.
 * Editable values go under editor boundary
 * Subsequently everything else is server state
 */
export interface ProjectState {

    /**
     * The current view of the project state, either "dashboard" or "editor".
     */
    view: "dashboard" | "editor"

    /** All Projects */
    // Its possible we will duplicate ownership here with rtk 
    // And redux state
    projects: Project[]

    /**
     * The state of the dashboard view, if the current view is "dashboard".
     */
    dashboard: DashboardState

    /**
     * The state of the editor view, if the current view is "editor".
     */
    editor: EditorState


}

/**
 * 
 * @returns The initial state for the project slice.
 */
export const createInitialState = (): ProjectState => ({
    view: 'dashboard',
    projects: [],
    dashboard: createInitialDashboardState(),
    editor: createInitialEditorState(),
});