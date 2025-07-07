const secrets = require(`./secrets.js`);
const envSecrets = secrets[process.env.NODE_ENV];

const config = {
  server: {
    port: process.env.PORT || 3233
    , url: `` // specify the hosted domain
    , useHttps: true
    // , cookieDomain: `` // for wildcard domains/cookies
  }

  , session: {
    secret: envSecrets.sessionSecret
  }

  // the two below are required for dev if we want to allow other clients to use the API 
  , allowedOrigins: [] // specific urls to accept connections from
  , allowCredentialsHeader: true

  // HSTS headers
  , strictTransportSecurity: false 

  , database: {
    // uri: `` // for custom database hosting
    dbName: `yote-staging`
  }

  , externalApis: {
    mandrill: {
      apiKey: envSecrets.mandrill
    }
  }

  , sendEmails: true

};

module.exports = config;