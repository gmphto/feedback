import { Box } from '@mui/material';
import * as React from 'react';

import { chrome, text, typeScale } from '../../../../../shared/ui/editor/tokens';

interface EditorHeaderProps {
  /** Editable screen title, e.g. the plan name. */
  title: string;
  /** Status badge or other inline marker shown before the title. */
  status?: React.ReactNode;
  /** Breadcrumb context, e.g. "Plans". */
  context?: string;
  /** Right-aligned summary controls, e.g. the split/remove actions. */
  actions?: React.ReactNode;
}

/**
 * The editor's own title bar. It sits on the primary dark chrome and carries the
 * screen title, an inline status marker and a small set of summary actions.
 */
export function EditorHeader({ title, status, context, actions }: EditorHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0,
        height: 44,
        px: '12px',
        backgroundColor: chrome.base,
        color: text.onChrome,
      }}
    >
      {context ? (
        <>
          <Box
            component="span"
            sx={{ fontSize: typeScale.body, color: text.onChromeMuted, whiteSpace: 'nowrap' }}
          >
            {context}
          </Box>
          <Box component="span" aria-hidden="true" sx={{ color: text.onChromeMuted }}>
            /
          </Box>
        </>
      ) : null}

      {status}

      <Box
        component="h1"
        sx={{
          m: 0,
          fontSize: typeScale.screenTitle,
          fontWeight: 600,
          color: text.onChrome,
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </Box>

      {actions ? (
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>{actions}</Box>
      ) : null}
    </Box>
  );
}
