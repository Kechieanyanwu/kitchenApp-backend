require("dotenv").config();

module.exports = {
  development: {
    username: process.env.POSTGRES_DEV_USER,
    password: process.env.POSTGRES_DEV_PASSWORD,
    database: process.env.POSTGRES_DEV_DB_NAME,
    host: process.env.POSTGRES_DEV_HOST,
    dialect: 'postgres'
  },
  test: {
    username: process.env.POSTGRES_TEST_USER,
    password: process.env.POSTGRES_TEST_PASSWORD,
    database: process.env.POSTGRES_TEST_DB_NAME,
    host: process.env.POSTGRES_TEST_HOST,
    dialect: 'postgres'
  },
  production: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB_NAME,
    host: process.env.POSTGRES_HOST,
    dialect: 'postgres'
  }
}