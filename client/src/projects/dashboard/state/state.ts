import type { ProjectGroupingType, ProjectSortOrderType } from "../types";

/**
 * Dashboard state interface
 */
export interface DashboardState {

    /** The current filter applied to the dashboard view, if any. */
    filter: string | undefined

    /** The current grouping applied to the dashboard view, if any. */
    grouping: ProjectGroupingType | undefined

    /** The current sort order applied to the dashboard view. */
    sortOrder: ProjectSortOrderType

}

export const createInitialDashboardState = (): DashboardState => {
    return {
        filter: undefined,
        grouping: undefined,
        sortOrder: "nameDesc",
    }
}