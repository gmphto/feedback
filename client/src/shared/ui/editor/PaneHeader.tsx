import { Box } from '@mui/material';
import * as React from 'react';

import { border, surface, text, typeScale } from './tokens';

interface PaneHeaderProps {
  Icon?: React.ElementType;
  /** Inline marker shown before the title, e.g. a status badge. */
  leading?: React.ReactNode;
  title: string;
  /** Secondary label shown beside the title, e.g. a count or status. */
  meta?: React.ReactNode;
  /** Controls pinned to the right of the header. */
  actions?: React.ReactNode;
}

/**
 * The band at the top of a pane. It stays visually separate from the scrolling
 * content below via a single hairline, with no decoration.
 */
export function PaneHeader({ Icon, leading, title, meta, actions }: PaneHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        flexShrink: 0,
        minHeight: 32,
        px: '10px',
        borderBottom: `1px solid ${border.base}`,
        backgroundColor: surface.subtle,
      }}
    >
      {leading}

      {Icon ? <Icon sx={{ fontSize: 15, color: text.secondary }} /> : null}

      <Box
        component="h2"
        sx={{
          m: 0,
          fontSize: typeScale.sectionTitle,
          fontWeight: 600,
          color: text.primary,
          lineHeight: 1.2,
        }}
      >
        {title}
      </Box>

      {meta ? (
        <Box component="span" sx={{ fontSize: typeScale.meta, color: text.secondary }}>
          {meta}
        </Box>
      ) : null}

      {actions ? <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>{actions}</Box> : null}
    </Box>
  );
}
