import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';
import { alpha, useTheme } from '@mui/material/styles';
import { Link, useLocation } from 'react-router-dom';

import { LogoutButton } from '../../features/auth/components/LogoutButton';
import { topBarHeight } from './layout';
import type { NavigationDestination } from './navigation';
import { isDestinationSelected } from './navigation';

/**
 * The horizontal navigation bar. It renders the destinations declared in
 * `navigation.ts` — the same source of truth as the rail — and derives the
 * active item from the matched route ids its caller passes in. It stores no
 * route knowledge of its own.
 *
 * The 768px collapse is CSS-only: the desktop list, the hamburger button and
 * the mobile panel are always in the DOM, and a single media query decides
 * which of them is visible. That keeps the component server-renderable and
 * avoids a JS breakpoint library.
 */

const mobileMenuId = 'main-navigation-mobile-menu';

interface NavBarProps {
  productName: string;
  destinations: NavigationDestination[];
  matchedRouteIds: string[];
}

export function NavBar({
  productName,
  destinations,
  matchedRouteIds,
}: NavBarProps) {
  const theme = useTheme();
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const mobileToggleRef = React.useRef<HTMLButtonElement>(null);
  const primaryDestinations = destinations.filter(
    (destination) => destination.group === 'primary',
  );
  const footerDestinations = destinations.filter(
    (destination) => destination.group === 'footer',
  );

  // A navigation from the mobile menu (or any in-app navigation) closes it.
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const closeMobileMenuAndFocusToggle = React.useCallback(() => {
    setMobileMenuOpen(false);
    mobileToggleRef.current?.focus();
  }, []);

  const handleNavKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        event.stopPropagation();
        closeMobileMenuAndFocusToggle();
      }
    },
    [isMobileMenuOpen, closeMobileMenuAndFocusToggle],
  );

  const renderDestination = (destination: NavigationDestination) => {
    const isSelected = isDestinationSelected(destination, matchedRouteIds);
    const hasNoPage = destination.paths === null;
    const linkPath = destination.paths?.[0];

    return (
      <Box component="li" key={destination.id} sx={{ display: 'flex' }}>
        {hasNoPage || linkPath === undefined ? (
          <Box
            aria-disabled="true"
            component="span"
            sx={navItemSx(theme, { isDisabled: true })}
          >
            {destination.label}
          </Box>
        ) : (
          <Box
            aria-current={isSelected ? 'page' : undefined}
            component={Link}
            onClick={() => setMobileMenuOpen(false)}
            to={linkPath}
            sx={navItemSx(theme, { isSelected })}
          >
            {destination.label}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box
      component="nav"
      aria-label="Main navigation"
      onKeyDown={handleNavKeyDown}
      sx={{
        flexShrink: 0,
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Mobile bar: hamburger + product name. Hidden at >= 768px. */}
      <Stack
        direction="row"
        sx={{
          height: topBarHeight,
          px: 2,
          gap: 1,
          alignItems: 'center',
          [theme.breakpoints.up('md')]: { display: 'none' },
        }}
      >
        <Box
          aria-controls={mobileMenuId}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle navigation menu"
          component="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          ref={mobileToggleRef}
          sx={hamburgerSx(theme)}
        >
          <HamburgerIcon />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {productName}
        </Typography>
      </Stack>

      {/* Mobile collapsible panel. Hidden at >= 768px. */}
      <Box
        id={mobileMenuId}
        sx={{
          display: isMobileMenuOpen ? 'block' : 'none',
          py: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          [theme.breakpoints.up('md')]: { display: 'none !important' },
        }}
      >
        <Box component="ul" sx={menuListSx}>
          {primaryDestinations.map(renderDestination)}
        </Box>
        <Box
          component="ul"
          sx={{ ...menuListSx, borderTop: '1px solid', borderColor: 'divider' }}
        >
          {footerDestinations.map(renderDestination)}
          <Box component="li" sx={{ display: 'flex' }}>
            <Box sx={navItemSx(theme, {})}>
              <LogoutButton />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Desktop bar. Hidden below 768px. */}
      <Stack
        direction="row"
        sx={{
          height: topBarHeight,
          px: 2,
          gap: 1,
          alignItems: 'center',
          [theme.breakpoints.down('md')]: { display: 'none' },
        }}
      >
        <Box component="ul" sx={{ ...menuListSx, flexGrow: 1 }}>
          {primaryDestinations.map(renderDestination)}
        </Box>
        <Box component="ul" sx={menuListSx}>
          {footerDestinations.map(renderDestination)}
          <Box component="li" sx={{ display: 'flex' }}>
            <LogoutButton />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}

type NavItemState = {
  isSelected?: boolean;
  isDisabled?: boolean;
};

function navItemSx(
  theme: Theme,
  { isSelected = false, isDisabled = false }: NavItemState,
) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    px: 1.5,
    py: 0.75,
    borderRadius: 1,
    textDecoration: 'none',
    cursor: isDisabled ? 'default' : 'pointer',
    color: isDisabled ? 'text.secondary' : 'text.primary',
    fontWeight: isSelected || isDisabled ? 400 : 500,
    backgroundColor: isSelected
      ? (t: Theme) => alpha(t.palette.primary.main, 0.12)
      : 'transparent',
    ...(isSelected && { color: 'primary.main', fontWeight: 600 }),
    '&:hover': isDisabled ? undefined : { backgroundColor: 'action.hover' },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
  };
}

const menuListSx = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 0.5,
  m: 0,
  p: 0,
  listStyle: 'none',
};

function hamburgerSx(theme: Theme) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    p: 0,
    border: 0,
    borderRadius: 1,
    backgroundColor: 'transparent',
    color: 'text.primary',
    cursor: 'pointer',
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
  };
}

function HamburgerIcon() {
  return (
    <Box
      aria-hidden="true"
      component="span"
      sx={{
        display: 'block',
        width: 20,
        height: 2,
        backgroundColor: 'currentColor',
        boxShadow: '0 6px 0 currentColor, 0 -6px 0 currentColor',
      }}
    />
  );
}
