import type { ElementType } from 'react';
import {
  BarChartOutlined,
  FactCheckOutlined,
  FolderOutlined,
  GroupOutlined,
  GridViewOutlined,
  LayersOutlined,
  SettingsOutlined,
  ShieldOutlined,
} from '@mui/icons-material';

export type NavigationDestinationId =
  | 'overview'
  | 'projects'
  | 'templates'
  | 'reviews'
  | 'reports'
  | 'auditLog'
  | 'admin'
  | 'settings';

export interface NavigationDestination {
  id: NavigationDestinationId;
  label: string;
  Icon: ElementType;
  /**
   * The URLs this destination owns. The rail links to the first entry, and any
   * entry keeps the destination selected. `null` means the destination has no
   * page yet, so the rail renders the item disabled.
   *
   * Each entry is also a router route id, which is how the shell learns whether
   * the destination is the current one.
   */
  paths: string[] | null;
  group: 'primary' | 'footer';
}

export const navigationDestinations: NavigationDestination[] = [
  {
    id: 'overview',
    label: 'Overview',
    Icon: GridViewOutlined,
    paths: null,
    group: 'primary',
  },
  {
    id: 'projects',
    label: 'Projects',
    Icon: FolderOutlined,
    // The projects list, the create form and a saved project all belong to this
    // destination, so all three keep it selected.
    paths: ['/', '/projects/new', '/projects/$projectId'],
    group: 'primary',
  },
  {
    id: 'templates',
    label: 'Templates',
    Icon: LayersOutlined,
    paths: null,
    group: 'primary',
  },
  {
    id: 'reviews',
    label: 'Reviews',
    Icon: FactCheckOutlined,
    paths: null,
    group: 'primary',
  },
  {
    id: 'reports',
    label: 'Reports',
    Icon: BarChartOutlined,
    paths: null,
    group: 'primary',
  },
  {
    id: 'auditLog',
    label: 'Audit log',
    Icon: ShieldOutlined,
    paths: null,
    group: 'primary',
  },
  {
    id: 'admin',
    label: 'Admin',
    Icon: GroupOutlined,
    paths: null,
    group: 'footer',
  },
  {
    id: 'settings',
    label: 'Settings',
    Icon: SettingsOutlined,
    paths: null,
    group: 'footer',
  },
];

/** Every URL that needs a route, in rail order. */
export function navigationRoutePaths(): string[] {
  return navigationDestinations.flatMap((destination) => destination.paths ?? []);
}

export function isDestinationSelected(
  destination: NavigationDestination,
  matchedRouteIds: string[],
): boolean {
  if (destination.paths === null) {
    return false;
  }

  return destination.paths.some((path) => matchedRouteIds.includes(path));
}

export function findSelectedDestination(
  matchedRouteIds: string[],
): NavigationDestination | null {
  return (
    navigationDestinations.find((destination) =>
      isDestinationSelected(destination, matchedRouteIds),
    ) ?? null
  );
}
