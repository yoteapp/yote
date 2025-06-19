// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import path from 'node:path';
// import { fileURLToPath } from 'node:url';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// // get the env
// const env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [
//     react({
//       // Enable JSX in .js files
//       include: '**/*.{jsx,js,tsx,ts}',
//     }),
//     {
//       name: 'configure-server',
//       configureServer(server) {
//         // Custom middleware to handle MIME types
//         server.middlewares.use((req, res, next) => {
//           // Handle manifest.json specifically
//           if (req.url.endsWith('manifest.json')) {
//             res.setHeader('Content-Type', 'application/json');
//           }
//           // Handle JSX files served as modules
//           if (req.url.endsWith('.jsx')) {
//             res.setHeader('Content-Type', 'application/javascript');
//           }
//           next();
//         });
//       }
//     }
//   ],
//   server: {
//     port: 3333,
//     strictPort: false, // Don't fail if port is already in use, try next one
//     host: true, // Listen on all addresses
//     proxy: {
//       '/api': {
//         target: 'http://localhost:3233',
//         changeOrigin: true,
//       },
//     },
//     /**
//      * This config is similar to how CRACO was configured to write to disk
//      * in development mode. Vite doesn't have the same exact option, but we use
//      * middlewareMode: true for server-side rendering and writeEarlyHints.
//      */
//     middlewareMode: 'html',
//     fs: {
//       // Allow serving files from one level up to the project root
//       allow: ['..'],
//     },
//   },
//   build: {
//     // Set output directory based on environment (like CRACO did)
//     outDir: env === 'production' ? 'build' : 'dist',
//     // Generate manifest for server to use
//     manifest: true,
//     rollupOptions: {
//       input: path.resolve(__dirname, 'index.html'),
//     },
//   },
//   resolve: {
//     extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
//     alias: {
//       // Add aliases if needed for your project structure
//       '@': path.resolve(__dirname, './src'),
//     },
//   },
//   // Make sure to handle env variables with import.meta.env instead of process.env
//   define: {
//     'process.env': {},
//   },
//   optimizeDeps: {
//     include: ['react', 'react-dom'],
//   },
// });
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const outputDir = isProduction ? 'build' : 'dist';
  console.log(`Vite is running in ${isProduction ? 'production' : 'development'} mode`);
  return {
    plugins: [
      react({
        // Enable JSX in .js files
        include: '**/*.{jsx,js,tsx,ts}',
      }),
      {
        name: 'configure-server',
        configureServer(server) {
          // Custom middleware to handle MIME types
          server.middlewares.use((req, res, next) => {
            if (req.url.endsWith('manifest.json')) {
              res.setHeader('Content-Type', 'application/json');
            }
            if (req.url.endsWith('.jsx')) {
              res.setHeader('Content-Type', 'application/javascript');
            }
            next();
          });
        }
      }
    ],

    server: {
      port: 3333, // this is the port for the vite server, not the node server
      strictPort: false,
      host: true,
      open: false, // disable auto-opening the browser
      proxy: {
        '/api': {
          target: 'http://localhost:3233', // proxy the node server
          changeOrigin: true,
        },
      },
      middlewareMode: 'html',
      fs: {
        allow: ['..'],
      },
    },

    build: {
      outDir: outputDir,
      emptyOutDir: true, // Clear the output directory before building
      manifest: true,
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html'),
      },
    },

    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    define: {
      'process.env': {},  // use import.meta.env for env vars
    },

    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  };
});