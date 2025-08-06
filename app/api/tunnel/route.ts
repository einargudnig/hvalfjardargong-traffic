import { NextResponse } from 'next/server';
import { dbClient } from '@/lib/db-client';
import { z } from 'zod';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tunnelId = searchParams.get('id') || '00000000-0000-0000-0000-000000000001'; // Default to sample tunnel
    
    // Validate the tunnel ID
    try {
      z.string().uuid().parse(tunnelId);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid tunnel ID' },
        { status: 400 }
      );
    }

    // Get tunnel from database
    const tunnel = await dbClient.getTunnel(tunnelId);
    
    if (!tunnel) {
      return NextResponse.json(
        { error: 'Tunnel not found' },
        { status: 404 }
      );
    }
    
    // Return the validated tunnel
    return NextResponse.json(tunnel);
  } catch (error) {
    console.error('Error fetching tunnel data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve tunnel data' },
      { status: 500 }
    );
  }
}
