import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, sectionName, currentContent } = body;

    if (!projectId || !sectionName) {
      return NextResponse.json(
        { error: 'Project ID and section name are required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Fetch project documents
    const { data: documents } = await supabase
      .from('project_documents')
      .select('original_name, summary')
      .eq('project_id', projectId)
      .limit(5);

    // Fetch methodology if available
    const { data: methodology } = await supabase
      .from('project_methodology')
      .select('*')
      .eq('project_id', projectId)
      .single();

    // Fetch paper outline if available
    const { data: outline } = await supabase
      .from('paper_outlines')
      .select('outline_data')
      .eq('project_id', projectId)
      .single();

    // Build context for AI
    let context = `Research Question: ${project.research_question || project.title}\n\n`;

    if (documents && documents.length > 0) {
      context += `Literature Sources:\n${documents.map((d: any) => `- ${d.original_name}`).join('\n')}\n\n`;
    }

    if (methodology) {
      context += `Methodology: ${methodology.approach || 'Not specified'}\n\n`;
    }

    if (outline) {
      const outlineData = outline.outline_data;
      const sectionOutline = outlineData?.sections?.find((s: any) => s.title === sectionName);
      if (sectionOutline) {
        context += `Outline for ${sectionName}:\n${sectionOutline.keyPoints?.join('\n') || ''}\n\n`;
      }
    }

    if (currentContent) {
      context += `Current draft:\n${currentContent}\n\n`;
    }

    // Generate suggestions using GPT-4o-mini
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an academic writing assistant. Based on the project context, provide 3 specific, actionable suggestions for writing the ${sectionName} section. Focus on:
- Key points that should be included based on the research question and sources
- Structure and organization suggestions
- Important connections to make with the methodology or literature

Format: Return exactly 3 bullet points, each starting with a specific suggestion.`
        },
        {
          role: 'user',
          content: context
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content || '';

    // Parse suggestions (split by bullet points or newlines)
    const suggestions = response
      .split('\n')
      .filter(line => line.trim().length > 0)
      .filter(line => line.includes('•') || line.includes('-') || line.includes('*'))
      .map(line => line.replace(/^[•\-*]\s*/, '').trim())
      .slice(0, 3);

    // If parsing failed, return raw response split by sentences
    if (suggestions.length === 0) {
      const fallbackSuggestions = response
        .split('.')
        .filter(s => s.trim().length > 20)
        .map(s => s.trim())
        .slice(0, 3);

      return NextResponse.json({ suggestions: fallbackSuggestions });
    }

    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
