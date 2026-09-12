import * as React from 'react';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import { store } from '../core/store/configure';
import { AuthProvider } from '../auth/contexts/AuthProvider';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import App from './App';

describe('application shell', () => {
  it('identifies the product to the user', () => {
    const markup = renderToStaticMarkup(
      <React.StrictMode>
        <SnackbarProvider>
          <Provider store={store}>
            <AuthProvider>
              <App />
            </AuthProvider>
          </Provider>
        </SnackbarProvider>
      </React.StrictMode>,
    );

    expect(markup).toContain('<h1>Project Scope Tool</h1>');
  });
});
