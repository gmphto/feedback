import { Stack } from "@mui/material";

import type { Project } from "../../types/project";
import { EmptyValue } from "./EmptyValue";
import { ProjectCardCroppingDetails } from "./ProjectCardCroppingDetails";
import { ProjectCardProductDetails } from "./ProjectCardProductDetails";
import { ProjectCardStatusAndDate } from "./ProjectCardStatusAndDate";
import { getProjectStatus } from "./ProjectStatus";
import { projectStatusLabels } from "./ProjectStatus";

interface ProjectCardContentProps {
  project: Project;
  /** Compact date for the footer, e.g. "26.03". */
  date: string;
}

/**
 * The compact body of a plan card: the primary-user line, the cropping
 * summary (MVP outcome + constraints) and the status/date footer.
 */
export function ProjectCardContent({
  project,
  date,
}: ProjectCardContentProps) {
  const status = getProjectStatus(project);

  return (
    <Stack sx={{ gap: 0.5, flexGrow: 1 }}>
      <ProjectCardProductDetails>
        {project.primaryUser?.trim() ? project.primaryUser : <EmptyValue />}
      </ProjectCardProductDetails>

      <ProjectCardCroppingDetails
        overrides={{
          "MVP outcome": project.mvpOutcome?.trim()
            ? project.mvpOutcome
            : <EmptyValue />,
          Constraints: project.constraints?.trim()
            ? project.constraints
            : <EmptyValue />,
        }}
      />

      <ProjectCardStatusAndDate
        status={status}
        statusLabel={projectStatusLabels[status]}
        date={date}
      />
    </Stack>
  );
}