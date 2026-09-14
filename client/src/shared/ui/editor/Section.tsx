import { ExpandMore } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import * as React from 'react';

import { accent, density, text, typeScale } from './tokens';

interface AccentUnderlineProps {
  /** Fraction of the section width the rule spans. Kept short on purpose. */
  width?: number | string;
}

/** Short orange rule under a section title. */
export function AccentUnderline({ width = 56 }: AccentUnderlineProps) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        height: 2,
        width,
        backgroundColor: accent.orange,
        mt: '4px',
      }}
    />
  );
}

interface SectionHeaderProps {
  /** Small monochrome domain icon shown directly beside the title. */
  Icon?: React.ElementType;
  title: string;
  /** Optional control rendered at the right edge, e.g. a status tick. */
  trailing?: React.ReactNode;
  /** Renders the collapse affordance; the section owns the expanded state. */
  collapsible?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}

export function SectionHeader({
  Icon,
  title,
  trailing,
  collapsible = false,
  expanded = true,
  onToggle,
}: SectionHeaderProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minHeight: 20 }}>
        {Icon ? <Icon sx={{ fontSize: 15, color: text.secondary }} /> : null}

        <Box
          component="h3"
          sx={{
            m: 0,
            fontSize: typeScale.sectionTitle,
            fontWeight: 600,
            color: text.primary,
            lineHeight: 1.2,
          }}
        >
          {title}
        </Box>

        {collapsible ? (
          <IconButton
            size="small"
            aria-label={expanded ? `Collapse ${title}` : `Expand ${title}`}
            aria-expanded={expanded}
            onClick={onToggle}
            sx={{
              width: 20,
              height: 20,
              p: 0,
              color: text.secondary,
              borderRadius: `${density.controlRadius}px`,
            }}
          >
            <ExpandMore
              sx={{
                fontSize: 16,
                transform: expanded ? 'none' : 'rotate(-90deg)',
                transition: 'transform 120ms ease',
              }}
            />
          </IconButton>
        ) : null}

        {trailing ? <Box sx={{ ml: 'auto', display: 'flex' }}>{trailing}</Box> : null}
      </Box>

      <AccentUnderline />
    </Box>
  );
}

interface SectionProps {
  Icon?: React.ElementType;
  title: string;
  trailing?: React.ReactNode;
  /** When true the header gets a collapse control and content can hide. */
  collapsible?: boolean;
  children?: React.ReactNode;
}

/**
 * The repeated editor section: header (icon, title, optional collapse control),
 * a short orange underline, then borderless content separated by whitespace.
 */
export function Section({
  Icon,
  title,
  trailing,
  collapsible = false,
  children,
}: SectionProps) {
  const [expanded, setExpanded] = React.useState(true);

  return (
    <Box
      component="section"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <SectionHeader
        Icon={Icon}
        title={title}
        trailing={trailing}
        collapsible={collapsible}
        expanded={expanded}
        onToggle={() => setExpanded((open) => !open)}
      />

      {expanded ? <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>{children}</Box> : null}
    </Box>
  );
}
