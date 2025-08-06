import { neon, neonConfig } from "@neondatabase/serverless";
import { Pool } from "pg";
import {
  Tunnel,
  TunnelSchema,
  TrafficReport,
  TrafficReportSchema,
  CreateTrafficReport,
  TrafficStatus,
  Point,
} from "./schemas";

// Configure neon to handle dates correctly
neonConfig.fetchOptions = {
  cache: "no-store",
};

// Determine which client to use (serverless or traditional)
const createDbClient = () => {
  if (process.env.VERCEL) {
    return neon(process.env.DATABASE_URL || "");
  } else {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
};

const db = createDbClient();

// Database client with Zod validation
export class DbClient {
  // Tunnels

  async getTunnel(id: string): Promise<Tunnel | null> {
    try {
      const query = `
        SELECT 
          id,
          name,
          ST_X(north_entrance_location) as north_lat,
          ST_Y(north_entrance_location) as north_lng,
          ST_X(south_entrance_location) as south_lat,
          ST_Y(south_entrance_location) as south_lng,
          created_at
        FROM tunnels
        WHERE id = $1
      `;

      const result = await db.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      // Transform data to match schema
      const tunnel = {
        id: row.id,
        name: row.name,
        northEntranceLocation: {
          lat: parseFloat(row.north_lat),
          lng: parseFloat(row.north_lng),
        },
        southEntranceLocation: {
          lat: parseFloat(row.south_lat),
          lng: parseFloat(row.south_lng),
        },
        createdAt: row.created_at,
      };

      // Validate with Zod
      return TunnelSchema.parse(tunnel);
    } catch (error) {
      console.error("Error getting tunnel:", error);
      throw new Error("Failed to get tunnel");
    }
  }

  // Traffic Reports

  async createTrafficReport(report: CreateTrafficReport): Promise<string> {
    try {
      const query = `
        INSERT INTO traffic_reports (
          tunnel_id,
          direction,
          user_id,
          geolocation_verified,
          coordinates,
          has_traffic
        )
        VALUES ($1, $2, $3, $4, point($5, $6), $7)
        RETURNING id
      `;

      const result = await db.query(query, [
        report.tunnelId,
        report.direction,
        report.userId,
        report.geolocationVerified,
        report.coordinates.lat,
        report.coordinates.lng,
        report.hasTraffic,
      ]);

      return result.rows[0].id;
    } catch (error) {
      console.error("Error creating traffic report:", error);
      throw new Error("Failed to create traffic report");
    }
  }

  async getRecentTrafficReports(
    tunnelId: string,
    direction: "north" | "south",
    hoursAgo: number = 2,
  ): Promise<TrafficReport[]> {
    try {
      const query = `
        SELECT 
          id,
          tunnel_id,
          direction,
          user_id,
          timestamp,
          geolocation_verified,
          ST_X(coordinates) as lat,
          ST_Y(coordinates) as lng,
          has_traffic
        FROM traffic_reports
        WHERE 
          tunnel_id = $1 AND
          direction = $2 AND
          timestamp > NOW() - INTERVAL '${hoursAgo} hours'
        ORDER BY timestamp DESC
      `;

      const result = await db.query(query, [tunnelId, direction]);

      // Transform and validate each row
      return result.rows.map((row) => {
        const report = {
          id: row.id,
          tunnelId: row.tunnel_id,
          direction: row.direction as "north" | "south",
          userId: row.user_id,
          timestamp: row.timestamp,
          geolocationVerified: row.geolocation_verified,
          hasTraffic: row.has_traffic,
        };

        // Add coordinates if they exist
        if (row.lat !== null && row.lng !== null) {
          Object.assign(report, {
            coordinates: {
              lat: parseFloat(row.lat),
              lng: parseFloat(row.lng),
            },
          });
        }

        return TrafficReportSchema.parse(report);
      });
    } catch (error) {
      console.error("Error getting recent traffic reports:", error);
      throw new Error("Failed to get recent traffic reports");
    }
  }

  // Traffic Score calculation

  async calculateTrafficScore(
    tunnelId: string,
    direction: "north" | "south",
  ): Promise<TrafficStatus> {
    try {
      const reports = await this.getRecentTrafficReports(tunnelId, direction);

      if (reports.length === 0) {
        return { status: "unknown", score: 0 };
      }

      // Calculate time-weighted score
      // Recent reports have higher weight
      const now = new Date();
      const halfLifeMs = 30 * 60 * 1000; // 30 minutes in milliseconds

      let weightedSum = 0;
      let weightSum = 0;

      for (const report of reports) {
        const timeDiffMs = now.getTime() - report.timestamp.getTime();
        const weight = Math.pow(0.5, timeDiffMs / halfLifeMs);

        weightSum += weight;
        weightedSum += report.hasTraffic ? weight : 0;
      }

      const score = weightSum > 0 ? (weightedSum / weightSum) * 10 : 0;

      // Determine status based on score
      let status: "clear" | "traffic" | "unknown";
      if (score >= 3) {
        status = "traffic";
      } else if (score < 1.5) {
        status = "clear";
      } else {
        status = "unknown";
      }

      return { status, score };
    } catch (error) {
      console.error("Error calculating traffic score:", error);
      return { status: "unknown", score: 0 };
    }
  }

  // Location verification

  async verifyLocation(
    tunnelId: string,
    direction: "north" | "south",
    coordinates: Point,
  ): Promise<boolean> {
    try {
      const tunnel = await this.getTunnel(tunnelId);

      if (!tunnel) {
        return false;
      }

      const tunnelCoordinates =
        direction === "north"
          ? tunnel.northEntranceLocation
          : tunnel.southEntranceLocation;

      // Calculate distance using Haversine formula
      const R = 6371e3; // Earth's radius in meters
      const φ1 = (coordinates.lat * Math.PI) / 180;
      const φ2 = (tunnelCoordinates.lat * Math.PI) / 180;
      const Δφ = ((tunnelCoordinates.lat - coordinates.lat) * Math.PI) / 180;
      const Δλ = ((tunnelCoordinates.lng - coordinates.lng) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      // Verify if within 200 meters
      return distance <= 200;
    } catch (error) {
      console.error("Error verifying location:", error);
      return false;
    }
  }
}

// Export a singleton instance
export const dbClient = new DbClient();

// Export the SQL for initializing tables
export const createTablesSQL = `
-- Create PostGIS extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS postgis;

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

-- Initial data for our single tunnel (if it doesn't exist)
INSERT INTO tunnels (id, name, north_entrance_location, south_entrance_location)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Sample Tunnel',
  point(37.7749, -122.4194), -- Sample coordinates (North entrance)
  point(37.7833, -122.4167)  -- Sample coordinates (South entrance)
)
ON CONFLICT DO NOTHING;
`;
