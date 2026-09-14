import { Box } from '@mui/material';
import * as React from 'react';

import { accent, border, density, surface, text, typeScale } from './tokens';

export interface DataGridColumn {
  key: string;
  label: string;
  /** Numeric columns align right and use tabular figures. */
  align?: 'left' | 'right';
  width?: number | string;
}

interface DataGridProps {
  columns: DataGridColumn[];
  children: React.ReactNode;
  'aria-label'?: string;
}

/**
 * A lightweight data grid: thin horizontal separators, no vertical grid lines,
 * a white header and right-aligned numeric columns.
 */
export function DataGrid({ columns, children, 'aria-label': ariaLabel }: DataGridProps) {
  return (
    <Box
      role="grid"
      aria-label={ariaLabel}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        fontSize: typeScale.body,
      }}
    >
      <Box
        role="row"
        sx={{
          display: 'grid',
          gridTemplateColumns: gridTemplate(columns),
          columnGap: '10px',
          alignItems: 'center',
          minHeight: 24,
          borderBottom: `1px solid ${border.base}`,
          backgroundColor: surface.workspace,
        }}
      >
        {columns.map((column) => (
          <Box
            key={column.key}
            role="columnheader"
            sx={{
              fontSize: typeScale.fieldLabel,
              fontWeight: 600,
              color: text.secondary,
              textAlign: column.align === 'right' ? 'right' : 'left',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {column.label}
          </Box>
        ))}
      </Box>

      {children}
    </Box>
  );
}

interface DataGridRowProps {
  columns: DataGridColumn[];
  children: React.ReactNode;
  /** Group rows get a subtle background and sit above their child records. */
  isGroup?: boolean;
  selected?: boolean;
}

export function DataGridRow({
  columns,
  children,
  isGroup = false,
  selected = false,
}: DataGridRowProps) {
  return (
    <Box
      role="row"
      sx={{
        display: 'grid',
        gridTemplateColumns: gridTemplate(columns),
        columnGap: '10px',
        alignItems: 'center',
        minHeight: isGroup ? density.rowHeight : density.gridRowHeight,
        borderBottom: `1px solid ${border.base}`,
        backgroundColor: isGroup ? surface.subtle : surface.workspace,
        fontWeight: isGroup ? 600 : 400,
        '&:hover': { backgroundColor: selected ? undefined : '#FAFBFC' },
      }}
    >
      {children}
    </Box>
  );
}

interface DataGridCellProps {
  children?: React.ReactNode;
  align?: 'left' | 'right';
  /** Indentation for hierarchy, in pixels. */
  indent?: number;
  /** Renders a small round domain marker before the cell content. */
  markerColor?: string;
  /** A leading checkbox/selection control, rendered outside the marker slot. */
  leading?: React.ReactNode;
  /** Selection/confirmed state shown as a trailing green tick. */
  confirmed?: boolean;
}

export function DataGridCell({
  children,
  align = 'left',
  indent = 0,
  markerColor,
  leading,
  confirmed = false,
}: DataGridCellProps) {
  return (
    <Box
      role="gridcell"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        minWidth: 0,
        pl: leading ? 0 : `${indent}px`,
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
        fontVariantNumeric: align === 'right' ? 'tabular-nums' : undefined,
        color: text.primary,
        overflow: 'hidden',
      }}
    >
      {leading}
      {markerColor ? (
        <Box
          aria-hidden="true"
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: markerColor,
            flexShrink: 0,
          }}
        />
      ) : null}
      <Box
        sx={{
          minWidth: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {children}
      </Box>
      {confirmed ? (
        <Box
          component="span"
          aria-label="Confirmed"
          sx={{ color: accent.green, fontSize: 12, fontWeight: 700, flexShrink: 0 }}
        >
          ✓
        </Box>
      ) : null}
    </Box>
  );
}

/** First column flexes; the remaining columns hold their declared width. */
function gridTemplate(columns: DataGridColumn[]): string {
  return columns
    .map((column, index) => {
      if (column.width !== undefined) {
        return typeof column.width === 'number' ? `${column.width}px` : column.width;
      }

      return index === 0 ? 'minmax(0, 1fr)' : 'minmax(0, max-content)';
    })
    .join(' ');
}
