import { createTablesSQL } from '../lib/db-client';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '.env.local' });

const main = async () => {
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is required');
    process.exit(1);
  }

  try {
    // Connect to the database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    console.log('Connected to the database');
    console.log('Initializing database schema...');

    // Run the schema creation SQL
    await pool.query(createTablesSQL);

    console.log('Database schema created successfully');
    await pool.end();
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

main();
