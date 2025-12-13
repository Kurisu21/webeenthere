// scripts/setup-vector-db.js
// Setup script for PostgreSQL vector database
// Creates pgvector extension and necessary tables

const postgresVectorDB = require('../database/postgresVectorDB');

async function setupVectorDatabase() {
  try {
    console.log('🚀 Setting up PostgreSQL vector database...');
    
    // Connect to database
    await postgresVectorDB.connect();
    const pool = postgresVectorDB.getPool();
    
    // Check if pgvector extension exists
    console.log('📦 Checking for pgvector extension...');
    const extensionCheck = await pool.query(
      "SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector')"
    );
    
    if (!extensionCheck.rows[0].exists) {
      console.log('📦 Installing pgvector extension...');
      await pool.query('CREATE EXTENSION IF NOT EXISTS vector');
      console.log('✅ pgvector extension installed');
    } else {
      console.log('✅ pgvector extension already installed');
    }
    
    // Create dom_structures table
    console.log('📋 Creating dom_structures table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dom_structures (
        id SERIAL PRIMARY KEY,
        website_id INTEGER,
        html_content TEXT,
        text_content TEXT,
        embedding vector(1536),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        INDEX idx_website_id (website_id),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ dom_structures table created');
    
    // Create index for vector similarity search on dom_structures
    console.log('📊 Creating vector index for dom_structures...');
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS dom_structures_embedding_idx 
        ON dom_structures 
        USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100)
      `);
      console.log('✅ Vector index created for dom_structures');
    } catch (error) {
      // Index might already exist or ivfflat might not be available
      console.warn('⚠️  Could not create vector index (might already exist):', error.message);
    }
    
    // Create editor_states table
    console.log('📋 Creating editor_states table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS editor_states (
        id SERIAL PRIMARY KEY,
        website_id INTEGER,
        state_json JSONB,
        state_text TEXT,
        embedding vector(1536),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        INDEX idx_website_id (website_id),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ editor_states table created');
    
    // Create index for vector similarity search on editor_states
    console.log('📊 Creating vector index for editor_states...');
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS editor_states_embedding_idx 
        ON editor_states 
        USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100)
      `);
      console.log('✅ Vector index created for editor_states');
    } catch (error) {
      console.warn('⚠️  Could not create vector index (might already exist):', error.message);
    }
    
    // Create llm_contexts table
    console.log('📋 Creating llm_contexts table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS llm_contexts (
        id SERIAL PRIMARY KEY,
        context_type VARCHAR(100),
        prompt_text TEXT,
        response_text TEXT,
        embedding vector(1536),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        INDEX idx_context_type (context_type),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ llm_contexts table created');
    
    // Create index for vector similarity search on llm_contexts
    console.log('📊 Creating vector index for llm_contexts...');
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS llm_contexts_embedding_idx 
        ON llm_contexts 
        USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100)
      `);
      console.log('✅ Vector index created for llm_contexts');
    } catch (error) {
      console.warn('⚠️  Could not create vector index (might already exist):', error.message);
    }
    
    console.log('✅ PostgreSQL vector database setup complete!');
    console.log('');
    console.log('📝 Note: Make sure you have:');
    console.log('   1. PostgreSQL installed and running');
    console.log('   2. pgvector extension installed (run: CREATE EXTENSION vector; if not auto-installed)');
    console.log('   3. Environment variables set:');
    console.log('      - PG_HOST or POSTGRES_HOST');
    console.log('      - PG_PORT or POSTGRES_PORT (default: 5432)');
    console.log('      - PG_DATABASE or POSTGRES_DB');
    console.log('      - PG_USER or POSTGRES_USER');
    console.log('      - PG_PASSWORD or POSTGRES_PASSWORD');
    console.log('      - OPENROUTER_API_KEY (for embeddings)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up vector database:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupVectorDatabase();
}

module.exports = setupVectorDatabase;












