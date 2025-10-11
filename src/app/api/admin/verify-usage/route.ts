/**
 * Admin API: Verify Usage Data Integrity
 * WP6.9: Checks for discrepancies between usage_tracking and actual data
 *
 * GET /api/admin/verify-usage
 *
 * Returns:
 * - Total users tracked
 * - Users with discrepancies
 * - Detailed discrepancy list
 * - Summary statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
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

    // Get actual project counts
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('user_id, status');

    if (projectsError) throw projectsError;

    // Group by user and count active projects
    const actualCounts: Record<string, number> = {};
    projects.forEach((p) => {
      if (p.status === 'active') {
        actualCounts[p.user_id] = (actualCounts[p.user_id] || 0) + 1;
      }
    });

    // Get tracked counts from usage_tracking
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const { data: usage, error: usageError } = await supabase
      .from('usage_tracking')
      .select('user_id, active_projects_count')
      .eq('month', currentMonth);

    if (usageError) throw usageError;

    // Find discrepancies
    const discrepancies: any[] = [];
    const trackedCounts: Record<string, number> = {};

    usage.forEach((u) => {
      trackedCounts[u.user_id] = u.active_projects_count;
    });

    // Check all users with projects
    Object.keys(actualCounts).forEach((userId) => {
      const actual = actualCounts[userId];
      const tracked = trackedCounts[userId] || 0;

      if (actual !== tracked) {
        discrepancies.push({
          userId,
          actual,
          tracked,
          difference: actual - tracked,
        });
      }
    });

    // Check users with tracked but no actual projects
    Object.keys(trackedCounts).forEach((userId) => {
      if (!actualCounts[userId] && trackedCounts[userId] > 0) {
        discrepancies.push({
          userId,
          actual: 0,
          tracked: trackedCounts[userId],
          difference: -trackedCounts[userId],
        });
      }
    });

    const totalUsers = new Set([...Object.keys(actualCounts), ...Object.keys(trackedCounts)]).size;
    const totalActiveProjects = Object.values(actualCounts).reduce((sum, n) => sum + n, 0);
    const totalTrackedProjects = Object.values(trackedCounts).reduce((sum, n) => sum + n, 0);

    return NextResponse.json({
      success: true,
      month: currentMonth,
      totalUsers,
      usersWithDiscrepancies: discrepancies.length,
      discrepancies: discrepancies.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference)),
      summary: {
        totalActiveProjects,
        totalTrackedProjects,
        inSync: totalActiveProjects === totalTrackedProjects,
      },
    });
  } catch (error: any) {
    console.error('❌ Error verifying usage:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify usage' },
      { status: 500 }
    );
  }
}
