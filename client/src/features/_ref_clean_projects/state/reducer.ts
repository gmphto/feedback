import type { PayloadAction } from '@reduxjs/toolkit';

import type { Project } from '../types/project';
import type { ProjectState } from './state';
import { handleOpenEditor } from './handlers/handleOpenEditor';
import { createInitialEditorState } from '../editor/state/state';
import { handleStartCreateNewProject } from '../editor/state/handlers/handleStartCreateNewProject';
import { handleStartEditProject } from '../editor/state/handlers/handleStartEditProject';
import { handleCloseEditor } from './handlers/handleCloseEditor';
import { handleCancelCurrentEdits } from '../editor/state/handlers/handleCancelCurrentEdits';

interface StartEditPayload {
  /** The project to open in the editor. */
  projectToOpen: Project;
  /** Indicates if the session is read-only. */
  readOnlySession: boolean;
}

/**
 * Pure state transitions for the project feature. Each action only changes the
 * state tree; effects (fetching, navigation) live in components and RTK Query.
 */
export const projectReducer = {
  startCreate(
    state: ProjectState,
    { payload: { readOnlySession } }: PayloadAction<{ readOnlySession: boolean }>,
  ) {
    handleOpenEditor(
      state,
      handleStartCreateNewProject(state.editor, readOnlySession),
    );
  },

  startEdit(
    state: ProjectState,
    { payload: { projectToOpen, readOnlySession } }: PayloadAction<StartEditPayload>,
  ) {
    handleOpenEditor(
      state,
      handleStartEditProject(state.editor, projectToOpen, readOnlySession),
    );
  },

  stopEdit(state: ProjectState) {
    handleCloseEditor(state);
    state.view = 'dashboard';
  },

  /**
   * Drop the in-progress draft and show the dashboard again without touching
   * server state. The snapshot of the list lives in the RTK Query cache, not
   * here, so cancel never has to reconcile it.
   */
  cancelCurrentEdits(
    state: ProjectState,
    { payload: { readOnlySession } }: PayloadAction<{ readOnlySession: boolean }>,
  ) {
    const shouldClose = handleCancelCurrentEdits(state.editor, readOnlySession);

    if (shouldClose) {
      handleCloseEditor(state);
      state.view = 'dashboard';
    }
  },

  /** When entering the editor, always start with the pristine editor state. */
  resetEditor(state: ProjectState) {
    state.editor = createInitialEditorState();
  },
};