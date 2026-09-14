import { Box } from '@mui/material';
import * as React from 'react';

import { border, density, surface } from '../../../../../shared/ui/editor/tokens';

interface EditorPaneProps {
  header?: React.ReactNode;
  /** Fixed bottom actions owned by the pane boundary. */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * A white, thinly bordered pane. Header and footer stay visually separate from
 * the scrolling body, and the pane boundary — not individual sections — owns
 * the bottom actions.
 */
export function EditorPane({ header, footer, children }: EditorPaneProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
        backgroundColor: surface.workspace,
      }}
    >
      {header}

      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: `${density.pagePadding}px`,
          py: `${density.pagePadding}px`,
        }}
      >
        {children}
      </Box>

      {footer ? (
        <Box
          component="footer"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
            minHeight: 44,
            px: `${density.pagePadding}px`,
            py: '7px',
            borderTop: `1px solid ${border.base}`,
            backgroundColor: surface.workspace,
          }}
        >
          {footer}
        </Box>
      ) : null}
    </Box>
  );
}
