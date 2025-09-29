// GPT-5 nano client for enhanced AI responses
// This is a NEW file that doesn't modify any existing functionality

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Enhanced system prompt for research mentoring with GPT-5 nano
const ENHANCED_SYSTEM_PROMPT = `You are an expert AI research mentor for university STEM students. You have deep knowledge across:

RESEARCH METHODOLOGY:
- Experimental design and hypothesis formation
- Statistical analysis and data interpretation
- Literature review and citation practices
- Research ethics and reproducibility

STEM DOMAINS:
- Mathematics: Analysis, algebra, statistics, computational methods
- Physics: Theoretical and experimental physics, modeling
- Chemistry: Organic, inorganic, physical, analytical chemistry
- Biology: Molecular biology, genetics, ecology, bioinformatics
- Engineering: All disciplines, design thinking, systems analysis
- Computer Science: Algorithms, machine learning, software engineering

MENTORING APPROACH:
- Use Socratic questioning to guide discovery
- Provide specific, actionable feedback
- Suggest concrete next steps for research
- Help refine research questions and methodology
- Support academic writing and presentation skills

RESPONSE STYLE:
- Be encouraging yet academically rigorous
- Provide examples from real research when relevant
- Adapt complexity to student level
- Focus on teaching research skills, not just answers
- When uncertain, acknowledge limitations and suggest resources

For document analysis: Help students evaluate methodology, identify patterns, critique approaches, and suggest improvements.`;

export class GPT5NanoClient {
  private apiKey: string | null;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || null;
  }

  /**
   * Check if GPT-5 nano is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Generate enhanced AI response using GPT-5 nano
   * Falls back gracefully if service is unavailable
   */
  async generateResponse(messages: ChatMessage[]): Promise<{
    success: boolean;
    response?: string;
    error?: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }> {
    // Check if API key is available
    if (!this.apiKey) {
      console.log('GPT-5 nano: API key not available, falling back to mock');
      return {
        success: false,
        error: 'API key not configured'
      };
    }

    try {
      // Prepare messages with enhanced system prompt
      const enhancedMessages = [
        { role: 'system' as const, content: ENHANCED_SYSTEM_PROMPT },
        ...messages
      ];

      console.log('GPT-5 nano: Generating response...', {
        messageCount: messages.length,
        hasApiKey: !!this.apiKey
      });

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-5-nano',
          messages: enhancedMessages,
          temperature: 0.7,
          max_tokens: 2048,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GPT-5 nano API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });

        return {
          success: false,
          error: `OpenAI API error: ${response.status} ${response.statusText}`
        };
      }

      const data: OpenAIResponse = await response.json();

      const assistantMessage = data.choices[0]?.message?.content;

      if (!assistantMessage) {
        return {
          success: false,
          error: 'No response content received from GPT-5 nano'
        };
      }

      console.log('GPT-5 nano: Response generated successfully', {
        responseLength: assistantMessage.length,
        usage: data.usage
      });

      return {
        success: true,
        response: assistantMessage,
        usage: data.usage
      };

    } catch (error) {
      console.error('GPT-5 nano Error:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Test the connection to OpenAI API
   */
  async testConnection(): Promise<{
    success: boolean;
    error?: string;
    models?: string[];
  }> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'API key not configured'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `API connection failed: ${response.status} ${response.statusText}`
        };
      }

      const data = await response.json();
      const models = data.data?.map((model: any) => model.id) || [];

      return {
        success: true,
        models: models.filter((model: string) => model.includes('gpt-5'))
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }
}

// Export a singleton instance
export const gpt5NanoClient = new GPT5NanoClient();