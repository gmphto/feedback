import { MoreHoriz, NorthEast } from "@mui/icons-material";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface ProjectCardHeaderProps {
  /** Primary identifier shown at the top-left of the card. */
  title: ReactNode;
  /** Compact metadata, usually a two-digit number, shown at the top-right. */
  meta: ReactNode;
  /** Opens the plan in the editor. */
  onOpen: () => void;
}

/**
 * Card title row: primary identifier at the top-left with the overflow menu
 * beside it and a compact metadata badge at the top-right.
 */
export function ProjectCardHeader({
  title,
  meta,
  onOpen,
}: ProjectCardHeaderProps) {
  return (
    <Stack
      direction="row"
      sx={{ alignItems: "center", gap: 0.5 }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          fontSize: 12,
          minWidth: 0,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          "&:hover": { color: "primary.main" },
        }}
      >
        {title}
      </Typography>

      <IconButton
        size="small"
        aria-label="Open plan"
        onClick={onOpen}
        title="Open plan"
        sx={{
          width: 24,
          height: 24,
          p: 0.5,
          flexShrink: 0,
          color: "text.secondary",
        }}
      >
        <NorthEast sx={{ fontSize: 13 }} />
      </IconButton>

      <Tooltip title="More options">
        <IconButton
          size="small"
          aria-label="More options"
          onClick={onOpen}
          sx={{
            width: 22,
            height: 22,
            p: 0.4,
            flexShrink: 0,
            color: "text.secondary",
          }}
        >
          <MoreHoriz fontSize="small" sx={{ fontSize: 15 }} />
        </IconButton>
      </Tooltip>

      <Box sx={{ ml: "auto", flexShrink: 0 }}>
        <Typography
          component="span"
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: "text.secondary",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {meta}
        </Typography>
      </Box>
    </Stack>
  );
}