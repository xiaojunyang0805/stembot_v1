export interface OllamaConfig {
  baseUrl: string
  defaultModel: string
  timeout: number
}

export const ollamaConfig: OllamaConfig = {
  baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  defaultModel: process.env.OLLAMA_DEFAULT_MODEL || 'llama3.2:3b',
  timeout: 30000, // 30 seconds
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface OllamaResponse {
  model: string
  created_at: string
  message?: {
    role: string
    content: string
  }
  response?: string
  done: boolean
}

export class OllamaClient {
  private baseUrl: string
  private timeout: number

  constructor(config: Partial<OllamaConfig> = {}) {
    this.baseUrl = config.baseUrl || ollamaConfig.baseUrl
    this.timeout = config.timeout || ollamaConfig.timeout
  }

  async chat(
    messages: ChatMessage[],
    model: string = ollamaConfig.defaultModel
  ): Promise<OllamaResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
      signal: AbortSignal.timeout(this.timeout),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async generate(
    prompt: string,
    model: string = ollamaConfig.defaultModel,
    options: { format?: 'json'; temperature?: number } = {}
  ): Promise<OllamaResponse> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        ...options,
      }),
      signal: AbortSignal.timeout(this.timeout),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async listModels(): Promise<{ models: Array<{ name: string; size: number; digest: string }> }> {
    const response = await fetch(`${this.baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(this.timeout),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch {
      return false
    }
  }
}

export const ollama = new OllamaClient()