import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';

import { NavBar } from './NavBar';
import { navigationDestinations } from './navigation';

function renderNavBar(pathname: string, matchedRouteIds: string[]): string {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[pathname]}>
      <NavBar
        productName="Lumera"
        destinations={navigationDestinations}
        matchedRouteIds={matchedRouteIds}
      />
    </MemoryRouter>,
  );
}

it('renders every destination label in navigation order', () => {
  const markup = renderNavBar('/', ['/']);

  for (const destination of navigationDestinations) {
    expect(markup).toContain(destination.label);
  }
});

it('marks the active destination link with aria-current and keeps others unmarked', () => {
  const markup = renderNavBar('/projects/new', ['/projects/new']);

  // The nav renders twice (desktop bar + mobile panel), so each active link
  // appears once per copy; per copy, exactly one link is marked.
  expect(markup.match(/aria-current="page"/g)?.length).toBe(2);
  // The Projects link points to the destination's first path.
  expect(markup).toContain('href="/"');
});

it('renders destinations without a page as aria-disabled, not links', () => {
  const markup = renderNavBar('/', ['/']);
  const disabledCount =
    navigationDestinations.filter((destination) => destination.paths === null)
      .length * 2; // desktop bar + mobile panel

  expect(markup.match(/aria-disabled="true"/g)?.length).toBe(disabledCount);
  expect(markup).not.toContain('href="/templates"');
});

it('renders the semantic nav element with its label', () => {
  const markup = renderNavBar('/', ['/']);

  expect(markup).toContain('aria-label="Main navigation"');
  expect(markup).toContain('<nav');
});

it('renders the mobile toggle with synced ARIA state and a controlled panel', () => {
  const markup = renderNavBar('/', ['/']);

  expect(markup).toContain('aria-label="Toggle navigation menu"');
  expect(markup).toContain('aria-expanded="false"');
  expect(markup).toContain(`aria-controls="main-navigation-mobile-menu"`);
  expect(markup).toContain('id="main-navigation-mobile-menu"');
});
