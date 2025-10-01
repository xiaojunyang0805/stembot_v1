/**
 * Simple test API route to verify Vercel deployment
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Test deployment API is working',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
}

export async function POST() {
  return NextResponse.json({
    message: 'POST method works',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
}