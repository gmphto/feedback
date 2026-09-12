import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '../../../app/store';
import { projectApi } from '../api/api';

export const selectView = (state: RootState) => state.project.view;

export const selectActiveId = (state: RootState) => state.project.editor.activeKey;

/**
 * The project being edited, read straight from the RTK Query cache by the
 * active project id. When a mutation succeeds, RTK Query refetches the
 * matching query via the tags below and this selector re-renders subscribers.
 */
export const selectEditorProject = createSelector(
  [selectActiveId, (state: RootState) => state],
  (projectId, state) => {
    if (projectId === undefined) {
      return undefined;
    }

    return projectApi.endpoints.getProject.select(projectId)(state).data;
  },
);

export const selectEditorDraft = (state: RootState) =>
  state.project.editor.draft;

export const selectEditorShowValidationErrors = (state: RootState) =>
  state.project.editor.showValidationErrors;