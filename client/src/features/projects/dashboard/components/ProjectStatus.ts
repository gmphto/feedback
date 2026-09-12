import type { Project } from "../../types/project";

/**
 * A project's lifecycle status. The current schema has no persisted status;
 * the card is a draft until it is created, then considered "draft" until the
 * plan is published.
 */
export type ProjectStatus = "draft" | "published";

/**
 * Derives the status label for a card.
 *
 * @param project the project being rendered; `undefined` guards a placeholder
 * @returns "Published" for projects that carry an id, "Draft" otherwise
 */
export function getProjectStatus(project: Project | undefined): ProjectStatus {
  return project?.projectId === undefined ? "draft" : "published";
}

/** Display label for a status value. */
export const projectStatusLabels: Record<ProjectStatus, string> = {
  draft: "Draft",
  published: "Published",
};