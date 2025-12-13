// database/postgresVectorDB.js
// PostgreSQL connection pool for vector database operations
// This is separate from the main MySQL database and only used for AI/vector operations

const { Pool } = require('pg');

class PostgresVectorDB {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  // Initialize connection pool
  async connect() {
    if (this.pool && this.isConnected) {
      return this.pool;
    }

    try {
      this.pool = new Pool({
        host: process.env.PG_HOST || process.env.POSTGRES_HOST || 'localhost',
        port: process.env.PG_PORT || process.env.POSTGRES_PORT || 5432,
        database: process.env.PG_DATABASE || process.env.POSTGRES_DB || 'webeenthere_vectors',
        user: process.env.PG_USER || process.env.POSTGRES_USER || 'postgres',
        password: process.env.PG_PASSWORD || process.env.POSTGRES_PASSWORD || '',
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      this.isConnected = true;
      console.log('✅ PostgreSQL vector database connected');
      
      return this.pool;
    } catch (error) {
      console.error('❌ PostgreSQL vector database connection error:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  // Get connection pool
  getPool() {
    if (!this.pool) {
      throw new Error('PostgreSQL pool not initialized. Call connect() first.');
    }
    return this.pool;
  }

  // Execute query
  async query(text, params) {
    const pool = await this.connect();
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (error) {
      console.error('PostgreSQL query error:', error.message);
      throw error;
    }
  }

  // Check if pgvector extension is installed
  async checkPgVectorExtension() {
    try {
      const result = await this.query(
        "SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector')"
      );
      return result.rows[0].exists;
    } catch (error) {
      console.error('Error checking pgvector extension:', error.message);
      return false;
    }
  }

  // Close connection pool
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      console.log('PostgreSQL vector database connection closed');
    }
  }
}

// Export singleton instance
const postgresVectorDB = new PostgresVectorDB();

module.exports = postgresVectorDB;












