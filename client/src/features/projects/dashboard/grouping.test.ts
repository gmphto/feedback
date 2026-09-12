import { expect, it } from "vitest";
import { getSupportedGroupings } from "./grouping";
import type { ProjectSortOrderType } from "./types";

it("groups names and sorts projects without changing the input", () => {
    const group = getSupportedGroupings().find(group => group.type === "name")!;
    const projects = [
        { name: "Apricot", createdOn: "2026-01-01" },
        { name: "Apple", createdOn: "2026-02-01" },
        { name: "avocado", createdOn: "invalid" },
        { name: " banana" },
        {},
        { name: "  " },
    ];
    const original = structuredClone(projects);
    const orders: [ProjectSortOrderType, string[]][] = [
        ["nameAsc", ["Apple", "Apricot", "avocado"]],
        ["nameDesc", ["avocado", "Apricot", "Apple"]],
        ["dateAsc", ["Apricot", "Apple", "avocado"]],
        ["dateDesc", ["Apple", "Apricot", "avocado"]],
    ];
    for (const [order, names] of orders) {
        const groups = group.groupProjects(projects, order);
        expect(groups.map(group => group.name)).toEqual(order === "nameDesc" ? ["B", "A", "#"] : ["#", "A", "B"]);
        expect(groups.find(group => group.name === "A")?.projects.map(project => project.name)).toEqual(names);
        expect(groups.find(group => group.name === "#")?.projects).toHaveLength(2);
    }
    expect(projects).toEqual(original);
    expect(group.groupProjects([], "nameAsc")).toEqual([]);
});
