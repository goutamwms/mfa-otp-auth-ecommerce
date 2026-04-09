import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'auth_mfa',
});

export async function initDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    /*
    await client.query(`DROP TABLE IF EXISTS users`);
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
        is_verified INTEGER DEFAULT 0,
        otp_code TEXT,
        otp_expires_at BIGINT,
        otp_attempts INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table ready (recreated)');
    */
    console.log('connection done')
  } finally {
    client.release();
  }
}

export function getPool(): Pool {
  return pool;
}

export default pool;
