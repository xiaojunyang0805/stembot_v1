import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * WP5: Writing Assistant - API Route for Getting Paper Outline
 *
 * Retrieves existing paper outline for a project
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch outline
    const { data: outline, error } = await supabase
      .from('paper_outlines')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching outline:', error);
      return NextResponse.json(
        { error: 'Failed to fetch outline' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      outline: outline || null
    });

  } catch (error) {
    console.error('Get outline error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch outline',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
