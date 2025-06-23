// server.js - Server entry point for handling Vite's server integration
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer as createViteDevServer } from 'vite';

// Get __dirname equivalent in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// This implementation matches what CRACO was doing:
// - Writing to disk in development mode
// - Allowing server-side injection of the currentUser

async function createViteServer() {
  const app = express();
  const env = process.env.NODE_ENV || 'development';
  const isDev = env === 'development';
  const distPath = path.resolve(__dirname, isDev ? 'dist' : 'build');
  console.log(`Creating Vite server in ${isDev ? 'development' : 'production'} mode`);
  console.log(`Serving static files from: ${distPath}`);
  if (isDev) {
    // In development, create Vite dev server in middleware mode
    try {
      const vite = await createViteDevServer({
        server: { middlewareMode: true },
        appType: 'spa',
        // Ensure transform of JSX files
        optimizeDeps: {
          include: ['react', 'react-dom', 'react-router-dom']
        }
      });
      
      // Serve public assets with proper MIME types before Vite middleware
      app.use('/manifest.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        const manifestPath = path.join(__dirname, 'public', 'manifest.json');
        if (fs.existsSync(manifestPath)) {
          res.sendFile(manifestPath);
        } else {
          res.status(404).send('Manifest not found');
        }
      });

      // Use Vite's connect instance as middleware
      app.use(vite.middlewares);

      // Add a middleware to handle writing to disk
      app.use((req, res, next) => {
        // Store the original res.send method
        const originalSend = res.send;
        console.log("setting up middleware for writing to disk");
        console.log("req.user", req.user);
        // Override the send method to intercept HTML responses
        res.send = function(body) {
          console.log("Intercepting response for path:", req.path);
          if (typeof body === 'string' && req.path === '/' || req.path.endsWith('.html')) {
            // Replace the currentUser placeholder
            const html = body.replace('__CURRENT_USER__', JSON.stringify(req.user || null));
            
            // Write the HTML to disk for server-side rendering
            try {
              if (!fs.existsSync(distPath)) {
                fs.mkdirSync(distPath, { recursive: true });
              }
              fs.writeFileSync(path.join(distPath, 'index.html'), html);
              console.log('HTML written to disk:', path.join(distPath, 'index.html'));
            } catch (e) {
              console.error('Error writing HTML to disk:', e);
            }
            
            // Call the original send with the modified HTML
            return originalSend.call(this, html);
          }
          
          // For non-HTML responses, just pass through
          return originalSend.apply(this, arguments);
        };
        
        next();
      });
    } catch (e) {
      console.error("Error setting up Vite dev server:", e);
    }
  } else {
    // In production, serve static files with proper MIME types
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        // Set correct MIME type for manifest.json
        if (filePath.endsWith('.json')) {
          res.setHeader('Content-Type', 'application/json');
        }
        // Set correct MIME type for JSX files when served as modules
        if (filePath.endsWith('.jsx')) {
          res.setHeader('Content-Type', 'application/javascript');
        }
      }
    }));

    // Serve public assets specifically with proper MIME types
    app.use(express.static(path.join(__dirname, 'public'), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.json')) {
          res.setHeader('Content-Type', 'application/json');
        }
      }
    }));

    // All requests that don't match a static asset should serve index.html
    app.get('*', (req, res) => {
      let html = fs.readFileSync(path.resolve(distPath, 'index.html'), 'utf-8');
      console.log('Serving index.html for request:', req.path);
      // Inject the currentUser just like the original implementation
      const currentUser = req.user ? JSON.stringify(req.user) : 'null';
      html = html.replace('__CURRENT_USER__', currentUser);
      
      res.send(html);
    });
  }

  return app;
}

// For direct execution of this file
const port = process.env.PORT || 3333;
createViteServer().then(app => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});

// Export the server configuration for use in the main server
export { createViteServer };
