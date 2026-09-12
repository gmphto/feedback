import { Box, Stack } from "@mui/material";
import type { ReactNode } from "react";

const croppingFieldLabels = [
  { key: "mvpOutcome", label: "MVP outcome" },
  { key: "constraints", label: "Constraints" },
] as const;

interface ProjectCardCroppingDetailsProps {
  /** Fallback value rendered when no override is provided for a field. */
  children?: ReactNode;
  /** Overrides keyed by field label so callers can map their own data. */
  overrides?: Partial<Record<(typeof croppingFieldLabels)[number]["label"], ReactNode>>;
}

/**
 * The compact "cropping" summary: the narrowest slice of a plan (its MVP
 * outcome and constraints). Values are truncated to one line with an ellipsis.
 */
export function ProjectCardCroppingDetails({
  children,
  overrides,
}: ProjectCardCroppingDetailsProps) {
  return (
    <Stack sx={{ gap: 0.5, minHeight: 28 }}>
      {croppingFieldLabels.map(({ key, label }) => (
        <Box
          key={key}
          component="dl"
          sx={{
            m: 0,
            display: "flex",
            alignItems: "baseline",
            gap: 1,
            fontSize: 11,
            lineHeight: 1.4,
            minWidth: 0,
          }}
        >
          <Box
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
            {label}
          </Box>
          <Box
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
            {overrides?.[label] ?? children}
          </Box>
        </Box>
      ))}
    </Stack>
  );
}