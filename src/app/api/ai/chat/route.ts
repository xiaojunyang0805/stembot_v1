import { NextRequest, NextResponse } from 'next/server';

// Use environment variable with fallback for local development
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
}

// Enhanced system prompt for STEM research mentoring
const SYSTEM_PROMPT = `You are an AI research mentor for university STEM students. Your role is to:

1. Guide students through research methodology and question refinement
2. Help with experimental design and statistical planning
3. Assist with literature review and source evaluation
4. Support academic writing and presentation skills
5. Provide Socratic questioning to develop critical thinking

Keep responses:
- Academic but accessible
- Encouraging and supportive
- Focused on teaching research skills
- Specific to STEM fields when possible

If students upload documents or data, help them analyze methodology, identify patterns, and suggest improvements.`;

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'llama3.1:8b' }: ChatRequest = await request.json();

    console.log('AI Chat Request:', {
      messageCount: messages.length,
      model,
      ollamaUrl: OLLAMA_BASE_URL
    });

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // Prepare messages with system prompt
    const ollamaMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];

    // Call Ollama API
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        model,
        messages: ollamaMessages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: `${OLLAMA_BASE_URL}/api/chat`
      });

      return NextResponse.json(
        {
          error: 'AI service unavailable',
          details: `Ollama connection failed: ${response.status} ${response.statusText}`,
          ollamaUrl: OLLAMA_BASE_URL
        },
        { status: 503 }
      );
    }

    const data = await response.json();

    // Extract the assistant's response
    const assistantMessage = data.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';

    return NextResponse.json({
      message: {
        role: 'assistant',
        content: assistantMessage
      },
      model: data.model || model,
      created_at: data.created_at,
      done: data.done
    });

  } catch (error) {
    console.error('AI Chat Error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        ollamaUrl: OLLAMA_BASE_URL
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  // Debug environment variables
  console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    OLLAMA_BASE_URL_RAW: process.env.OLLAMA_BASE_URL,
    OLLAMA_BASE_URL_COMPUTED: OLLAMA_BASE_URL,
    ALL_ENV_KEYS: Object.keys(process.env).filter(key => key.includes('OLLAMA'))
  });

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama health check failed:', {
        status: response.status,
        statusText: response.statusText,
        url: `${OLLAMA_BASE_URL}/api/tags`,
        responseText: errorText.substring(0, 200)
      });

      return NextResponse.json(
        {
          status: 'unhealthy',
          error: `Ollama connection failed: ${response.status} - ${errorText.substring(0, 100)}`,
          ollamaUrl: OLLAMA_BASE_URL,
          debug: {
            envVarSet: !!process.env.OLLAMA_BASE_URL,
            computedUrl: OLLAMA_BASE_URL
          }
        },
        { status: 503 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      status: 'healthy',
      ollamaUrl: OLLAMA_BASE_URL,
      models: data.models || [],
      timestamp: new Date().toISOString(),
      debug: {
        envVarSet: !!process.env.OLLAMA_BASE_URL,
        computedUrl: OLLAMA_BASE_URL
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        ollamaUrl: OLLAMA_BASE_URL,
        debug: {
          envVarSet: !!process.env.OLLAMA_BASE_URL,
          computedUrl: OLLAMA_BASE_URL,
          errorType: error instanceof Error ? error.constructor.name : typeof error
        }
      },
      { status: 500 }
    );
  }
}