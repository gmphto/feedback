import * as React from 'react';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import { store } from './configure';
import { AuthProvider } from '../features/auth/state/AuthProvider';
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

    expect(markup).toContain('<h1>Lumera</h1>');
  });
});
