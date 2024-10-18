const secrets = require(`./secrets.js`);
const envSecrets = secrets[process.env.NODE_ENV];

const config = {
  session: {
    secret: envSecrets.sessionSecret
  }

    // the two below are required for dev if we want to allow other clients to use the API 
    , allowedOrigins: [] // specific urls to accept connections from
    , allowCredentialsHeader: true
  
    // HSTS headers
    , strictTransportSecurity: false 

  , externalApis: {
    mandrill: {
      apiKey: envSecrets.mandrill
    }
  }

  , sendEmails: false
};

module.exports = config;