import { expect, it } from "vitest";
import { getSupportedSortOrders, sortProjects } from "./sorting";

it("sorts dates newest first with missing and invalid dates last", () => {
    const order = getSupportedSortOrders().find(order => order.type === "dateDesc")!;
    const projects = [
        { name: "Missing" },
        { name: "Older", createdOn: "2026-01-01T12:00:00+02:00" },
        { name: "Invalid", createdOn: "invalid" },
        { name: "Newer", createdOn: "2026-01-01T11:00:00Z" },
        { name: "Same instant", createdOn: "2026-01-01T12:00:00+01:00" },
    ];
    expect(order.sortProjects(projects, project => project).map(project => project.name))
        .toEqual(["Newer", "Same instant", "Older", "Missing", "Invalid"]);
});

it("sorts wrapped projects without mutating groups or input arrays", () => {
    const items = [
        { project: { name: "Beta", createdOn: "2026-01-01" } },
        { project: { name: "Alpha", createdOn: "2026-02-01" } },
    ];
    const expected = {
        nameAsc: [items[1], items[0]],
        nameDesc: [items[0], items[1]],
        dateAsc: [items[0], items[1]],
        dateDesc: [items[1], items[0]],
    };
    for (const order of getSupportedSortOrders()) {
        expect(order.sortProjects(items, item => item.project)).toEqual(expected[order.type]);
        expect(order.sortProjects([], item => item)).toEqual([]);
    }
    expect(items[0].project.name).toBe("Beta");
    const groups = [{ name: "All", projects: items.map(item => item.project) }];
    expect(sortProjects(groups, "nameAsc")[0].projects).toEqual([items[1].project, items[0].project]);
    expect(groups[0].projects).toEqual([items[0].project, items[1].project]);
});
