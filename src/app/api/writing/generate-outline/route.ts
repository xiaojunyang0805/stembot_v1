import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * WP5: Writing Assistant - API Route for Paper Outline Generation
 *
 * Generates a simple research paper outline using project memory
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body;

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

    // Fetch project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('research_question, title, methodology_data')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Fetch top 5 literature sources
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('title, journal, year, authors')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(5);

    const topSources = sources || [];

    // Extract methodology type
    const methodologyType = project.methodology_data?.selectedMethod?.title ||
                           project.methodology_data?.methodType ||
                           'Not specified';

    // Generate outline using GPT-4o-mini
    const prompt = `Create a simple research paper outline using the following information:

Research Question: ${project.research_question}

Key Sources (${topSources.length} sources):
${topSources.map((s, i) => `${i + 1}. ${s.title} (${s.year})`).join('\n')}

Methodology: ${methodologyType}

Generate a structured outline with these sections:
1. Introduction (target: ~800 words)
2. Methods (target: ~800 words)
3. Results (target: ~1000 words)
4. Discussion (target: ~1000 words)

For each section, provide 3-4 specific key points that should be covered based on the research question and methodology.

Return the outline in JSON format with this structure:
{
  "sections": [
    {
      "title": "Introduction",
      "wordTarget": 800,
      "keyPoints": ["point 1", "point 2", "point 3", "point 4"]
    },
    ...
  ]
}`;

    // Call OpenAI GPT-4o-Mini
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an academic writing assistant. Generate structured, clear paper outlines for research projects.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      })
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const data = await openaiResponse.json();
    const content = data.choices[0].message.content;

    // Parse JSON response
    const outlineData = JSON.parse(content);

    // Add metadata to outline
    const fullOutline = {
      ...outlineData,
      researchQuestion: project.research_question,
      topSources: topSources.map(s => s.title),
      methodology: methodologyType
    };

    // Store outline in database
    const { error: insertError } = await supabase
      .from('paper_outlines')
      .insert({
        project_id: projectId,
        outline_data: fullOutline
      });

    if (insertError) {
      console.error('Error storing outline:', insertError);
      // Continue anyway - we can still return the outline
    }

    return NextResponse.json({
      success: true,
      outline: fullOutline
    });

  } catch (error) {
    console.error('Outline generation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate outline',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
