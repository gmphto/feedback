import type { Project } from "../types/project";
import type { ProjectGroup } from "./grouping";
import type { ProjectSortOrderType } from "./types";

export interface ProjectSortOrder {
    type: ProjectSortOrderType,
    name: string,
    sortProjects<T>(p: T[], selector: (i: T) => Project): T[]
}

export function sortProjects(projects: ProjectGroup[], type: ProjectSortOrderType): ProjectGroup[] {
    const sortOrder = getSupportedSortOrders().find((item) => item.type === type) ?? getSupportedSortOrders()[0]

    return projects.map((group) => ({
        ...group,
        projects: sortOrder.sortProjects(group.projects, (p) => p),
    }))
}

export function getSupportedSortOrders(): ProjectSortOrder[] {
    return [
        {
            type: "dateDesc",
            name: "Date (descending)",
            sortProjects: (projects, selector) => sort(projects, selector, (a, b) => compareProjectDates(b,a))
        }
    ]
}

function sort<T>(items: T[], selector: (item: T) => Project, comparer: (a: Project, b: Project) => number) {
    return [...items].sort((left, right) => comparer(selector(left), selector(right)))
}

function compareProjectDates(a: Project, b: Project): number {
    const first = Date.parse(a.createdOn ?? "");
    const second = Date.parse(b.createdOn ?? "");
    if (!Number.isFinite(first)) return Number.isFinite(second) ? -1 : 0;
    if (!Number.isFinite(second)) return 1;
    return first - second;
}
