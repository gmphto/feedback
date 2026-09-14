import { Box } from '@mui/material';
import * as React from 'react';

import { border, density, text, typeScale } from './tokens';

/** Shared style for the compact input/select/textarea controls. */
export const controlSx = {
  width: '100%',
  height: density.inputHeight,
  boxSizing: 'border-box',
  px: '6px',
  border: `1px solid ${border.base}`,
  borderRadius: `${density.controlRadius}px`,
  backgroundColor: '#fff',
  color: text.primary,
  fontSize: typeScale.body,
  fontFamily: 'inherit',
  outline: 'none',
  '&:focus': {
    borderColor: text.secondary,
    boxShadow: '0 0 0 1px rgba(68, 81, 87, 0.35)',
  },
  '&:disabled': {
    color: text.disabled,
    backgroundColor: '#fff',
  },
  '&::placeholder': {
    color: text.disabled,
    fontStyle: 'italic',
  },
};

const fieldLabelSx = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '3px',
  fontSize: typeScale.fieldLabel,
  fontWeight: 600,
  color: text.secondary,
  lineHeight: 1.2,
};

interface FieldProps {
  label: string;
  /** Renders a red asterisk after the label. */
  required?: boolean;
  htmlFor?: string;
  /** Optional validation message shown below the control. */
  error?: string;
  /** Field width; width should reflect the expected content, not the row. */
  width?: number | string;
  children: React.ReactNode;
}

/**
 * A labelled field. The label sits above the control and the field sizes to its
 * content rather than stretching, so related values stay on one explicit row.
 */
export function Field({
  label,
  required = false,
  htmlFor,
  error,
  width,
  children,
}: FieldProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
        width,
        minWidth: 0,
      }}
    >
      <Box component="label" htmlFor={htmlFor} sx={fieldLabelSx}>
        {label}
        {required ? (
          <Box component="span" sx={{ color: '#C0392B', fontWeight: 700 }} aria-hidden="true">
            *
          </Box>
        ) : null}
      </Box>

      {children}

      {error ? (
        <Box component="span" sx={{ fontSize: typeScale.meta, color: '#C0392B' }}>
          {error}
        </Box>
      ) : null}
    </Box>
  );
}

interface FormRowProps {
  children: React.ReactNode;
  /** Wraps controls onto the next line instead of shrinking them. */
  wrap?: boolean;
}

/** A horizontal row of labelled fields. */
export function FormRow({ children, wrap = true }: FormRowProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        flexWrap: wrap ? 'wrap' : 'nowrap',
        columnGap: `${density.fieldGapX}px`,
        rowGap: `${density.fieldGapY}px`,
      }}
    >
      {children}
    </Box>
  );
}

interface FormGridProps {
  /** CSS grid columns, e.g. "1fr 1fr" for two fields per row. */
  columns?: string;
  children: React.ReactNode;
}

/** A grid-based inline form. Prefer this over stacked vertical forms. */
export function FormGrid({ columns = 'repeat(3, minmax(140px, 1fr))', children }: FormGridProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: columns,
        columnGap: `${density.fieldGapX}px`,
        rowGap: `${density.fieldGapY}px`,
        alignItems: 'start',
      }}
    >
      {children}
    </Box>
  );
}
