import { Box } from '@mui/material';

import { NavBar } from './NavBar';
import { navigationDestinations } from './navigation';

interface AppShellProps {
  productName: string;
  user: unknown;
  matchedRouteIds: string[];
  children: React.ReactNode;
}

/**
 * The application frame: navigation bar and content area.
 *
 * The shell reads no router state itself. Its caller passes the current matched
 * route ids in, which keeps the navigation selection rule in one place and the
 * shell renderable on its own.
 */
export function AppShell({
  productName,
  matchedRouteIds,
  children,
}: AppShellProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <NavBar
        productName={productName}
        destinations={navigationDestinations}
        matchedRouteIds={matchedRouteIds}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: 3,
          py: 3,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
