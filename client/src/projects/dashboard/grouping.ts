import type { Project } from "../types/project";
import type { ProjectGroupingType, ProjectSortOrderType } from "./types";
import { sortProjects } from "./sorting";

export interface ProjectGrouping {
    type: ProjectGroupingType
    name: string
    // ProjectWithRefs
    groupProjects(projects: Project[], sortOrder: ProjectSortOrderType): ProjectGroup[]
}

export interface ProjectGroup<T = Project> {
    name: string
    projects: T[]
}

export function getSupportedGroupings(): ProjectGrouping[] {
    return [
        {
            type: "name",
            name: "Name",
            groupProjects: groupByName,
        }
    ]
}

function groupByName(projects: Project[], sortOrder: ProjectSortOrderType): ProjectGroup[] {
    const groups = new Map<string, Project[]>();

    for (const project of projects) {
        const name = Array.from(project.name?.trim() ?? "")[0]?.toUpperCase() ?? "#";
        const group = groups.get(name) ?? [];
        group.push(project);
        groups.set(name, group);
    }

    return sortProjects(Array.from(groups, ([name, projects]) => ({
        name,
        projects,
    })), sortOrder).sort((a, b) => a.name.localeCompare(b.name) * (sortOrder === "nameDesc" ? -1 : 1));
}
