import { expect, it } from "vitest";

import type { Project } from "../../../types/project";
import { groupPlans } from "./ContextPane";

const projects: Project[] = [
  { name: "Winter Barley", roughIdea: "", primaryUser: "", coreJob: "", mainProblem: "", mvpOutcome: "", initialProductAreas: "", constraints: "", createdOn: "2026-03-04T00:00:00" },
  { name: "Wheat", roughIdea: "", primaryUser: "", coreJob: "", mainProblem: "", mvpOutcome: "", initialProductAreas: "", constraints: "", createdOn: "2025-11-20T00:00:00" },
  { name: "", roughIdea: "", primaryUser: "", coreJob: "", mainProblem: "", mvpOutcome: "", initialProductAreas: "", constraints: "" },
];

it("groups plans by first letter and buckets unnamed plans under #", () => {
  const groups = groupPlans(projects, "name", "");

  expect(groups.map((group) => group.name)).toEqual(["#", "W"]);
  expect(groups[1].projects.map((project) => project.name)).toEqual(["Wheat", "Winter Barley"]);
});

it("filters plans by name before grouping", () => {
  const groups = groupPlans(projects, "name", "winter");

  expect(groups).toHaveLength(1);
  expect(groups[0].projects.map((project) => project.name)).toEqual(["Winter Barley"]);
});

it("groups plans by year and keeps undated plans in a named bucket", () => {
  const groups = groupPlans(projects, "date", "");

  const byName = new Map(groups.map((group) => [group.name, group.projects]));
  expect(byName.get("2026")?.map((project) => project.name)).toEqual(["Winter Barley"]);
  expect(byName.get("2025")?.map((project) => project.name)).toEqual(["Wheat"]);
  expect(byName.get("No date")).toHaveLength(1);
});

it("returns no groups when the filter matches nothing", () => {
  expect(groupPlans(projects, "name", "rye")).toEqual([]);
});
