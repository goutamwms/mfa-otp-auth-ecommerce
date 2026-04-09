import { Pool } from 'pg';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

interface QueryResultRow {
  [key: string]: any;
}

class Database {
  private pool: Pool;
  private initialized: boolean = false;

  constructor(config?: Partial<DatabaseConfig>) {
    this.pool = new Pool({
      host: config?.host || process.env.DB_HOST || 'localhost',
      port: parseInt(config?.port?.toString() || process.env.DB_PORT || '5432'),
      user: config?.user || process.env.DB_USER || 'postgres',
      password: config?.password || process.env.DB_PASSWORD || 'postgres',
      database: config?.database || process.env.DB_NAME || 'postgres',
    });
  }

  async getClient() {
    return this.pool.connect();
  }

  async query<T = QueryResultRow>(text: string, params?: any[]): Promise<T[]> {
    const result = await this.pool.query(text, params);
    return result.rows as T[];
  }

  async queryOne<T = QueryResultRow>(text: string, params?: any[]): Promise<T | null> {
    const rows = await this.query<T>(text, params);
    return rows[0] || null;
  }

  async execute(text: string, params?: any[]): Promise<number> {
    const result = await this.pool.query(text, params);
    return result.rowCount || 0;
  }

  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
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

      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          name JSONB NOT NULL,
          description JSONB DEFAULT '{}',
          image_url TEXT,
          parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
          is_active INTEGER DEFAULT 1,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          name JSONB NOT NULL,
          description JSONB DEFAULT '{}',
          base_price DECIMAL(10,2) NOT NULL,
          discounted_price DECIMAL(10,2),
          sku TEXT UNIQUE NOT NULL,
          stock INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS product_categories (
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
          PRIMARY KEY (product_id, category_id)
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS colors (
          id SERIAL PRIMARY KEY,
          name JSONB NOT NULL,
          code TEXT UNIQUE NOT NULL,
          is_active INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS product_colors (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          color_id INTEGER REFERENCES colors(id) ON DELETE CASCADE,
          price_modifier DECIMAL(10,2) DEFAULT 0,
          UNIQUE (product_id, color_id)
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS tags (
          id SERIAL PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          name JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS product_tags (
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
          PRIMARY KEY (product_id, tag_id)
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS product_images (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          color_id INTEGER REFERENCES colors(id) ON DELETE SET NULL,
          url TEXT NOT NULL,
          alt_text TEXT DEFAULT '',
          is_primary INTEGER DEFAULT 0,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_product_images_color ON product_images(color_id)`);

      this.initialized = true;
      console.log('Database initialized with e-commerce tables');
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  getPool(): Pool {
    return this.pool;
  }
}

export const database = new Database();
export default database;
