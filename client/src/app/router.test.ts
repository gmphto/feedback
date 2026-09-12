import { expect, it } from 'vitest';

import { router } from './router';
import { navigationRoutePaths } from './shell/navigation';

it('declares exactly one route for every rail destination URL', () => {
  const routeIds = (router.routeTree.children ?? []).map((route) => route.id);

  expect(routeIds).toEqual(navigationRoutePaths());
});
