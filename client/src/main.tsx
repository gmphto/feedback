import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './app/App';
import './index.css';
import { ThemeProvider } from '@mui/material/styles';
import { LightTheme } from './theme';
import { NotificationProvider } from './providers/notification';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider theme={LightTheme}>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </ThemeProvider>
  </StrictMode>,
);

