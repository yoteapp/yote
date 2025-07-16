import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import path from 'path';

import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [react()],
  server: {
    middlewareMode: true,
    // hmr: {
    //   port: 3001 // Different port for HMR
    // }
  },
  root: __dirname,
  appType: 'custom', // This is key - tells Vite you're handling routing
  // // interestingly, the css for "production build" does work correctly

  // assetsInclude: ['**/*.css'],
  // css: {
  //   css: {
  //     postcss: {
  //       plugins: {
  //         tailwindcss: {
  //           config: path.resolve('./tailwind.config.js'),
  //           // content: [
  //           //   "./index.html",
  //           //   "./src/**/*.{js,ts,jsx,tsx}",
  //           // ],
  //           theme: {
  //             extend: {},
  //           },
  //           plugins: [],
            
  //         },
  //         autoprefixer: {},
  //       },
  //     },
  //     devSourcemap: true
  //   }
  // },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
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