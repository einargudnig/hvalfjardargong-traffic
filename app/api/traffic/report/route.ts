import { NextResponse } from 'next/server';
import { dbClient } from '@/lib/db-client';
import { 
  CreateTrafficReportSchema, 
  TrafficReportResponseSchema 
} from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    // Parse and validate the request body with Zod
    const body = await request.json();
    const parsedBody = CreateTrafficReportSchema.safeParse(body);
    
    if (!parsedBody.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          details: parsedBody.error.issues 
        },
        { status: 400 }
      );
    }
    
    const report = parsedBody.data;
    
    // Verify the tunnel exists
    const tunnel = await dbClient.getTunnel(report.tunnelId);
    if (!tunnel) {
      return NextResponse.json(
        { error: 'Tunnel not found' },
        { status: 404 }
      );
    }
    
    // Verify coordinates are within geofence of the specified tunnel entrance
    const isLocationValid = await dbClient.verifyLocation(
      report.tunnelId, 
      report.direction,
      report.coordinates
    );
    
    // Reject if location is not valid
    if (!isLocationValid) {
      return NextResponse.json(
        { error: 'User is not at the required location' },
        { status: 403 }
      );
    }

    // Update the geolocation verification status based on check
    const verifiedReport = {
      ...report,
      geolocationVerified: isLocationValid
    };
    
    // Create traffic report in database
    const reportId = await dbClient.createTrafficReport(verifiedReport);
    
    // Prepare and validate response
    const response = {
      id: reportId,
      success: true,
      message: 'Traffic report recorded successfully',
      timestamp: new Date().toISOString()
    };
    
    const parsedResponse = TrafficReportResponseSchema.safeParse(response);
    if (!parsedResponse.success) {
      console.error('Invalid response format:', parsedResponse.error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(parsedResponse.data);
  } catch (error) {
    console.error('Error recording traffic report:', error);
    return NextResponse.json(
      { error: 'Failed to record traffic report' },
      { status: 500 }
    );
  }
}
