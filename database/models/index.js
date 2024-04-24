'use strict';

// const process = require('process');
// const { Sequelize } = require('sequelize');
// // const env = process.env.NODE_ENV || 'development'; 
// const env = process.env.NODE_ENV || 'development';
// const config = require(__dirname + '/../config/config.js')[env];
// const db = {};


const process = require('process');
const { Sequelize } = require('sequelize');
const config = require(__dirname + '/../config/config.js');
// const env = process.env.NODE_ENV || 'development';
const env = process.env.NODE_ENV || 'production';
const db = {};

let sequelize;

if (process.env.VERCEL_ENV) {
    // Vercel deployment
    const vercelConfig = config.production.vercel;
    sequelize = new Sequelize(process.env[vercelConfig.use_env_variable], vercelConfig);
} else {
    // Local development or other environments
    sequelize = new Sequelize(config[env].database, config[env].username, config[env].password, config[env]);
}


// if (process.env.VERCEL_ENV) {
//     // Vercel deployment
//     sequelize = new Sequelize(process.env.VERCEL_POSTGRES_URL, config.vercel);
// } else if (config.use_env_variable) { //for when we deploy to Heroku in the future
//     sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else { 
//     sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;