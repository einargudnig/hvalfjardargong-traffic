import { NextResponse } from 'next/server';
import { dbClient } from '@/lib/db-client';
import { TunnelTrafficStatusSchema } from '@/lib/schemas';
import { z } from 'zod';

// GET endpoint to retrieve tunnel traffic status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tunnelId = searchParams.get('tunnelId') || '00000000-0000-0000-0000-000000000001'; // Default to our sample tunnel
    
    // Validate the tunnel ID
    try {
      z.string().uuid().parse(tunnelId);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid tunnel ID' },
        { status: 400 }
      );
    }
    
    // Get tunnel to verify it exists
    const tunnel = await dbClient.getTunnel(tunnelId);
    if (!tunnel) {
      return NextResponse.json(
        { error: 'Tunnel not found' },
        { status: 404 }
      );
    }
    
    // Calculate scores for both directions using our database client
    const northStatus = await dbClient.calculateTrafficScore(tunnelId, 'north');
    const southStatus = await dbClient.calculateTrafficScore(tunnelId, 'south');
    
    const response = {
      tunnelId,
      north: northStatus,
      south: southStatus,
      lastUpdated: new Date().toISOString()
    };
    
    // Validate the response with Zod
    const parsedResponse = TunnelTrafficStatusSchema.safeParse(response);
    if (!parsedResponse.success) {
      console.error('Invalid traffic status response:', parsedResponse.error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(parsedResponse.data);
  } catch (error) {
    console.error('Error fetching traffic status:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve traffic status' },
      { status: 500 }
    );
  }
}
