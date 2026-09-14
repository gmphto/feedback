import { Box } from '@mui/material';
import * as React from 'react';

import { chrome, text, typeScale } from '../../../../../shared/ui/editor/tokens';

interface EditorModuleNavItem<T extends string> {
  value: T;
  label: string;
  Icon?: React.ElementType;
}

interface EditorModuleNavProps<T extends string> {
  items: EditorModuleNavItem<T>[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * Module navigation sits below the global header, on the secondary dark chrome.
 * Items are compact uppercase labels; the active module gets an orange rule,
 * which is one of the screen's few structural accents.
 */
export function EditorModuleNav<T extends string>({
  items,
  value,
  onChange,
}: EditorModuleNavProps<T>) {
  return (
    <Box
      component="nav"
      aria-label="Modules"
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        gap: '16px',
        flexShrink: 0,
        height: 40,
        px: '12px',
        backgroundColor: chrome.secondary,
      }}
    >
      {items.map((item) => {
        const isActive = item.value === value;
        const Icon = item.Icon;

        return (
          <Box
            key={item.value}
            component="button"
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange(item.value)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              position: 'relative',
              height: '100%',
              px: 0,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: typeScale.nav,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: isActive ? text.onChrome : text.onChromeMuted,
              '&::after': isActive
                ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 2,
                    backgroundColor: '#E8791F',
                  }
                : undefined,
              '&:hover': { color: text.onChrome },
            }}
          >
            {Icon ? <Icon sx={{ fontSize: 14 }} /> : null}
            {item.label}
          </Box>
        );
      })}
    </Box>
  );
}
