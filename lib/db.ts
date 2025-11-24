import { Pool, PoolClient } from 'pg';

/**
 * PostgreSQL Database Connection Pool
 * Uses Neon database connection string from environment variables
 */
let pool: Pool | null = null;

/**
 * Get or create database connection pool
 */
export function getDbPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL or POSTGRES_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

/**
 * Execute a query and return results
 */
export async function query(text: string, params?: any[]) {
  const pool = getDbPool();
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error', { text, error });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getDbPool();
  return await pool.connect();
}

/**
 * Close the connection pool
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

