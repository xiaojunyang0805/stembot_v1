import { NextRequest, NextResponse } from 'next/server';

/**
 * WP4: Methodology Coach - API Route for Method Recommendations
 *
 * Calls GPT-4o-Mini to generate intelligent methodology recommendations
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { systemPrompt, researchQuestion, questionType, constraints, literatureContext } = body;

    // Call OpenAI GPT-4o-Mini
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Please analyze this research question and provide a comprehensive methodology recommendation: "${researchQuestion}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 2500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON response
    const recommendation = JSON.parse(content);

    return NextResponse.json(recommendation);

  } catch (error) {
    console.error('Methodology recommendation error:', error);

    // Return error response
    return NextResponse.json(
      {
        error: 'Failed to generate methodology recommendation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
