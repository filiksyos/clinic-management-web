import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

// Get database connection string
const databaseUrl = process.env.DATABASE_URL || '';

async function setupDatabase() {
  try {
    console.log('Connecting to database...');
    
    // Create a connection pool
    const pool = new Pool({
      connectionString: databaseUrl,
    });
    
    // Connect to the database
    const client = await pool.connect();
    console.log('Successfully connected to database');
    
    try {
      console.log('Enabling UUID extension...');
      
      // Enable UUID extension
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log('UUID extension enabled');
      
      // Read SQL file
      const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.sql');
      console.log(`Reading SQL file from: ${schemaPath}`);
      
      const sqlContent = fs.readFileSync(schemaPath, 'utf8');
      const sqlStatements = sqlContent
        .split(';')
        .filter(statement => statement.trim().length > 0);
      
      // Execute SQL statements
      console.log(`Executing ${sqlStatements.length} SQL statements...`);
      
      for (const statement of sqlStatements) {
        try {
          await client.query(statement);
        } catch (error) {
          console.error('Error executing SQL statement:', error);
          console.error('Statement:', statement);
        }
      }
      
      console.log('Database setup completed successfully.');
    } finally {
      // Release the client back to the pool
      client.release();
    }
    
    // Close the pool
    await pool.end();
    
  } catch (error: unknown) {
    console.error('Error setting up database:', error instanceof Error ? error.message : String(error));
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => console.log('Database setup script completed'))
    .catch(err => console.error('Database setup failed:', err));
}

export default setupDatabase; 