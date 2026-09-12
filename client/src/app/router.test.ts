import { expect, it } from 'vitest';

import { navigationRoutePaths } from './shell/navigation';

it('declares the rail destinations every signed-in route lives under', () => {
  expect(navigationRoutePaths()).toEqual(['/', '/projects/new', '/projects/$projectId']);
});
