/* eslint-disable no-undef */
require('dotenv').config();
const pg = require('pg'); 

module.exports = {
    development: {
        username: process.env.POSTGRES_DEV_USER,
        password: process.env.POSTGRES_DEV_PASSWORD,
        database: process.env.POSTGRES_DEV_DB_NAME,
        host: process.env.POSTGRES_DEV_HOST,
        dialect: 'postgres',
        dialectModule: pg,
    },
    test: {
        username: process.env.POSTGRES_TEST_USER,
        password: process.env.POSTGRES_TEST_PASSWORD,
        database: process.env.POSTGRES_TEST_DB_NAME,
        host: process.env.POSTGRES_TEST_HOST,
        dialect: 'postgres',
        dialectModule: pg,
    },
    production: {
        username: process.env.VERCEL_POSTGRES_USER,
        password: process.env.VERCEL_POSTGRES_PASSWORD,
        database: process.env.VERCEL_POSTGRES_DATABASE,
        host: process.env.VERCEL_POSTGRES_HOST,
        dialect: 'postgres',
        dialectOptions: {
            connectTimeoutMS: 10000, // Set your timeout duration,
            ssl: {
                require: true,
                rejectUnauthorized: false, //to change this for actual prod
            },
        },
        dialectModule: pg,
    },
};