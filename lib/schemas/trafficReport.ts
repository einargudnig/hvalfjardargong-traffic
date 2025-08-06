import { z } from 'zod';
import { PointSchema } from './tunnel';

// Valid directions for tunnel traffic
export const DirectionEnum = z.enum(['north', 'south']);
export type Direction = z.infer<typeof DirectionEnum>;

// Schema for traffic report
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

export type TrafficReport = z.infer<typeof TrafficReportSchema>;

// Schema for creating a new traffic report
export const CreateTrafficReportSchema = TrafficReportSchema.omit({ 
  id: true,
  timestamp: true,
}).extend({
  coordinates: PointSchema,
});

export type CreateTrafficReport = z.infer<typeof CreateTrafficReportSchema>;

// Schema for traffic report response
export const TrafficReportResponseSchema = z.object({
  id: z.string().uuid(),
  success: z.boolean(),
  message: z.string(),
  timestamp: z.string().datetime(),
});

export type TrafficReportResponse = z.infer<typeof TrafficReportResponseSchema>;

// Schema for traffic status
export const TrafficStatusSchema = z.object({
  status: z.enum(['clear', 'traffic', 'unknown']),
  score: z.number(),
});

export type TrafficStatus = z.infer<typeof TrafficStatusSchema>;

// Schema for tunnel traffic status response
export const TunnelTrafficStatusSchema = z.object({
  tunnelId: z.string().uuid(),
  north: TrafficStatusSchema,
  south: TrafficStatusSchema,
  lastUpdated: z.string().datetime(),
});

export type TunnelTrafficStatus = z.infer<typeof TunnelTrafficStatusSchema>;
