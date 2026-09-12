import type { PayloadAction } from "@reduxjs/toolkit";

import type { ProjectState } from "../../state/state";
import type { ProjectGroupingType, ProjectSortOrderType } from "../types";

/**
 * Dashboard view-state transitions. Server data (the project list) lives in
 * the RTK Query cache (`state.projectApi`); this reducer only owns view
 * preferences: grouping, sorting and filter.
 */
export const dashboardReducer = {
  setGrouping: (
    state: ProjectState,
    action: PayloadAction<ProjectGroupingType | undefined>,
  ) => {
    state.dashboard.grouping = action.payload;
  },

  setSortOrder: (
    state: ProjectState,
    action: PayloadAction<ProjectSortOrderType>,
  ) => {
    state.dashboard.sortOrder = action.payload;
  },

  setFilter: (
    state: ProjectState,
    action: PayloadAction<string | undefined>,
  ) => {
    state.dashboard.filter = action.payload;
  },
};