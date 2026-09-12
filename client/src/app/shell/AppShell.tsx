import { Box } from '@mui/material';

import type { User } from '../../features/auth/authResponses';
import { AppRail } from './AppRail';
import { AppTopBar } from './AppTopBar';
import { navigationDestinations } from './navigation';

interface AppShellProps {
  productName: string;
  pageLabel: string;
  user: User;
  matchedRouteIds: string[];
  children: React.ReactNode;
}

/**
 * The application frame: icon rail, top bar and content area.
 *
 * The shell reads no router state itself. Its caller passes the current matched
 * path in, which keeps the rail's selection rule in one place and the shell
 * renderable on its own.
 */
export function AppShell({
  productName,
  pageLabel,
  matchedRouteIds,
  children,
}: AppShellProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <AppRail
        brandLabel={productName}
        destinations={navigationDestinations}
        matchedRouteIds={matchedRouteIds}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        <AppTopBar pageLabel={pageLabel} />

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
    </Box>
  );
}
