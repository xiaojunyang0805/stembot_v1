import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { title, researchQuestion, field, timeline } = await request.json();

    // Validate input
    if (!title || !researchQuestion) {
      return NextResponse.json(
        { error: 'Title and research question are required' },
        { status: 400 }
      );
    }

    // Get auth token from header or body
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify JWT token
    let userId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Helper function to get emoji for research field
    const getSubjectEmoji = (field: string): string => {
      const emojiMap: Record<string, string> = {
        'psychology': '🧠',
        'education': '🎓',
        'neuroscience': '🧬',
        'biology': '🔬',
        'medicine': '⚕️',
        'social': '👥',
        'other': '📊'
      };
      return emojiMap[field.toLowerCase()] || '📊';
    };

    // Prepare project data
    const newProject = {
      user_id: userId,
      title,
      research_question: researchQuestion,
      subject: field,
      subject_emoji: getSubjectEmoji(field),
      status: 'active',
      current_phase: 'question',
      progress_data: {
        question: { completed: false, progress: 10 },
        literature: { completed: false, progress: 0, sources_count: 0 },
        methodology: { completed: false, progress: 0 },
        writing: { completed: false, progress: 0, word_count: 0 }
      },
      metadata: {
        field,
        timeline,
        created_from: 'web_app'
      }
    };

    console.log('💾 Creating project via API:', { userId, title });

    // Insert project using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert(newProject)
      .select()
      .single();

    if (error) {
      console.error('❌ Database insert error:', error);
      return NextResponse.json(
        { error: `Failed to create project: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Project created successfully:', data.id);

    return NextResponse.json({
      success: true,
      project: data
    });

  } catch (error: any) {
    console.error('❌ Project creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Project Creation API',
    method: 'POST',
    requiredFields: ['title', 'researchQuestion', 'field', 'timeline'],
    authentication: 'Bearer token in Authorization header or body',
    status: 'ready'
  });
}
