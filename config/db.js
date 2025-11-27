// config/db.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: process.env.DATABASE_PORT,
  ssl: { rejectUnauthorized: false }  // Render requires SSL
});

module.exports = pool;
