import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all sections for the project
    const { data: sections, error } = await supabase
      .from('paper_sections')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching sections:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sections' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sections: sections || [] });

  } catch (error) {
    console.error('Error in sections GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, sectionName, content, wordCount, status } = body;

    if (!projectId || !sectionName) {
      return NextResponse.json(
        { error: 'Project ID and section name are required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Upsert the section (insert or update)
    const { data, error } = await supabase
      .from('paper_sections')
      .upsert({
        project_id: projectId,
        section_name: sectionName,
        content: content || '',
        word_count: wordCount || 0,
        status: status || 'not_started',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'project_id,section_name'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving section:', error);
      return NextResponse.json(
        { error: 'Failed to save section' },
        { status: 500 }
      );
    }

    return NextResponse.json({ section: data });

  } catch (error) {
    console.error('Error in sections POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
