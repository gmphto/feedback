import { Box, Stack, Typography } from "@mui/material";

import type { Project } from "../../types/project";
import { ProjectCard } from "./ProjectCard";

interface ProjectGroupColumnProps {
  /** Column heading, centered and semibold. */
  title: string;
  projects: Project[];
}

/**
 * A single group column on the dashboard board.
 */
export function ProjectGroupColumn({
  title,
  projects,
}: ProjectGroupColumnProps) {
  return (
    <Stack
      sx={{
        minWidth: 240,
        maxWidth: 280,
        flexShrink: 0,
        backgroundColor: "#f1f3f5",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        px: 1,
        py: 1,
        alignSelf: "flex-start",
      }}
    >
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color: "text.secondary",
          textAlign: "center",
        }}
      >
        {title}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
        {projects?.length ? (
          projects.map((project) => (
            <ProjectCard
              key={project.projectId ?? `${project.name}-${project.createdOn}`}
              project={project}
            />
          ))
        ) : (
          <Typography
            sx={{
              fontSize: 11,
              color: "text.disabled",
              fontStyle: "italic",
              textAlign: "center",
              py: 1,
            }}
          >
            No plans yet
          </Typography>
        )}
      </Box>
    </Stack>
  );
}