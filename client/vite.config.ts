import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: {
    '/api': { target: `http://127.0.0.1:${process.env.PORT ?? '3000'}` },
    '/auth': { target: `http://127.0.0.1:${process.env.PORT ?? '3000'}` },
  } },
});
