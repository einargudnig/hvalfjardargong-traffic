import { Pool } from 'pg';
import { neon, neonConfig } from '@neondatabase/serverless';

// Use the neon client in serverless environments, 
// and the Pool client in Node.js environments
const db = process.env.VERCEL
  ? neon(process.env.DATABASE_URL || '')
  : new Pool({
      connectionString: process.env.DATABASE_URL,
    });

export default db;

// SQL for creating tables
export const createTablesSQL = `
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
  point(37.7749, -122.4194), -- Sample coordinates (North entrance)
  point(37.7833, -122.4167)  -- Sample coordinates (South entrance)
)
ON CONFLICT DO NOTHING;
`;
