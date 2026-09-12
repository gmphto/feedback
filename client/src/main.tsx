import * as React from 'react';
import { createRoot } from 'react-dom/client';

import App from './app/App';
import './index.css';
import { ThemeProvider } from '@mui/material/styles';
import { LightTheme } from './shared/theme';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { AuthProvider } from './features/auth/state/AuthProvider';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider theme={LightTheme}>
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Provider store={store}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </Provider>
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
