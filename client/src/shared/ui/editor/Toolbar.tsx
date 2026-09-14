import { Search } from '@mui/icons-material';
import { Box } from '@mui/material';
import * as React from 'react';

import { border, density, surface, text, typeScale } from './tokens';

interface ToolbarProps {
  /** Search/filter text; the input consumes the spare width. */
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterPlaceholder?: string;
  /** Secondary configuration controls aligned right. */
  children?: React.ReactNode;
}

/**
 * A toolbar sits directly above the content it affects. The filter consumes
 * spare width and secondary controls align right; no oversized controls.
 */
export function Toolbar({
  filterValue = '',
  onFilterChange,
  filterPlaceholder = 'Filter',
  children,
}: ToolbarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexShrink: 0,
        minHeight: density.toolbarHeight,
        px: '10px',
        borderBottom: `1px solid ${border.base}`,
        backgroundColor: surface.workspace,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          flexGrow: 1,
          minWidth: 120,
          height: density.inputHeight,
          px: '6px',
          border: `1px solid ${border.base}`,
          borderRadius: `${density.controlRadius}px`,
          backgroundColor: '#fff',
        }}
      >
        <Search sx={{ fontSize: 14, color: text.disabled, flexShrink: 0 }} />
        <Box
          component="input"
          value={filterValue}
          placeholder={filterPlaceholder}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onFilterChange?.(event.currentTarget.value)
          }
          sx={{
            width: '100%',
            minWidth: 0,
            border: 'none',
            outline: 'none',
            background: 'none',
            fontSize: typeScale.body,
            color: text.primary,
            fontFamily: 'inherit',
            '&::placeholder': { color: text.disabled },
          }}
        />
      </Box>

      {children ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {children}
        </Box>
      ) : null}
    </Box>
  );
}
