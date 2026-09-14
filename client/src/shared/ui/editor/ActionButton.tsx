import { Box } from '@mui/material';
import * as React from 'react';

import { accent, border, chrome, density, text, typeScale } from './tokens';

export type ActionTone = 'secondary' | 'primary' | 'destructive';

interface ActionButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Visual role. Primary is a small solid dark control; the rest are quiet. */
  tone?: ActionTone;
  /** Small monochrome icon shown before the label. */
  Icon?: React.ElementType;
  children: React.ReactNode;
}

const toneSx = {
  secondary: {
    backgroundColor: 'transparent',
    color: text.secondary,
    border: `1px solid ${border.base}`,
    '&:hover:not(:disabled)': {
      backgroundColor: '#F5F7F9',
      color: text.primary,
    },
  },
  primary: {
    backgroundColor: chrome.base,
    color: text.onChrome,
    border: `1px solid ${chrome.base}`,
    '&:hover:not(:disabled)': { backgroundColor: chrome.secondary },
  },
  destructive: {
    backgroundColor: 'transparent',
    color: accent.red,
    border: `1px solid ${border.base}`,
    '&:hover:not(:disabled)': {
      backgroundColor: '#FFF1ED',
      borderColor: accent.red,
    },
  },
} as const;

/**
 * A compact rectangular action. Buttons are subdued: no large radius, no
 * elevation, and the destructive variant is text/icon led rather than a large
 * filled red control.
 */
export function ActionButton({
  tone = 'secondary',
  Icon,
  children,
  disabled,
  ...props
}: ActionButtonProps) {
  return (
    <Box
      component="button"
      type="button"
      disabled={disabled}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        height: density.inputHeight,
        px: '9px',
        borderRadius: `${density.controlRadius}px`,
        fontSize: typeScale.meta,
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        cursor: disabled ? 'default' : 'pointer',
        ...toneSx[tone],
        '&:disabled': {
          color: text.disabled,
          borderColor: border.base,
          backgroundColor: 'transparent',
        },
      }}
      {...props}
    >
      {Icon ? <Icon sx={{ fontSize: 14 }} /> : null}
      {children}
    </Box>
  );
}
