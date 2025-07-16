import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    middlewareMode: true,
  },
  root: path.resolve(__dirname, '../web'),
  appType: 'custom', // tell Vite we're handling routing ourselves

  css: {
    postcss: path.resolve(__dirname, '../web/postcss.config.js')
  },
  
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
})