import { Stack, Typography } from "@mui/material";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import type { Project } from "../types/project";
import { projectActions } from "../state/slice";
import { Header } from "./components/Header";
import { ProjectGroupColumn } from "./components/ProjectGroupColumn";
import { getSupportedGroupings, type ProjectGroup } from "./grouping";
import { selectDashboard } from "./state/selector";
import { sortProjects } from "./sorting";

export function ProjectDashboard() {
    const dashboard = useAppSelector(selectDashboard);
    const projects = useAppSelector((state) => state.project.projects);
    const dispatch = useAppDispatch();

    const { grouping, sortOrder, filter } = dashboard;

    const create = () =>
        dispatch(projectActions.startCreate({ readOnlySession: false }));

    const groups = useDashboardGroups(projects, grouping, sortOrder, filter);

    return (
        <Stack sx={{ gap: 0.5 }}>
            <Header
                pageTitle="Plans"
                onCreate={create}
                grouping={grouping}
                sortOrder={sortOrder}
                filter={filter}
                onGroupingChange={(value) =>
                    dispatch(projectActions.setGrouping(value))
                }
                onSortOrderChange={(value) =>
                    dispatch(projectActions.setSortOrder(value))
                }
                onFilterChange={(value) =>
                    dispatch(projectActions.setFilter(value))
                }
            />

            <Stack
                direction="row"
                sx={{
                    gap: 1,
                    alignItems: "flex-start",
                    overflowX: "auto",
                    px: 1,
                    pb: 2,
                }}
            >
                {groups.map((group) => (
                    <ProjectGroupColumn
                        key={group.name}
                        title={group.name}
                        projects={group.projects}
                    />
                ))}

                {groups.length === 0 && (
                    <Typography
                        sx={{
                            fontSize: 12,
                            color: "text.secondary",
                            py: 4,
                            px: 2,
                        }}
                    >
                        No projects match the current filter.
                    </Typography>
                )}
            </Stack>
        </Stack>
    );
}

/**
 * Groups, filters and sorts the dashboard projects into columns. Missing
 * grouping/filter values are tolerated so callers can pass undefined and the
 * component can render a single "All" column.
 */
function useDashboardGroups(
    projects: Project[],
    grouping: string | undefined,
    sortOrder: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc",
    filter: string | undefined,
): ProjectGroup[] {
    const normalizedFilter = filter?.trim().toLowerCase();

    const filtered = normalizedFilter
        ? projects.filter((project) =>
              (project.name ?? "").toLowerCase().includes(normalizedFilter),
          )
        : projects;

    const groupingByType = getSupportedGroupings().find(
        (item) => item.type === grouping,
    );
    if (groupingByType) {
        return groupingByType.groupProjects(filtered, sortOrder);
    }

    // The current schema has no persisted date-grouping implementation; any
    // grouping value without a registered implementation renders one column.
    return sortProjects([{ name: "All plans", projects: filtered }], sortOrder);
}