import { Box } from "@mui/material";

import { useAppDispatch } from "../../../../app/hooks";
import { projectActions } from "../../state/slice";
import type { Project } from "../../types/project";
import { ProjectCardContent } from "./ProjectCardContent";
import { ProjectCardHeader } from "./ProjectCardHeader";

interface ProjectCardProps {
  project: Project;
}

/**
 * A compact plan card on the dashboard board. Opens the plan in the editor
 * and computes its compact date and lifecycle status directly.
 *
 * Layout follows the card grammar:
 *
 * ┌─────────────────────────────────────┐
 * │ Plan name     ⋮               26.03 │
 * │ [Draft]                       date  │
 * └─────────────────────────────────────┘
 */
export function ProjectCard({ project }: ProjectCardProps) {
  const dispatch = useAppDispatch();

  const displayDate = formatProjectDate(
    project.createdOn ?? project.updatedOn,
  );

  const handleOpen = () =>
    dispatch(
      projectActions.startEdit({
        projectToOpen: project,
        readOnlySession: false,
      }),
    );

  return (
    <Box
      sx={{
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "6px",
        boxShadow: "0 1px 2px rgb(15 23 42 / 0.04)",
        px: 1.5,
        py: 1,
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        cursor: "pointer",
        "&:hover": {
          borderColor: "primary.light",
          boxShadow: "0 1px 3px rgb(15 23 42 / 0.08)",
        },
      }}
      onClick={handleOpen}
    >
      <ProjectCardHeader
        title={project.name || "Untitled plan"}
        meta={displayDate}
        onOpen={handleOpen}
      />

      <ProjectCardContent project={project} date={displayDate} />
    </Box>
  );
}

/**
 * Formats an ISO date string as `DD.MM` for the compact card metadata.
 * Missing or unparseable values render as an em dash.
 */
function formatProjectDate(value: string | undefined): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}`;
}