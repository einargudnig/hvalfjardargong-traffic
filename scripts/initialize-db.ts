import { Pool } from 'pg';

// SQL for creating tables directly in this file to avoid module resolution issues
const createTablesSQL = `
-- Create tunnels table
CREATE TABLE IF NOT EXISTS tunnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  north_entrance_location POINT NOT NULL,
  south_entrance_location POINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create traffic reports table
CREATE TABLE IF NOT EXISTS traffic_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tunnel_id UUID REFERENCES tunnels(id),
  direction TEXT NOT NULL CHECK (direction IN ('north', 'south')),
  user_id UUID NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  geolocation_verified BOOLEAN DEFAULT FALSE,
  coordinates POINT,
  has_traffic BOOLEAN NOT NULL
);

-- Index for quick lookups of recent reports
CREATE INDEX IF NOT EXISTS idx_traffic_reports_recent 
ON traffic_reports (tunnel_id, direction, timestamp DESC);

-- Initial data for our single tunnel
INSERT INTO tunnels (id, name, north_entrance_location, south_entrance_location)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Sample Tunnel',
  point(64.1375, -21.8952), -- Ljosheimar 14-18, 104 Reykjavik (North entrance)
  point(64.1370, -21.8945)  -- Nearby point (South entrance)
)
ON CONFLICT DO NOTHING;
`;

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