import { NotificationProvider } from '../providers/notification';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import App from './App';

describe('application shell', () => {
  it('identifies the product to the user', () => {
    const markup = renderToStaticMarkup(<NotificationProvider><App /></NotificationProvider>);

    expect(markup).toContain('<h1>Project Scope Tool</h1>');
  });
});

