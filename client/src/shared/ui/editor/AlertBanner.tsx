import { WarningAmber } from '@mui/icons-material';
import { Box } from '@mui/material';
import * as React from 'react';

import { accent, typeScale } from './tokens';

export type AlertTone = 'warning' | 'error' | 'info';

const toneSx = {
  warning: { color: accent.amber, background: '#FFF7E6', border: '#F2D9A8' },
  error: { color: accent.red, background: '#FFF1ED', border: '#F3C9BE' },
  info: { color: accent.blue, background: '#EAF3FE', border: '#C3DCF8' },
} as const;

interface AlertBannerProps {
  tone?: AlertTone;
  children: React.ReactNode;
  /** Optional trailing control, e.g. a dismiss or resolve action. */
  action?: React.ReactNode;
}

/**
 * A compact inline alert spanning its pane. It uses a pale semantic background,
 * a small icon and a single row where possible; persistent domain-state
 * warnings belong here, not in a modal dialog.
 */
export function AlertBanner({ tone = 'warning', children, action }: AlertBannerProps) {
  const palette = toneSx[tone];

  return (
    <Box
      role="status"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        minHeight: 28,
        px: '8px',
        py: '4px',
        border: `1px solid ${palette.border}`,
        borderRadius: '2px',
        backgroundColor: palette.background,
        color: palette.color,
        fontSize: typeScale.body,
        lineHeight: 1.35,
      }}
    >
      <WarningAmber sx={{ fontSize: 15, flexShrink: 0 }} />
      <Box sx={{ minWidth: 0 }}>{children}</Box>
      {action ? <Box sx={{ ml: 'auto', display: 'flex' }}>{action}</Box> : null}
    </Box>
  );
}
