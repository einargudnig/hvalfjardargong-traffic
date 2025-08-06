import { z } from "zod";

export const PointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});
export type Point = z.infer<typeof PointSchema>;

export const TunnelSchema = z.object({
  id: z.string(),
  name: z.string(),
  northEntranceLocation: PointSchema,
  southEntranceLocation: PointSchema,
  createdAt: z.union([z.string(), z.date()]),
});
export type Tunnel = z.infer<typeof TunnelSchema>;

export const TrafficReportSchema = z.object({
  id: z.string(),
  tunnelId: z.string(),
  direction: z.enum(["north", "south"]),
  userId: z.string(),
  timestamp: z.union([z.string(), z.date()]),
  geolocationVerified: z.boolean(),
  hasTraffic: z.boolean(),
  coordinates: PointSchema.optional(),
});
export type TrafficReport = z.infer<typeof TrafficReportSchema>;

export const CreateTrafficReportSchema = z.object({
  tunnelId: z.string(),
  direction: z.enum(["north", "south"]),
  userId: z.string(),
  geolocationVerified: z.boolean(),
  hasTraffic: z.boolean(),
  coordinates: PointSchema,
});
export type CreateTrafficReport = z.infer<typeof CreateTrafficReportSchema>;

export const TrafficStatusSchema = z.object({
  status: z.enum(["clear", "traffic", "unknown"]),
  score: z.number(),
});
export type TrafficStatus = z.infer<typeof TrafficStatusSchema>;

export const TunnelTrafficStatusSchema = z.object({
  tunnelId: z.string(),
  north: TrafficStatusSchema,
  south: TrafficStatusSchema,
  lastUpdated: z.string(),
});
export type TunnelTrafficStatus = z.infer<typeof TunnelTrafficStatusSchema>;
