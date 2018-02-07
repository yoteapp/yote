let path = require('path');
const rootPath = path.normalize(__dirname + '/../../');

const secrets = require('./secrets.js');
const envSecrets = secrets[process.env.NODE_ENV];

// set urls
const devUrl = "localhost:3030";
const stagingUrl = "localhost:3030";
const prodUrl = "localhost:3030"; // this should match your production instance


// set database names
// NOTE: this is the name of the Mongo database.  It should ideally match the project name and be consistent accross environments
const devDbName = "yote";
const stagingDbName = "yote";
const productionDbName = "yote";

// set database uri's
let devDbUri = `mongodb://localhost/${devDbName}`
let stagingDbUri = `mongodb://${envSecrets.mongo_user}:${envSecrets.mongo_pass}@test-cluster-1-shard-00-00-rzbt6.gcp.mongodb.net:27017,test-cluster-1-shard-00-01-rzbt6.gcp.mongodb.net:27017,test-cluster-1-shard-00-02-rzbt6.gcp.mongodb.net:27017/${stagingDbName}?ssl=true&replicaSet=test-cluster-1-shard-0&authSource=admin`;
let productionDbUri = process.env.REMOTE_DB ? `mongodb://${process.env.REMOTE_DB}/${productionDbName}` : process.env.MONGODB_PORT ? `${process.env.MONGODB_PORT.replace("tcp", "mongodb")}/${productionDbName}` : `mongodb://localhost/${productionDbName}`


// console.log(secrets);
// console.log(process.env);
// set different database connections for the different environments. in each, the environment variable should override if set
// let devDb = `mongodb://localhost/${dbName}`;

// console.log("ENV SECRETS", envSecrets)
// TODO:  document the remoteDb environment variable below
// option to set database location manually via environment variables
// let remoteDb = process.env.REMOTE_DB ? process.env.REMOTE_DB : false;
// let remoteDb = 'mongodb://fugitivelabs:chunkybutterwalrus@test-cluster-1-shard-00-00-rzbt6.gcp.mongodb.net:27017,test-cluster-1-shard-00-01-rzbt6.gcp.mongodb.net:27017,test-cluster-1-shard-00-02-rzbt6.gcp.mongodb.net:27017/yote?ssl=true&replicaSet=test-cluster-1-shard-0&authSource=admin'

module.exports = {
  development: {
    appUrl: devUrl
    , db: devDbUri
    , httpsOptional: true
    , port: process.env.PORT || 3030
    , rootPath: rootPath
    , secrets: secrets || {}
    , useHttps: false

  }
  , staging: {
    appUrl: stagingUrl
    , db: stagingDbUri
    , httpsOptional: true
    , port: process.env.PORT || 3030
    , rootPath: rootPath
    , secrets: secrets || {}
    , useHttps: false

  }
  , production: {
    appUrl: prodUrl
    , db: productionDbUri
    , httpsOptional: true
    , port: process.env.PORT || 80
    , rootPath: rootPath
    , secrets: secrets || {}
    , useHttps: false
  }
}
