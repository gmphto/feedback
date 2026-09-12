import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AuthProvider } from '../features/auth/state/AuthProvider';
import App from './App';
import { store } from './store';

describe('application shell', () => {
  it('identifies the product to the user', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <SnackbarProvider>
          <Provider store={store}>
            <AuthProvider>
              <App />
            </AuthProvider>
          </Provider>
        </SnackbarProvider>
      </MemoryRouter>,
    );

    expect(markup).toContain('<h1>Lumera</h1>');
  });
});
