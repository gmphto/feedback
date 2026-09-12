import { Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../features/auth/state/AuthProvider';
import { AppShell } from './shell/AppShell';
import { productName } from './shell/layout';
import { findSelectedDestination } from './shell/navigation';

/**
 * The signed-in boundary of the router. Renders the application shell around
 * the matched route, or nothing while the session user is unconfirmed, so
 * protected content never flashes during the initial session check. Every
 * signed-in route is a child of this layout route, so all present and future
 * destinations are guarded by construction.
 */
export function ProtectedRoute() {
  const user = useAuth('ProtectedRoute', (state) => state.user, true);
  const { pathname } = useLocation();
  const matchedRouteIds = [pathname];
  const pageLabel = findSelectedDestination(matchedRouteIds)?.label ?? productName;

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