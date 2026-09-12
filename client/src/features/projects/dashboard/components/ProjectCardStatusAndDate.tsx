import { Box, Stack, Typography } from "@mui/material";

import type { ProjectStatus } from "./ProjectStatus";

interface ProjectCardStatusAndDateProps {
  /** The lifecycle status. */
  status: ProjectStatus;
  /** Short, display-only label for the status, e.g. "draft". */
  statusLabel?: string;
  /** Compact date rendered at the bottom-right. */
  date: string;
}

const statusColors: Record<ProjectStatus, { background: string; color: string }> = {
  draft: {
    background: "#f1f3f5",
    color: "#667085",
  },
  published: {
    background: "#e9f3e3",
    color: "#3f7d0f",
  },
};

/**
 * The card footer: a small rectangular status label at the bottom-left and a
 * compact date at the bottom-right.
 */
export function ProjectCardStatusAndDate({
  status,
  statusLabel,
  date,
}: ProjectCardStatusAndDateProps) {
  const colors = statusColors[status];

  return (
    <Stack
      direction="row"
      sx={{ alignItems: "center", gap: 1, mt: "auto" }}
    >
      <Box
        component="span"
        sx={{
          backgroundColor: colors.background,
          color: colors.color,
          borderRadius: "3px",
          fontSize: 9,
          fontWeight: 700,
          lineHeight: 1,
          px: 0.5,
          py: 0.25,
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {statusLabel ?? status}
      </Box>

      <Typography
        component="span"
        sx={{
          ml: "auto",
          fontSize: 10,
          color: "text.secondary",
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
        }}
      >
        {date}
      </Typography>
    </Stack>
  );
}