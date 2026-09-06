import { createSelector } from "@reduxjs/toolkit";
import { projectApi } from "../api/api";
import type { RootState } from "../store";

export const selectActiveId = (state: RootState) =>
  state.project.editor.activeKey;

/**
 * Equivalent of original in editorState
 */
export const selectEditorProject = createSelector(
  [
    (state: RootState) => state,
    selectActiveId,
  ],
  (state, projectId) => {
    if (projectId === undefined) {
      return undefined;
    }

    return projectApi.endpoints.getProject.select(projectId)(
      state,
    ).data;
  },
);

export const selectView = (state: RootState) =>
  state.project.view;
