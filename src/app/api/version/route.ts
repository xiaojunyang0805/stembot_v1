import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const version = process.env.BUILD_VERSION || process.env.VERCEL_GIT_COMMIT_SHA || 'development';
    const buildDate = process.env.BUILD_DATE || new Date().toISOString();
    const environment = process.env.DEPLOYMENT_ENV || process.env.VERCEL_ENV || 'development';

    return NextResponse.json({
      version,
      buildDate,
      environment,
      timestamp: "2025-10-01T09:33:00.278Z",
      status: 'healthy'
    });
  } catch (error) {
    console.error('Version API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get version info',
        version: 'unknown',
        timestamp: "2025-10-01T09:33:00.278Z",
        status: 'error'
      },
      { status: 500 }
    );
  }
}