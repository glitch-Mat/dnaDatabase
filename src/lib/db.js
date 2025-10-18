// File: src/lib/db.js

import mysql from 'mysql2/promise';

export async function query({ query, values = [] }) {
  const dbconnection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    // --- THIS IS THE FIX ---
    // Change from .execute to .query
    const [results] = await dbconnection.query(query, values);
    // --- END OF FIX ---

    dbconnection.end();
    return results;
  } catch (error) {
    // Make sure we end the connection even if there is an error
    dbconnection.end();
    throw Error(error.message);
  }
}