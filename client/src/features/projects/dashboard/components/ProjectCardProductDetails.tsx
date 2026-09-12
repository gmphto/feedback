import { Stack } from "@mui/material";
import type { ReactNode } from "react";

interface ProjectCardProductDetailsProps {
  /** The detail value. Margins are implied; an empty value renders a neutral placeholder. */
  children: ReactNode;
}

/**
 * The compact primary-user line of a plan card. Its value is truncated to one
 * line so long product descriptions cannot break the dense card layout.
 */
export function ProjectCardProductDetails({
  children,
}: ProjectCardProductDetailsProps) {
  return (
    <Stack
      component="dl"
      direction="row"
      sx={{
        alignItems: "baseline",
        gap: 1,
        m: 0,
        fontSize: 11,
        lineHeight: 1.4,
        minWidth: 0,
      }}
    >
      <Stack
        component="dt"
        sx={{
          flexShrink: 0,
          color: "text.disabled",
          fontWeight: 600,
          textTransform: "uppercase",
          fontSize: 9,
          letterSpacing: 0.4,
        }}
      >
        Primary user
      </Stack>
      <Stack
        component="dd"
        sx={{
          m: 0,
          ml: "auto",
          minWidth: 0,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          color: "text.secondary",
        }}
      >
        {children}
      </Stack>
    </Stack>
  );
}