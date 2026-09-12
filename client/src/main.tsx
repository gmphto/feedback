import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './app/App';
import { store } from './app/store';
import { AuthProvider } from './features/auth/state/AuthProvider';
import { LightTheme } from './shared/theme';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={LightTheme}>
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Provider store={store}>
            <AuthProvider>
              <App />
            </AuthProvider>
          </Provider>
        </SnackbarProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
