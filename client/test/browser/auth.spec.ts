import { expect, test } from '@playwright/test';

import type { Page, Route } from '@playwright/test';

async function confirmLogout(page: Page) {
  await page.getByRole('button', { name: 'Sign out of this app', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Unsaved local project changes will be discarded.');
  await dialog.getByRole('button', { name: 'Sign out', exact: true }).click();
}

test('startup, pending login, failure and retry use the validated OAuth destination', async ({ page }) => {
  let loginRequests = 0;
  let logoutRequests = 0;
  let releaseLogin!: () => void;
  let releaseSession!: () => void;
  const sessionPending = new Promise<void>((resolve) => {
    releaseSession = resolve;
  });
  const loginPending = new Promise<void>((resolve) => {
    releaseLogin = resolve;
  });

  await page.route('**/api/session', async (route) => {
    await sessionPending;
    await route.fulfill({ status: 401 });
  });
  await page.route('**/auth/logout', (route) => {
    logoutRequests += 1;
    return route.fulfill({ status: 204 });
  });
  await page.route('**/auth/login?**', async (route) => {
    loginRequests += 1;
    if (loginRequests === 1) {
      await loginPending;
      await route.fulfill({ status: 503 });
      return;
    }

    await route.fulfill({
      json: { authorizationUrl: 'http://127.0.0.1:5187/oauth-destination' },
    });
  });
  await page.route('**/oauth-destination', (route) => route.fulfill({
    contentType: 'text/html',
    body: '<h1>Identity provider</h1>',
  }));

  await page.goto('/');
  await expect(page.getByText('Checking your session…')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeDisabled();
  releaseSession();
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Opening secure sign-in…' })).toBeDisabled();
  expect(loginRequests).toBe(1);
  releaseLogin();
  await expect(page.getByRole('alert')).toContainText('Could not open secure sign-in');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Identity provider' })).toBeVisible();
  expect(loginRequests).toBe(2);
  expect(logoutRequests).toBe(0);
});

test('session failures and same-user refresh preserve a hidden local draft', async ({ page }) => {
  let sessionStatus = 200;
  await page.route('**/api/session', (route) => route.fulfill({
    status: sessionStatus,
    json: { user: { id: 7 } },
  }));

  await page.goto('/');
  await page.getByRole('button', { name: 'Create project', exact: true }).click();
  await page.getByLabel('Project name').fill('Keep my draft');
  sessionStatus = 503;
  await page.getByRole('button', { name: 'Check session again' }).click();
  await expect(page.getByRole('alert')).toContainText('Could not check your session');
  await expect(page.getByLabel('Project name')).toBeHidden();
  sessionStatus = 200;
  await page.getByRole('button', { name: 'Check session again' }).click();
  await expect(page.getByLabel('Project name')).toHaveValue('Keep my draft');
});

for (const successfulStatus of [204, 401]) {
  test(`cancel and failed logout retain drafts; logout ${successfulStatus} replaces the document`, async ({ page }) => {
    let signedIn = true;
    let logoutRequests = 0;
    let releaseLogout!: () => void;
    const logoutPending = new Promise<void>((resolve) => {
      releaseLogout = resolve;
    });
    await page.route('**/api/session', (route) => route.fulfill({
      status: signedIn ? 200 : 401,
      json: { user: { id: 7 } },
    }));
    await page.route('**/auth/logout', async (route) => {
      logoutRequests += 1;
      if (logoutRequests === 1) {
        await logoutPending;
        await route.fulfill({ status: 503 });
        return;
      }

      signedIn = false;
      await route.fulfill({ status: successfulStatus });
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Create project', exact: true }).click();
    await page.getByLabel('Project name').fill('Keep my draft');
    await page.getByRole('button', { name: 'Sign out of this app', exact: true }).click();
    await expect(page.getByRole('dialog').getByRole('button', { name: 'Cancel' })).toBeFocused();
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByLabel('Project name')).toHaveValue('Keep my draft');
    expect(logoutRequests).toBe(0);

    await confirmLogout(page);
    await expect(page.getByRole('button', { name: 'Ending this application session…' })).toBeDisabled();
    expect(logoutRequests).toBe(1);
    releaseLogout();
    await expect(page.getByRole('alert').first()).toContainText('Could not sign out');
    await expect(page.getByRole('button', { name: 'Sign out of this app', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'Check session again' }).click();
    await expect(page.getByLabel('Project name')).toHaveValue('Keep my draft');
    await page.evaluate(() => {
      document.documentElement.dataset.beforeLogout = 'true';
    });
    await confirmLogout(page);
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeEnabled();
    await expect(page.locator('html')).not.toHaveAttribute('data-before-logout');
    await expect(page.getByLabel('Project name')).toBeHidden();
    expect(logoutRequests).toBe(2);
  });
}

test('project expiry retires a pending session response and returns to sign-in', async ({ page }) => {
  let signedIn = true;
  let sessionRequests = 0;
  let lateSession: Route | undefined;
  let releaseProject!: () => void;
  const projectPending = new Promise<void>((resolve) => {
    releaseProject = resolve;
  });

  await page.route('**/api/session', async (route) => {
    sessionRequests += 1;
    if (sessionRequests === 2) {
      lateSession = route;
      return;
    }

    await route.fulfill({
      status: signedIn ? 200 : 401,
      json: { user: { id: 7 } },
    });
  });
  await page.route('**/api/projects/7/definition', async (route) => {
    await projectPending;
    signedIn = false;
    await route.fulfill({ status: 401 });
  });

  await page.goto('/projects/7');
  await expect(page.getByRole('heading', { name: 'Loading project…' })).toBeVisible();
  await page.getByRole('button', { name: 'Check session again' }).click();
  await expect.poll(() => sessionRequests).toBe(2);
  releaseProject();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeEnabled();
  // The old document may already have cancelled this intercepted request.
  await lateSession?.fulfill({ json: { user: { id: 7 } } }).catch(() => undefined);
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeEnabled();
  await expect(page.getByRole('heading', { name: 'Loading project…' })).toBeHidden();
});

test('a window focus re-checks a failed session without activating a control', async ({ page }) => {
  let sessionStatus = 503;
  let sessionRequests = 0;
  await page.route('**/api/session', (route) => {
    sessionRequests += 1;
    return route.fulfill({
      status: sessionStatus,
      json: { user: { id: 7 } },
    });
  });

  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Could not check your session');
  expect(sessionRequests).toBe(1);

  sessionStatus = 200;
  await page.evaluate(() => {
    window.dispatchEvent(new Event('focus'));
  });

  await expect.poll(() => sessionRequests).toBe(2);
  await expect(page.getByRole('alert')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Sign out of this app', exact: true })).toBeEnabled();

  sessionStatus = 401;
  await page.evaluate(() => {
    window.dispatchEvent(new Event('focus'));
  });

  await expect.poll(() => sessionRequests).toBe(3);
  await expect(page.getByRole('alert')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeEnabled();
});
