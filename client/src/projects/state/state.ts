import type { DashboardState } from "../dashboard/state/state"
import type { EditorState } from "../editor/state/state"

const initialState: ProjectState = {
  view: 'dashboard',
  dashboard: {},
  editor: { activeKey: undefined, original: undefined, draft: undefined },
};

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
 * @returns 
 */
export const createInitialState = (): ProjectState => ({
    view: 'dashboard',
    dashboard: {},
    editor: { activeKey: undefined, original: undefined, draft: undefined },
});