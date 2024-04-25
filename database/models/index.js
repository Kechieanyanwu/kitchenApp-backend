'use strict';

// const process = require('process');
// const { Sequelize } = require('sequelize');
// // const env = process.env.NODE_ENV || 'development'; 
// const env = process.env.NODE_ENV || 'development';
// const config = require(__dirname + '/../config/config.js')[env];
// const db = {};


const process = require('process');
const { Sequelize } = require('sequelize');
// eslint-disable-next-line no-undef
const config = require(__dirname + '/../config/config.js');
// const env = process.env.NODE_ENV || 'development';
const env = process.env.NODE_ENV || 'production';
const db = {};

let sequelize;

const connectionTest = async (sequelize) => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

// if (process.env.VERCEL_ENV) {
//     const vercelConfig = config.production.vercel;
//     sequelize = new Sequelize(process.env[vercelConfig.use_env_variable], vercelConfig);
//     // connectionTest(sequelize);
// } else {
//     sequelize = new Sequelize(config[env].database, config[env].username, config[env].password, config[env]);
//     // connectionTest(sequelize);
// }


sequelize = new Sequelize(config[env].database, config[env].username, config[env].password, config[env]);


connectionTest(sequelize);



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