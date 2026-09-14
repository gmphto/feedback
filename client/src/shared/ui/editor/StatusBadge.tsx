import { Box } from '@mui/material';
import * as React from 'react';

import { accent, typeScale } from './tokens';

export type StatusTone = 'draft' | 'published' | 'warning' | 'error';

const toneColor: Record<StatusTone, string> = {
  draft: accent.blue,
  published: accent.green,
  warning: accent.amber,
  error: accent.red,
};

const toneBackground: Record<StatusTone, string> = {
  draft: '#EAF3FE',
  published: '#EAF3E2',
  warning: '#FFF7E6',
  error: '#FFF1ED',
};

interface StatusBadgeProps {
  tone: StatusTone;
  children: React.ReactNode;
}

/**
 * A small inline status badge. It sits before an entity title and must not
 * dominate the page, so it never fills a large area.
 */
export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 18,
        px: '6px',
        borderRadius: '2px',
        fontSize: typeScale.meta,
        fontWeight: 600,
        lineHeight: 1,
        color: toneColor[tone],
        backgroundColor: toneBackground[tone],
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Box>
  );
}
