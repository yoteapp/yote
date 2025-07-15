import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    middlewareMode: true,
    hmr: {
      port: 3001 // Different port for HMR
    }
  },
  appType: 'custom', // This is key - tells Vite you're handling routing
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './src/index.html' // Your main HTML entry point
      }
    }
  }
})

// export default defineConfig(({ mode }) => {
//   const isProduction = mode === 'production';
//   const outputDir = isProduction ? 'build' : 'dist';
//   console.log(`Vite is running in ${isProduction ? 'production' : 'development'} mode`);
//   return {
//     plugins: [react()],
//     resolve: {
//       alias: {
//         '@api': path.resolve(__dirname, '../server')
//       }
//     },
//     build: {
//       outDir: outputDir,
//     },
//     server: {
//       strictPort: false, // Don't fail if port is already in use, try next one
//       host: true, // Listen on all addresses
//       proxy: {
//         '/api': {
//           target: 'http://localhost:3233',
//           changeOrigin: true,
//         },
//       },
//     },
//   };
// });