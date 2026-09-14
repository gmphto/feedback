import { Box } from '@mui/material';
import * as React from 'react';

import { border, surface } from './tokens';

interface EditorPaneSplitProps {
  /** Primary task/editor pane. */
  primary: React.ReactNode;
  /** Supporting context/selection pane. */
  secondary?: React.ReactNode;
  /** Initial primary pane width in pixels. */
  defaultPrimaryWidth?: number;
  /** Lower bound while dragging. */
  minPrimaryWidth?: number;
  /** Upper bound while dragging. */
  maxPrimaryWidth?: number;
  /** Fixed primary pane: no divider is rendered. */
  isSecondaryVisible?: boolean;
  'aria-label'?: string;
}

/**
 * Two-pane workspace split with a thin resizable divider. The divider is a
 * keyboard-operable separator (arrow keys move it) so resizing does not depend
 * on pointer precision.
 */
export function EditorPaneSplit({
  primary,
  secondary,
  defaultPrimaryWidth = 640,
  minPrimaryWidth = 400,
  maxPrimaryWidth = 1200,
  isSecondaryVisible = true,
  'aria-label': ariaLabel = 'Editor workspace split',
}: EditorPaneSplitProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [primaryWidth, setPrimaryWidth] = React.useState(defaultPrimaryWidth);
  const [isDragging, setIsDragging] = React.useState(false);

  const clamp = React.useCallback(
    (width: number) => Math.min(maxPrimaryWidth, Math.max(minPrimaryWidth, width)),
    [maxPrimaryWidth, minPrimaryWidth],
  );

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      setIsDragging(true);

      const move = (clientX: number) => setPrimaryWidth(clamp(clientX - containerRect.left));
      const onPointerMove = (moveEvent: PointerEvent) => move(moveEvent.clientX);
      const onPointerUp = () => {
        setIsDragging(false);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    },
    [clamp],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setPrimaryWidth((width) => clamp(width - 24));
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setPrimaryWidth((width) => clamp(width + 24));
      }
    },
    [clamp],
  );

  return (
    <Box
      ref={containerRef}
      aria-label={ariaLabel}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        flexGrow: 1,
        minHeight: 0,
        backgroundColor: surface.workspace,
      }}
    >
      <Box
        sx={{
          width: isSecondaryVisible ? primaryWidth : '100%',
          flexShrink: 0,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: surface.workspace,
        }}
      >
        {primary}
      </Box>

      {isSecondaryVisible ? (
        <>
          <Box
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize panes"
            aria-valuenow={primaryWidth}
            aria-valuemin={minPrimaryWidth}
            aria-valuemax={maxPrimaryWidth}
            tabIndex={0}
            onPointerDown={handlePointerDown}
            onKeyDown={handleKeyDown}
            sx={{
              width: 7,
              flexShrink: 0,
              cursor: 'col-resize',
              position: 'relative',
              backgroundColor: surface.workspace,
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '3px',
                width: '1px',
                backgroundColor: isDragging ? '#445157' : border.base,
              },
              '&:hover::after': { backgroundColor: '#445157' },
              '&:focus-visible': { outline: `2px solid #445157`, outlineOffset: '0px' },
            }}
          />

          <Box
            sx={{
              flexGrow: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              borderLeft: `1px solid ${border.base}`,
              backgroundColor: surface.workspace,
            }}
          >
            {secondary}
          </Box>
        </>
      ) : null}
    </Box>
  );
}
