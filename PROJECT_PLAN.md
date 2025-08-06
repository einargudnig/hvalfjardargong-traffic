# Tunnel Traffic App - Project Plan

## Overview

The Tunnel Traffic App is a mobile-first web application that enables users to
report and view traffic conditions at tunnel entrances. The app uses geolocation
verification to ensure accurate reporting and implements a crowdsourcing approach
where multiple reports increase the "score" of traffic incidents.

## Phase 1: Foundation (Weeks 1-2)

### Completed Tasks

- ✅ Set up Next.js project with TypeScript and Tailwind CSS
- ✅ Configure Postgres with Neon database connection
- ✅ Create basic UI components (TunnelSelector, DirectionButton, TrafficReport)
- ✅ Implement geolocation functionality
- ✅ Set up API routes structure
- ✅ Implement UUID-based user tracking

### Next Tasks

- [x] Create Neon database instance and connect to the app
- [x] Add Zod for schema validation and type safety
- [x] Create database client with Zod schema integration
- [x] Initialize database schema with tunnel and traffic report tables
- [x] Implement API endpoints with actual database integration
- [x] Set up proper error handling and validation
- [ ] Add comprehensive testing for core functionality

## Phase 2: Core Features (Weeks 3-4)

- [ ] Refine tunnel selection interface
- [x] Enhance geolocation verification system
  - [x] Implement proper geofencing for tunnel entrances
  - [x] Add location accuracy requirements and error handling
- [x] Develop traffic reporting mechanism
  - [x] Improve form validation with Zod schemas
  - [ ] Enhance user feedback during submission
  - [x] Implement proper error handling
- [x] Implement user tracking improvements
  - [x] Add rate limiting to prevent spam
  - [ ] Implement suspicious activity detection

## Phase 3: Enhanced Features (Weeks 5-6)

- [x] Develop traffic scoring algorithm
  - [x] Implement time-weighted scoring (recent reports worth more)
  - [x] Create decay function for older reports
  - [x] Set proper thresholds for traffic status
- [ ] Add real-time updates using WebSockets or polling
- [ ] Implement data visualization for traffic conditions
  - [ ] Add historical view of traffic patterns
  - [ ] Create time-based graphs for each tunnel entrance
- [ ] Complete responsive UI for all screen sizes
  - [ ] Enhance mobile experience
  - [ ] Add tablet and desktop optimizations

## Phase 4: Polish & Launch (Weeks 7-8)

- [ ] Comprehensive testing
  - [ ] Unit tests for critical functions
  - [ ] Integration tests for API endpoints
  - [ ] End-to-end tests for user flows
- [ ] Performance optimization
  - [ ] Code splitting and lazy loading
  - [ ] Database query optimization
  - [ ] Caching strategies for frequent data
- [ ] Deploy to production
  - [ ] Set up CI/CD pipeline
  - [ ] Configure monitoring and logging
  - [ ] Implement error tracking
- [ ] User feedback mechanisms
  - [ ] Add analytics
  - [ ] Create feedback form

## Future Enhancements

- [ ] Multiple tunnels support
- [ ] User accounts (optional)
- [ ] Traffic prediction based on historical data
- [ ] Integration with mapping services
- [ ] Push notifications for major traffic changes
- [ ] Admin dashboard for monitoring and moderation

## Technology Stack

- **Frontend**: Next.js (React) with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Postgres via Neon (serverless Postgres)
- **Validation**: Zod for schema validation and type safety
- **Deployment**: Vercel or similar platform

## Database Schema

```sql
-- Create PostGIS extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tunnels table
CREATE TABLE tunnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  north_entrance_location POINT NOT NULL,
  south_entrance_location POINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Traffic reports table
CREATE TABLE traffic_reports (
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
CREATE INDEX idx_traffic_reports_recent
ON traffic_reports (tunnel_id, direction, timestamp DESC);
```

## Zod Schemas

We've implemented Zod schemas for validation and type safety:

```typescript
// Point Schema
export const PointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// Tunnel Schema
export const TunnelSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  northEntranceLocation: PointSchema,
  southEntranceLocation: PointSchema,
  createdAt: z.date().optional(),
});

// Direction Enum
export const DirectionEnum = z.enum(['north', 'south']);

// Traffic Report Schema
export const TrafficReportSchema = z.object({
  id: z.string().uuid(),
  tunnelId: z.string().uuid(),
  direction: DirectionEnum,
  userId: z.string().uuid(),
  timestamp: z.date().default(() => new Date()),
  geolocationVerified: z.boolean().default(false),
  coordinates: PointSchema.optional(),
  hasTraffic: z.boolean(),
});

// Traffic Status Schema
export const TrafficStatusSchema = z.object({
  status: z.enum(['clear', 'traffic', 'unknown']),
  score: z.number(),
});
```
