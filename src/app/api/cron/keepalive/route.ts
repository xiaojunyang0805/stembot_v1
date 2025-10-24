/**
 * Supabase Keep-Alive Cron Endpoint
 *
 * Purpose: Vercel Cron Job endpoint to prevent Supabase inactivity pausing
 *
 * Setup:
 * 1. Add to vercel.json:
 *    {
 *      "crons": [{
 *        "path": "/api/cron/keepalive",
 *        "schedule": "0 0 * * 3"
 *      }]
 *    }
 * 2. Deploy to Vercel
 * 3. Verify in Vercel Dashboard → Settings → Cron Jobs
 *
 * Security: Uses CRON_SECRET environment variable to prevent unauthorized access
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Verify cron secret (set in Vercel environment variables)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid cron secret' },
      { status: 401 }
    );
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Simple query to generate database activity
    const { count, error } = await supabase
      .from('research_projects')
      .select('id', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    const timestamp = new Date().toISOString();

    console.log(`[Keep-Alive] ${timestamp} - Success - ${count || 0} projects`);

    return NextResponse.json({
      success: true,
      timestamp,
      projectCount: count || 0,
      message: 'Database activity logged successfully',
    });

  } catch (error) {
    console.error('[Keep-Alive] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Allow POST as well for manual testing
export async function POST(request: NextRequest) {
  return GET(request);
}
