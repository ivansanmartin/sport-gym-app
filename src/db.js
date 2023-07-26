const mysql = require("mysql2/promise");
const dotoenv = require("dotenv");
const path = require("path");

require("dotenv").config({
  path: "./src/.env",
});

/**
 * Retorna la conexión con la base de datos
 *
 * @returns
 *
 */

const db = () => {
  return mysql.createConnection({
    host: process.env.HOST_NAME,
    user: process.env.USER_NAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false,
    },
  });
};

module.exports = db;
