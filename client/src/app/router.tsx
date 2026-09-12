import {
  Outlet,
  createBrowserHistory,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  useRouterState,
} from '@tanstack/react-router';

import { ProjectIndex } from '../projects/ProjectIndex';
import { useAuth } from '../auth/contexts/AuthProvider';
import { AppShell } from './shell/AppShell';
import { productName } from './shell/layout';
import { findSelectedDestination, navigationRoutePaths } from './shell/navigation';

const rootRoute = createRootRoute({ component: AppShellRoute });

/**
 * The router owns the URL and the rail only. Every route renders the projects
 * slice's own view, and the slice decides what that view is.
 */
function AppShellRoute() {
  const user = useAuth('AppShellRoute', (state) => state.user, true);
  const matchedRouteIds = useRouterState({
    select: (state) => state.matches.map((match) => match.routeId),
  });
  const selectedDestination = findSelectedDestination(matchedRouteIds);
  const pageLabel = selectedDestination?.label ?? productName;

  // The application mounts these routes only for a signed-in session. The guard
  // covers the moment the session ends, before the signed-out page replaces them.
  if (!user) {
    return null;
  }

  return (
    <AppShell
      productName={productName}
      pageLabel={pageLabel}
      user={user}
      matchedRouteIds={matchedRouteIds}
    >
      <Outlet />
    </AppShell>
  );
}

const destinationRoutes = navigationRoutePaths().map((path) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path,
    component: ProjectIndex,
  }),
);

const routeTree = rootRoute.addChildren(destinationRoutes);

// A browser history drives the application URL. Tests and server rendering run
// without a window, so they get a memory history instead.
const history =
  typeof window === 'undefined'
    ? createMemoryHistory({ initialEntries: ['/'] })
    : createBrowserHistory();

export const router = createRouter({ routeTree, history });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
