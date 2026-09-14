import { Box } from '@mui/material';
import * as React from 'react';

import { topBarHeight } from '../../../../../app/shell/layout';
import { EditorPaneSplit } from '../../../../../shared/ui/editor/EditorPaneSplit';
import { chrome, fontFamily, surface } from '../../../../../shared/ui/editor/tokens';
import { EditorHeader } from './EditorHeader';

interface EditorShellProps {
  title: string;
  status?: React.ReactNode;
  /** Right-aligned summary actions in the editor header. */
  headerActions?: React.ReactNode;
  moduleNav: React.ReactNode;
  /** Primary task/editor pane. */
  primary: React.ReactNode;
  /** Supporting context/selection pane. */
  secondary?: React.ReactNode;
  isSecondaryVisible?: boolean;
}

/**
 * The editor screen frame: fixed dark header, module navigation below it, then
 * the two-pane workspace split. It lays out the screen only; panes own their
 * own headers, content and bottom actions.
 */
export function EditorShell({
  title,
  status,
  headerActions,
  moduleNav,
  primary,
  secondary,
  isSecondaryVisible = true,
}: EditorShellProps) {
  return (
    <Box
      aria-label="Plan editor"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        // The editor is rendered inside the shell's padded main area. Anchoring
        // it below the global navigation makes it a fixed, full-height screen
        // with its own internally scrolling panes.
        height: `calc(100vh - ${topBarHeight}px)`,
        minHeight: 0,
        mx: '-24px',
        mt: '-24px',
        mb: '-24px',
        fontFamily,
        backgroundColor: chrome.base,
      }}
    >
      <EditorHeader title={title} status={status} context="Plans" actions={headerActions} />

      {moduleNav}

      <Box sx={{ display: 'flex', flexGrow: 1, minHeight: 0, backgroundColor: surface.workspace }}>
        <EditorPaneSplit
          primary={primary}
          secondary={secondary}
          isSecondaryVisible={isSecondaryVisible}
        />
      </Box>
    </Box>
  );
}
