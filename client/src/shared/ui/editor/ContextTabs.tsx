import { Box } from '@mui/material';
import * as React from 'react';

import { accent, border, text, typeScale } from './tokens';

export interface TabItem<T extends string> {
  value: T;
  label: string;
  Icon?: React.ElementType;
}

interface ContextTabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /**
   * `primary` is the main contextual level (PRODUCTS | CROPPING | ...);
   * `secondary` is the weaker per-view level (LIST | MAP).
   */
  variant?: 'primary' | 'secondary';
  'aria-label'?: string;
}

/**
 * Two levels of tabs share one component. The active tab gets a short accent
 * underline rather than a pill, and the secondary level is visually weaker.
 */
export function ContextTabs<T extends string>({
  items,
  value,
  onChange,
  variant = 'primary',
  'aria-label': ariaLabel,
}: ContextTabsProps<T>) {
  const isSecondary = variant === 'secondary';

  return (
    <Box
      role="tablist"
      aria-label={ariaLabel}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        gap: isSecondary ? '2px' : '10px',
        borderBottom: isSecondary ? 'none' : `1px solid ${border.base}`,
        px: isSecondary ? 0 : '2px',
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
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.value)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              position: 'relative',
              height: isSecondary ? 26 : 30,
              px: isSecondary ? '7px' : '4px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: isSecondary ? typeScale.meta : typeScale.body,
              fontWeight: 600,
              letterSpacing: isSecondary ? '0.03em' : '0.05em',
              textTransform: 'uppercase',
              color: isActive ? text.primary : text.secondary,
              '&::after': isActive
                ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: -1,
                    height: isSecondary ? 1 : 2,
                    backgroundColor: isSecondary ? text.secondary : accent.orange,
                  }
                : undefined,
              '&:hover': { color: text.primary },
            }}
          >
            {Icon ? <Icon sx={{ fontSize: 13 }} /> : null}
            {item.label}
          </Box>
        );
      })}
    </Box>
  );
}
