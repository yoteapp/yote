const secrets = require(`./secrets.js`);
// console.log("SECRETS", secrets, process.env.NODE_ENV)
let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envSecrets = secrets[process.env.NODE_ENV];

const config = {
  log: {
    level: 'DEBUG'
  }

  , server: {
    port: 3233
    , url: `localhost:3233`
    , useHttps: false
  }
  , frontend: {
    basePath: './web'
    , buildPath: './web/dist' // we no longer use a build for dev, but we do for staging. Production uses ../web/build
    , useHotReloading: false
  }
  , database: {
    // Changed to use mongodb://127.0.0.1/ instead of mongodb://localhost/ to avoid IPv6 issues
    uri: envSecrets.MONGO_URI || `mongodb://127.0.0.1/`
    , name: envSecrets.DB_NAME || 'yote'
  }

  , session: {
    // set by env
  }

  , externalApis: {
    // set by env
  }
};

module.exports = config;