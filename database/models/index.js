'use strict';

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

sequelize = new Sequelize(config[env].database, config[env].username, config[env].password, config[env]);


connectionTest(sequelize);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;