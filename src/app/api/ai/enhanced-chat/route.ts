import { NextRequest, NextResponse } from 'next/server';
import { gpt5NanoClient } from '@/lib/ai/gpt4o-client';

// Use environment variable with fallback for local development (existing Ollama system)
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  useEnhanced?: boolean;
}

// Fallback system prompt (same as existing system)
const FALLBACK_SYSTEM_PROMPT = `You are an AI research mentor for university STEM students. Your role is to:

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
    const { messages, model = 'llama3.2:3b', useEnhanced = true }: ChatRequest = await request.json();

    console.log('Enhanced AI Chat Request:', {
      messageCount: messages.length,
      model,
      useEnhanced,
      gpt5NanoAvailable: gpt5NanoClient.isAvailable()
    });

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // Try GPT-5 nano first if enhanced mode is requested and available
    if (useEnhanced && gpt5NanoClient.isAvailable()) {
      console.log('Attempting GPT-5 nano response...');

      const gptResult = await gpt5NanoClient.generateResponse(messages);

      if (gptResult.success && gptResult.response) {
        console.log('GPT-5 nano response successful');
        return NextResponse.json({
          message: {
            role: 'assistant',
            content: gptResult.response
          },
          model: 'gpt-5-nano',
          enhanced: true,
          usage: gptResult.usage,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('GPT-5 nano failed, falling back to Ollama:', gptResult.error);
      }
    }

    // Fallback to existing Ollama system (EXACT same logic as original)
    console.log('Using Ollama fallback system...');

    // Prepare messages with system prompt
    const ollamaMessages = [
      { role: 'system', content: FALLBACK_SYSTEM_PROMPT },
      ...messages
    ];

    // Call Ollama API (EXACT same logic as existing route)
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
      console.error('Ollama API Error (Enhanced Route):', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: `${OLLAMA_BASE_URL}/api/chat`
      });

      // Final fallback: Return a helpful mock response
      const mockResponse = generateMockResponse(messages);
      return NextResponse.json({
        message: {
          role: 'assistant',
          content: mockResponse
        },
        model: 'mock-fallback',
        enhanced: false,
        fallback: 'mock',
        timestamp: new Date().toISOString(),
        note: 'This is a fallback response. AI services are temporarily unavailable.'
      });
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
      enhanced: false,
      fallback: 'ollama',
      created_at: data.created_at,
      done: data.done,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Enhanced AI Chat Error:', error);

    // Final fallback: Return a helpful mock response
    const mockResponse = generateMockResponse([]);

    return NextResponse.json({
      message: {
        role: 'assistant',
        content: mockResponse
      },
      model: 'mock-fallback',
      enhanced: false,
      fallback: 'mock',
      error: 'Service temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
}

// Generate intelligent mock responses based on common research queries
function generateMockResponse(messages: ChatMessage[]): string {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';

  if (lastMessage.includes('research question') || lastMessage.includes('hypothesis')) {
    return `I'd be happy to help you refine your research question! A strong research question should be:

1. **Specific and focused** - Clear scope and boundaries
2. **Measurable** - You can collect data to answer it
3. **Relevant** - Contributes to your field of study
4. **Feasible** - Achievable with your resources and timeline

Could you share your current research question or topic area? I'll help you develop it further using established research methodology frameworks.

*Note: Enhanced AI services are temporarily unavailable. This is a fallback response.*`;
  }

  if (lastMessage.includes('methodology') || lastMessage.includes('method')) {
    return `Research methodology is crucial for valid results! Let's consider:

**Quantitative approaches:**
- Experimental design with control groups
- Survey research with statistical analysis
- Observational studies with measurement

**Qualitative approaches:**
- Case studies for in-depth analysis
- Interviews for personal perspectives
- Content analysis for document review

**Mixed methods:**
- Combining quantitative and qualitative data
- Sequential or concurrent designs

What type of research question are you investigating? This will help determine the most appropriate methodological approach.

*Note: Enhanced AI services are temporarily unavailable. This is a fallback response.*`;
  }

  // Default academic support response
  return `Hello! I'm here to support your STEM research journey. I can help with:

📋 **Research Planning**
- Developing research questions and hypotheses
- Designing experiments and methodology
- Planning data collection strategies

📊 **Data & Analysis**
- Statistical analysis guidance
- Data interpretation support
- Visualization recommendations

📝 **Academic Writing**
- Literature review strategies
- Scientific writing techniques
- Citation and reference help

🔬 **STEM Domains**
- Mathematics, Physics, Chemistry, Biology
- Engineering and Computer Science
- Cross-disciplinary research approaches

What aspect of your research would you like to explore today?

*Note: Enhanced AI services are temporarily unavailable. This is a fallback response.*`;
}

// Health check endpoint
export async function GET() {
  try {
    // Test GPT-5 nano connection
    const gptTest = await gpt5NanoClient.testConnection();

    // Test Ollama connection (same as existing health check)
    let ollamaStatus = 'unknown';
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
      });
      ollamaStatus = response.ok ? 'healthy' : 'unhealthy';
    } catch {
      ollamaStatus = 'error';
    }

    return NextResponse.json({
      status: 'operational',
      services: {
        'gpt-5-nano': {
          available: gpt5NanoClient.isAvailable(),
          status: gptTest.success ? 'healthy' : 'unavailable',
          error: gptTest.error,
          models: gptTest.models
        },
        'ollama': {
          status: ollamaStatus,
          url: OLLAMA_BASE_URL
        },
        'mock-fallback': {
          status: 'always-available'
        }
      },
      fallback_strategy: 'gpt-5-nano → ollama → mock-responses',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}