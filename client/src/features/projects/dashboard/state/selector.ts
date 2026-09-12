import type { RootState } from "../../../../app/store";

export const selectDashboard = (state: RootState) =>
  state.project.dashboard;