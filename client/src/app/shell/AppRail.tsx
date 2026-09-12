import { Box, Drawer, List, ListItemButton, Tooltip, Typography } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { Link } from 'react-router-dom';

import { railWidth, topBarHeight } from './layout';
import type { NavigationDestination } from './navigation';
import { isDestinationSelected } from './navigation';

/** Collapsed rail item. The rail is 56 px wide with 8 px inset, so an item is 40 px. */
const railItemSize = 40;

interface AppRailProps {
  brandLabel: string;
  destinations: NavigationDestination[];
  matchedRouteIds: string[];
}

export function AppRail({
  brandLabel,
  destinations,
  matchedRouteIds,
}: AppRailProps) {
  const primaryDestinations = destinations.filter(
    (destination) => destination.group === 'primary',
  );
  const footerDestinations = destinations.filter(
    (destination) => destination.group === 'footer',
  );

  const renderDestination = (destination: NavigationDestination) => {
    const isSelected = isDestinationSelected(destination, matchedRouteIds);
    const hasNoPage = destination.paths === null;
    const linkPath = destination.paths?.[0];

    return (
      <Tooltip
        key={destination.id}
        title={hasNoPage ? `${destination.label} — no page yet` : destination.label}
        placement="right"
      >
        {hasNoPage ? (
          // A disabled button emits no pointer events, so the tooltip needs an
          // enabled wrapper.
          <Box sx={{ display: 'flex' }}>
            <RailItem
              label={destination.label}
              Icon={destination.Icon}
              isSelected={false}
              isDisabled
            />
          </Box>
        ) : (
          <RailItem
            label={destination.label}
            Icon={destination.Icon}
            isSelected={isSelected}
            to={linkPath}
          />
        )}
      </Tooltip>
    );
  };

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: railWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          position: 'relative',
          width: railWidth,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          border: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundImage: 'none',
          boxShadow: 'none',
        },
      }}
    >

      <Box
        aria-label={brandLabel}
        title={brandLabel}
        sx={{
          height: topBarHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {brandLabel}
        </Typography>
      </Box>

      <Box
        component="nav"
        aria-label="Main"
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, p: 1 }}>
          {primaryDestinations.map(renderDestination)}
        </List>

        <List
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.25,
            p: 1,
            mt: 'auto',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          {footerDestinations.map(renderDestination)}
        </List>
      </Box>
    </Drawer>
  );
}

interface RailItemProps {
  label: string;
  Icon: NavigationDestination['Icon'];
  isSelected: boolean;
  isDisabled?: boolean;
  to?: string;
}

/**
 * One rail entry. An available destination is a router link, so the rail uses the
 * router's own URL handling; a destination without a page is a disabled button.
 */
function RailItem({ label, Icon, isSelected, isDisabled = false, to }: RailItemProps) {
  const itemSx = {
    height: railItemSize,
    minHeight: railItemSize,
    px: 0,
    borderRadius: 1,
    color: 'text.secondary',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 8,
      bottom: 8,
      width: 2,
      borderRadius: '0 2px 2px 0',
      backgroundColor: 'primary.main',
      opacity: 0,
    },
    '&.Mui-selected': {
      color: 'primary.main',
      backgroundColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.12),
    },
    '&.Mui-selected:hover': {
      backgroundColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.18),
    },
    '&.Mui-selected::before': {
      opacity: 1,
    },
  };

  if (to === undefined) {
    return (
      <ListItemButton
        disabled={isDisabled}
        aria-label={label}
        selected={isSelected}
        sx={itemSx}
      >
        <Icon fontSize="small" />
      </ListItemButton>
    );
  }

  return (
    <ListItemButton
      component={Link}
      to={to}
      aria-label={label}
      aria-current={isSelected ? 'page' : undefined}
      selected={isSelected}
      sx={itemSx}
    >
      <Icon fontSize="small" />
    </ListItemButton>
  );
}
