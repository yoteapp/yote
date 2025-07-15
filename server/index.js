// ES updates, running in ES mode has benefits, but isn't fully backwards compatible
// allow require
import { createRequire } from 'module';
const require = createRequire(import.meta.url)
// allow dirname
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// console.log("dirname", dirname, "__dirname", __dirname);

// https://github.com/lorenwest/node-config
const path = require('path');
// point to this directory for config files so we can run the server from any directory
process.env.NODE_CONFIG_DIR = path.join(__dirname, 'config');
const config = require('config')
const env = process.env.NODE_ENV || 'development';

// general libraries
const fs = require('fs');
const express = require('express')
require('express-async-errors');
const serialize = require('serialize-javascript');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// database libraries
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');

// front end libraries
// const ViteExpress = require('vite-express');
import { createServer as createViteServer } from 'vite';
// const createViteServer = require('vite').createServer;

// yote/framework libraries
const errorHandler = require('./global/handlers/errorHandler.js')
const { passport } = require('./global/handlers/passportHandler.js');

/** SETUP - general express */
const app = express()
// app.set('view engine', 'html')
const buildPath = config.get('frontend.buildPath');
app.use(express.static(buildPath));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
// app.set('views', path.join(__dirname, buildPath));

/** SETUP - mongo database connection */
mongoose.connect(config.get('database.uri') + config.get('database.name'), {
  // as of mongoose 6 useNewUrlParser, useUnifiedTopology, and useCreateIndex are all true by default
  // https://mongoosejs.com/docs/migrating_to_6.html#no-more-deprecation-warning-options
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log("OUCHIE OOOO MY DB", err))

/** SETUP - sessions and cookies */
const sessionOptions = {
  secret: config.get('session.secret')
  , store: MongoStore.create({
    mongoUrl: config.get('database.uri') + config.get('database.name')
    // NOTES HERE - this functions but is NOT correct - connect-mongo changed their package
    // , and we SHOULD be able to pass in teh connection promise, as below, but it breaks. the temp solution creates unnecessary additional database connections
    // https://stackoverflow.com/questions/66388523/error-cannot-init-client-mongo-connect-express-session
    // https://www.npmjs.com/package/connect-mongo#express-or-connect-integration

    // correct way, re-use existing connection:
    // clientPromise: mongoose.connection
  })

  // regular unexpiring cookies
  , resave: false
  , saveUninitialized: true
  // expiring, refreshing cookies
  // , resave: true
  // , rolling: true
  // , cookie: {
  //   // timeouts
  //   // maxAge: 10 * 1000 // 10 seconds for testing
  //   maxAge: 1000 * 60 * 60 // 1 hour inactivity timeout
  // }
}
// set cookie domain, if defined by env
if(config.get('server').cookieDomain) {
  sessionOptions.cookie = {
    ...sessionOptions.cookie
    , domain: config.get('server').cookieDomain
  }
}
if(config.get('server').useHttps) {
  sessionOptions.cookie = {
    ...sessionOptions.cookie
    , secure: true
  }
}

app.use(
  session(sessionOptions)
);

// passport
app.use(passport.initialize());
app.use(passport.session());


/** SETUP - misc security and server headers */
app.use((req, res, next) => {
  // we can't use the wildcard on dev because of the cookie with separate ports, we need to use the config to set this as localhost:3233 for local, and the wildcard for prod (since prod is all the same domain)
  const origin = req.get('origin');
  const allowedOrigins = config.get('allowedOrigins') || [];

  if(allowedOrigins.includes(origin)) {
    // solution to allow mutliple origins, we only add the header if the origin is in the allowed list
    res.header('Access-Control-Allow-Origin', origin); // @grantfowler need to deploy to staging to test this
  }
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if(config.has('allowCredentialsHeader') && config.get('allowCredentialsHeader')) {
    res.header('Access-Control-Allow-Credentials', true); // @grantfowler need to deploy to staging to test this
  }

  // 1.7 - additional security headers
  res.header("X-Frame-Options", "SAMEORIGIN") // prevents page from being used inside of an iframe/clickjacking https://developer.mozilla.org/en-US/docs/Web/Security/Types_of_attacks#click-jacking

  // 1.8 - prevent mime type attacks, and define basic CSP policy
  res.header("X-Content-Type-Options", "nosniff")

  res.header("Content-Security-Policy", "")

  // this one should only be set in production, where we want to force https
  if(config.has('strictTransportSecurity') && config.get('strictTransportSecurity')) {
    res.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains") // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  }

  // check for OPTIONS method
  if(req.method == 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
})

/** SETUP - routing */
// api routes setup

// front end setup
// WIP, https://vite.dev/config/server-options
const vite = await createViteServer({
  server: { middlewareMode: true }
  , appType: 'custom'
  , root: `${process.cwd()}/web`
  , logLegel: 'info'
})

// static assets setup
app.use(express.static(path.join(__dirname, './public'), {
  index: false
}));

let router = express.Router();
require('./global/api/router')(router, vite)

// // differentiate front end and server routes
app.use((req, res, next) => {
  // TODO: add to list or change base
  console.log("req.path", req.path)
  // server routes
  if(req.path.startsWith('/api/') || req.path.startsWith('/img/') || req.path.startsWith('/favicon.ico')) {
    console.log("CATCH - no vite")
    return next()
  } else {
    // front end routes
    console.log("CATCH - yes vite")
    vite.middlewares(req, res, next)
    // return next()
  }
})


// app.use(vite.middlewares)

// app.use(vite.ssrLoadModule)

////////////////////
// configure ViteExpress server
// Helper to resolve paths relative to the project root
// console.log("cwd", process.cwd())
// console.log("config front end", config.get('frontend'))

// ViteExpress.config({
//   mode: 'development'
// })



const projectRoot = path.resolve(__dirname, '..');
const webDir = path.resolve(projectRoot, 'web');
// const viteConfigFile = path.join(webDir, 'vite.config.js');


// In development, always set the working directory to webDir so Vite/ViteExpress resolve configs and modules correctly
// this is necessary because we run this from the top level directory, and Vite/ViteExpress expect to be run from the web directory
if(process.cwd() !== webDir) {
  // process.chdir(webDir);
  console.log('Changed working directory to', process.cwd());
}
// Configure vite-express to point at the front-end /web folder, using absolute paths
// ViteExpress.config({
//   mode: 'development',
//   viteConfigFile,
//   root: webDir, // ensure vite uses the correct root
//   transformer: (htmlString, req) => {
//     // Add variable(s) to the HTML string
//     return htmlString.replace("'__CURRENT_USER__'", serialize(req.user || null, { isJSON: true }));
//   },
// });

////////////////////

app.use('/', router);

// unified error handler
app.use(errorHandler)

if(config.get('server.useHttps')) {
  const httpsServer = require('https').createServer({
    minVersion: 'TLSv1.2',
    key: fs.readFileSync(path.resolve(__dirname, `config/https/${env}/privatekey.key`)),
    cert: fs.readFileSync(path.resolve(__dirname, `config/https/${env}/cert_bundle.crt`)),
    ca: [fs.readFileSync(path.resolve(__dirname, `config/https/${env}/gd_bundle-g2-g1.crt`))]
    // }, app).listen(9191); // NOTE: uncomment to test HTTPS locally
  }, app).listen(443);

  const httpServer = require('http').createServer((req, res) => {
    console.log("REDIRECTING TO HTTPS");
    res.writeHead(302, {
      'Location': `https://${config.get('server.url')}${req.url}`
      // 'Location': 'https://localhost:9191' + req.url // NOTE: uncomment to test HTTPS locally
    });
    res.end();
    // }).listen(3233); // NOTE: uncomment to test HTTPS locally
  }).listen(80);

  if(app.get('config.frontend.useHotReloading')) {
    // ViteExpress.bind(app, httpServer)
    // ViteExpress.bind(app, httpsServer)
  }

} else {
  const httpServer = app.listen(config.get('server.port'), () => {
    console.log(`Example app listening at ${config.get('server.port')}`)
  })

  if(config.get('frontend.useHotReloading')) {
    // ViteExpress.bind(app, httpServer)
  }

}
