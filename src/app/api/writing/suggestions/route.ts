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

    // Fetch gap analysis
    const { data: gapAnalysis } = await supabase
      .from('gap_analyses')
      .select('analysis_data')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Fetch source organization for top sources
    const { data: sourceOrg } = await supabase
      .from('source_organizations')
      .select('organization_data')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Fetch methodology
    const { data: methodology } = await supabase
      .from('project_methodology')
      .select('*')
      .eq('project_id', projectId)
      .single();

    // Fetch all project documents with summaries
    const { data: documents } = await supabase
      .from('project_documents')
      .select('original_name, summary, credibility_score')
      .eq('project_id', projectId)
      .order('credibility_score', { ascending: false })
      .limit(10);

    // Build section-specific context
    let context = `Student is writing the ${sectionName} section.\n\n`;
    context += `Research Question: ${project.research_question || project.title}\n\n`;

    // Section-specific memory retrieval
    if (sectionName === 'Introduction') {
      // Introduction needs: research question + gap analysis + top 3 sources
      if (gapAnalysis?.analysis_data) {
        const gaps = gapAnalysis.analysis_data;
        context += `Research Gap Identified:\n`;
        if (gaps.mainGap) {
          context += `- ${gaps.mainGap}\n`;
        }
        if (gaps.gaps && Array.isArray(gaps.gaps)) {
          gaps.gaps.slice(0, 2).forEach((gap: any) => {
            context += `- ${gap.description || gap}\n`;
          });
        }
        context += `\n`;
      }

      // Top 3 sources
      if (documents && documents.length > 0) {
        context += `Top Sources:\n`;
        documents.slice(0, 3).forEach((doc: any, idx: number) => {
          context += `${idx + 1}. ${doc.original_name}\n`;
          if (doc.summary) {
            context += `   Summary: ${doc.summary.substring(0, 150)}...\n`;
          }
        });
        context += `\n`;
      }
    } else if (sectionName === 'Methods') {
      // Methods needs: methodology documentation from WP4
      if (methodology) {
        context += `Methodology Details:\n`;
        context += `Approach: ${methodology.approach || 'Not specified'}\n`;
        if (methodology.study_type) {
          context += `Study Type: ${methodology.study_type}\n`;
        }
        if (methodology.data_collection) {
          context += `Data Collection: ${methodology.data_collection}\n`;
        }
        if (methodology.analysis_plan) {
          context += `Analysis Plan: ${methodology.analysis_plan}\n`;
        }
        context += `\n`;
      }
    } else if (sectionName === 'Results') {
      // Results needs: methodology for consistency
      if (methodology) {
        context += `Methodology Reference (for consistency):\n`;
        context += `- Study Type: ${methodology.study_type || 'Not specified'}\n`;
        context += `- Data Collection Method: ${methodology.data_collection || 'Not specified'}\n\n`;
      }
    } else if (sectionName === 'Discussion') {
      // Discussion needs: all sources + gap + methodology
      if (gapAnalysis?.analysis_data) {
        const gaps = gapAnalysis.analysis_data;
        context += `Research Gap to Address:\n`;
        if (gaps.mainGap) {
          context += `- ${gaps.mainGap}\n\n`;
        }
      }

      if (methodology) {
        context += `Methodology Used:\n- ${methodology.approach || 'Not specified'}\n\n`;
      }

      if (documents && documents.length > 0) {
        context += `All Sources for Discussion:\n`;
        documents.forEach((doc: any, idx: number) => {
          context += `${idx + 1}. ${doc.original_name}\n`;
        });
        context += `\n`;
      }
    }

    // Add current content
    const wordCount = currentContent ? currentContent.trim().split(/\s+/).filter((w: string) => w.length > 0).length : 0;
    if (currentContent && wordCount > 20) {
      context += `Current draft (${wordCount} words):\n${currentContent.substring(0, 300)}${currentContent.length > 300 ? '...' : ''}\n\n`;
    } else if (wordCount > 0) {
      context += `Current draft: Just started (${wordCount} words)\n\n`;
    }

    // Generate suggestions using GPT-4o-mini
    const systemPrompt = `You are a helpful academic writing assistant for high school students.
Based on the project memory provided, give 3-5 simple, actionable suggestions for writing the ${sectionName} section.

Guidelines:
- Keep suggestions SHORT and ACTIONABLE (one sentence each)
- Reference SPECIFIC sources, findings, or methodology details from the context
- Focus on WHAT to add, not HOW to write
- Use bullet points starting with action verbs (Mention, Explain, Connect, Reference, etc.)
- Be encouraging and specific

Example good suggestions:
• Mention Smith (2024) found that 67% of students improved with gamification
• Explain your research gap: lack of studies on middle school mathematics
• Connect to your research question about engagement strategies

Example bad suggestions:
• Make sure your introduction is clear and well-organized
• Use proper academic language
• Write more about the topic`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: context
        }
      ],
      temperature: 0.7,
      max_tokens: 400
    });

    const response = completion.choices[0]?.message?.content || '';

    // Parse suggestions (split by bullet points or newlines)
    const suggestions = response
      .split('\n')
      .filter(line => line.trim().length > 0)
      .filter(line => line.includes('•') || line.includes('-') || line.includes('*') || /^\d+\./.test(line.trim()))
      .map(line => line.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
      .filter(s => s.length > 15) // Filter out very short suggestions
      .slice(0, 5); // Allow up to 5 suggestions

    // If parsing failed, return simple fallback message
    if (suggestions.length === 0) {
      return NextResponse.json({
        suggestions: [
          'Add more sources to your literature review to get personalized suggestions',
          'Complete your methodology documentation to get specific writing help',
          'Conduct gap analysis to get targeted introduction suggestions'
        ]
      });
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
