import { z } from 'zod';

// Schema for geographic point (lat, lng)
export const PointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export type Point = z.infer<typeof PointSchema>;

// Schema for a tunnel
export const TunnelSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  northEntranceLocation: PointSchema,
  southEntranceLocation: PointSchema,
  createdAt: z.date().optional(),
});

export type Tunnel = z.infer<typeof TunnelSchema>;

// Schema for creating a new tunnel
export const CreateTunnelSchema = TunnelSchema.omit({ 
  id: true, 
  createdAt: true,
});

export type CreateTunnel = z.infer<typeof CreateTunnelSchema>;

// Schema for updating an existing tunnel
export const UpdateTunnelSchema = CreateTunnelSchema.partial();

export type UpdateTunnel = z.infer<typeof UpdateTunnelSchema>;
