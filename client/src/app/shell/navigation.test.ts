import { expect, it } from 'vitest';

import {
  findSelectedDestination,
  isDestinationSelected,
  navigationDestinations,
  navigationRoutePaths,
} from './navigation';

it('keeps the projects destination selected for every projects URL', () => {
  expect(findSelectedDestination(['/'])?.id).toBe('projects');
  expect(findSelectedDestination(['/projects/new'])?.id).toBe('projects');
  expect(findSelectedDestination(['/projects/$projectId'])?.id).toBe('projects');
});

it('selects nothing when no matched route belongs to a destination', () => {
  expect(findSelectedDestination(['__root__'])).toBeNull();
  expect(findSelectedDestination(['/not-a-destination'])).toBeNull();
});

it('never selects a destination that has no page', () => {
  const plannedDestinations = navigationDestinations.filter(
    (destination) => destination.paths === null,
  );

  expect(plannedDestinations.length).toBeGreaterThan(0);

  for (const destination of plannedDestinations) {
    expect(isDestinationSelected(destination, navigationRoutePaths())).toBe(false);
  }
});

it('declares unique destination ids and unique route paths', () => {
  const destinationIds = navigationDestinations.map((destination) => destination.id);
  const routePaths = navigationRoutePaths();

  expect(new Set(destinationIds).size).toBe(destinationIds.length);
  expect(new Set(routePaths).size).toBe(routePaths.length);
});
