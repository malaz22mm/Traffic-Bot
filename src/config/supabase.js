// src/config/supabase.js
// PostgreSQL (Supabase) connection using pg Pool.

const { Pool } = require("pg");

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_SSL_REJECT_UNAUTHORIZED,
} = process.env;

if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  console.warn("[DB] Some database environment variables are missing. Check your .env file.");
}

const pool = new Pool({
  host: DB_HOST,
  port: Number(DB_PORT) || 5432,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  ssl: {
    rejectUnauthorized: DB_SSL_REJECT_UNAUTHORIZED
      ? DB_SSL_REJECT_UNAUTHORIZED.toLowerCase() === "true"
      : false,
  },
});

pool.on("error", (err) => {
  console.error("[DB] Unexpected error on idle client", err);
});

const query = async (text, params) => {
  console.log("[DB] Executing query:", text, "params:", params);
  return pool.query(text, params);
};

module.exports = {
  pool,
  query,
};

