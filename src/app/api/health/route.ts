import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Health check endpoint for monitoring and load balancers
 */
export async function GET(request: Request) {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.1.0',
      services: {
        database: 'connected',
        payment: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
        sms: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'not_configured',
      },
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable',
      },
      { status: 503 }
    );
  }
}