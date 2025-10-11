/**
 * Admin API: Manually Sync Usage Data
 * WP6.9: Manually triggers reconciliation between usage_tracking and actual data
 *
 * POST /api/admin/sync-usage
 *
 * Returns:
 * - Users updated successfully
 * - Users failed (with errors)
 * - Detailed results per user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { updateProjectCount } from '@/lib/stripe/subscriptionHelpers';

export async function POST(request: NextRequest) {
  try {
    // Create Supabase admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get all active projects grouped by user
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('user_id, status');

    if (projectsError) throw projectsError;

    // Count active projects per user
    const userCounts: Record<string, number> = {};
    projects.forEach((p) => {
      if (p.status === 'active') {
        userCounts[p.user_id] = (userCounts[p.user_id] || 0) + 1;
      }
    });

    // Update usage_tracking for each user
    const results: any[] = [];
    for (const [userId, count] of Object.entries(userCounts)) {
      try {
        await updateProjectCount(userId, count);
        results.push({ userId, count, success: true });
      } catch (error: any) {
        results.push({ userId, count, success: false, error: error.message });
      }
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      usersUpdated: successful,
      usersFailed: failed,
      totalUsers: Object.keys(userCounts).length,
      results,
    });
  } catch (error: any) {
    console.error('❌ Error syncing usage:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync usage' },
      { status: 500 }
    );
  }
}
