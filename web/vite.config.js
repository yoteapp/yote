import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import path from 'path';

// import tailwindcss from 'tailwindcss'
// import autoprefixer from 'autoprefixer'

const tailwindcss = (await import('tailwindcss')).default
const autoprefixer = (await import('autoprefixer')).default

console.log("DEBUG 1", __dirname)

console.log("DEBUG 2", path.resolve(__dirname, '../web/postcss.config.js'))
console.log("DEBUG 3", path.resolve(__dirname, '../web/tailwindcss.config.js'))

// const fs = await import('fs')
// console.log('=== CONFIG DEBUG ===')
// console.log('Web dir exists:', fs.existsSync(__dirname))
// console.log('Tailwind config exists:', fs.existsSync(path.join(__dirname, 'tailwind.config.js')))
// console.log('PostCSS config exists:', fs.existsSync(path.join(__dirname, 'postcss.config.js')))
// console.log('Vite config exists:', fs.existsSync(path.join(__dirname, 'vite.config.js')))
// console.log('Styles.css exists:', fs.existsSync(path.join(__dirname, 'src/styles.css')))

export default defineConfig({
  plugins: [react()],
  server: {
    middlewareMode: true,
    // hmr: {
    //   port: 3001 // Different port for HMR
    // }
  },
  // root: __dirname,
  root: path.resolve(__dirname, '../web'),
  appType: 'custom', // This is key - tells Vite you're handling routing
  // // interestingly, the css for "production build" does work correctly
  // css: {
  //     postcss: path.resolve(__dirname, '../web/postcss.config.js')
  //   },
  // assetsInclude: ['**/*.css'], // this kills the app
  css: {
    postcss: {
      plugins: [
        tailwindcss(path.join(__dirname, 'tailwind.config.js')),
        autoprefixer
      ]
    },
    devSourcemap: true
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