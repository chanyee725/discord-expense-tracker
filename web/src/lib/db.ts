/**
 * Database module using postgres.js
 *
 * Provides connection pool management and SQL query interface
 * Uses DATABASE_URL environment variable for connection configuration
 */

import postgres from "postgres";

// Database URL must be set
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create postgres instance with connection pool configuration
export const sql = postgres(databaseUrl, {
  max: 10, // max connections in pool
  idle_timeout: 20, // close idle connections after 20 seconds
  connect_timeout: 10, // timeout for connection attempts in seconds
});

export default sql;
