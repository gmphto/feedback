import { createInitialDashboardState, type DashboardState } from '../dashboard/state/state';
import { createInitialEditorState, type EditorState } from '../editor/state/state';
import type { Project } from '../types/project';

/**
 * The client-owned project state. Server data (lists, loaded definitions)
 * lives in the RTK Query cache under `state.projectApi`; this slice holds view
 * selection and the editor's editable draft.
 *
 * See `_docs/redux-toolkit.md` for the ownership split.
 */
export interface ProjectState {
  /** The current view of the project feature, either "dashboard" or "editor". */
  view: 'dashboard' | 'editor';

  /**
   * All projects. Eventually selected from the RTK Query cache via a selector
   * (`projectApi.endpoints.getProjects.select()`); duplicated here right now
   * only until the dashboard stops owning the list. Do not add more copies.
   */
  projects: Project[];

  /** The state of the dashboard view, if the current view is "dashboard". */
  dashboard: DashboardState;

  /** The state of the editor view, if the current view is "editor". */
  editor: EditorState;
}

export const createInitialState = (): ProjectState => ({
  view: 'dashboard',
  projects: [],
  dashboard: createInitialDashboardState(),
  editor: createInitialEditorState(),
});