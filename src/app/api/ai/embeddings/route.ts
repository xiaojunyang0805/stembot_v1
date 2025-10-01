import { NextRequest, NextResponse } from 'next/server';

/**
 * Embeddings API Route
 * Generates vector embeddings for text content using OpenAI's embedding model
 */

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      );
    }

    // Try OpenAI API for embeddings
    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small', // Faster and cheaper than ada-002
          input: text,
        }),
      });

      if (openaiResponse.ok) {
        const data = await openaiResponse.json();
        return NextResponse.json({
          embedding: data.data[0].embedding,
          model: 'text-embedding-3-small',
          dimensions: data.data[0].embedding.length,
        });
      } else {
        console.warn('OpenAI embeddings failed, falling back to mock');
      }
    } catch (error) {
      console.warn('OpenAI API error, falling back to mock:', error);
    }

    // Fallback: Generate mock embedding (1536 dimensions)
    console.log('🔄 Using mock embedding for:', text.substring(0, 50) + '...');
    const mockEmbedding = Array.from({ length: 1536 }, () => Math.random() - 0.5);

    return NextResponse.json({
      embedding: mockEmbedding,
      model: 'mock-embedding-model',
      dimensions: 1536,
      note: 'Mock embedding used - configure OPENAI_API_KEY for real embeddings',
    });

  } catch (error) {
    console.error('Embeddings API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate embedding' },
      { status: 500 }
    );
  }
}