# WP5 AI Integration Guide - StemBot v1

This document provides comprehensive guidance for integrating real AI models into the StemBot chat system in Work Package 5 (WP5). The current implementation includes a complete API infrastructure with mock responses that can be easily replaced with actual AI model integration.

## Current Architecture Overview

### API Routes Structure

The chat system is built with two main API endpoints:

1. **General Chat API** (`/api/chat`)
   - Handles general educational conversations
   - Context-aware responses based on subject detection
   - Language and difficulty level support

2. **Project-Specific Chat API** (`/api/projects/[id]/chat`)
   - Project-aware conversations with contextual learning objectives
   - Progress tracking integration
   - Subject-specific educational guidance

### Mock AI Response System

The current implementation includes a sophisticated mock AI system that demonstrates the expected behavior and response patterns for real AI integration.

#### Features Currently Implemented:
- **Subject Detection**: Automatic classification of messages into Math, Science, Programming, or Other
- **Educational Context**: Responses tailored to educational objectives
- **Realistic Processing Times**: 1-3 second delays to simulate AI processing
- **Error Handling**: Comprehensive error scenarios and recovery patterns
- **Project Integration**: Context-aware responses based on project details

## Integration Points for Real AI Models

### 1. API Route Modifications

#### General Chat Route (`src/app/api/chat/route.ts`)

**Current Mock Implementation:**
```typescript
class MockAITutor {
  async generateResponse(
    content: string,
    context?: { subject?: string; difficulty?: string; language?: string },
    conversationId?: string
  ): Promise<ChatResponse>
}
```

**WP5 Integration Points:**
```typescript
class RealAITutor {
  private aiService: AIService; // Your AI service integration

  async generateResponse(
    content: string,
    context?: { subject?: string; difficulty?: string; language?: string },
    conversationId?: string
  ): Promise<ChatResponse> {
    // Replace mock logic with real AI calls
    const aiResponse = await this.aiService.generateEducationalResponse({
      prompt: content,
      subject: context?.subject,
      difficulty: context?.difficulty,
      language: context?.language || 'en',
      conversationHistory: await this.getConversationHistory(conversationId)
    });

    return {
      id: generateId(),
      content: aiResponse.content,
      timestamp: new Date(),
      conversationId: conversationId || generateConversationId(),
      processingTime: aiResponse.processingTime
    };
  }
}
```

#### Project-Specific Chat Route (`src/app/api/projects/[id]/chat/route.ts`)

**Current Mock Implementation:**
```typescript
class ProjectAITutor {
  private getProjectSpecificResponse(
    content: string,
    projectContext: ProjectContext
  ): string
}
```

**WP5 Integration Points:**
```typescript
class RealProjectAITutor {
  private aiService: AIService;
  private projectService: ProjectService;

  async generateResponse(
    content: string,
    projectContext: ProjectContext,
    conversationId?: string
  ): Promise<ProjectChatResponse> {
    // Get comprehensive project context
    const fullProjectContext = await this.projectService.getProjectDetails(projectContext.id);
    const conversationHistory = await this.getProjectConversationHistory(projectContext.id, conversationId);

    // Generate AI response with project context
    const aiResponse = await this.aiService.generateProjectAwareResponse({
      prompt: content,
      projectName: fullProjectContext.name,
      subject: fullProjectContext.subject,
      difficulty: fullProjectContext.difficulty,
      learningObjectives: fullProjectContext.learningObjectives,
      projectProgress: fullProjectContext.progress,
      conversationHistory,
      previousLearningData: await this.getUserLearningHistory(projectContext.id)
    });

    return {
      id: generateId(),
      content: aiResponse.content,
      timestamp: new Date(),
      conversationId: conversationId || generateProjectConversationId(projectContext.id),
      projectId: projectContext.id,
      projectContext: fullProjectContext,
      processingTime: aiResponse.processingTime
    };
  }
}
```

### 2. Database Integration Requirements

#### Conversation Storage Schema

```sql
-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id) NULL, -- NULL for general chat
  subject VARCHAR(50),
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  content TEXT NOT NULL,
  sender VARCHAR(10) CHECK (sender IN ('user', 'ai')),
  timestamp TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'sent',
  ai_model VARCHAR(100), -- Track which AI model generated the response
  processing_time INTEGER, -- AI processing time in milliseconds
  metadata JSONB -- Additional AI response metadata
);

-- Learning context table for AI personalization
CREATE TABLE learning_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  subject VARCHAR(50),
  difficulty_level VARCHAR(20),
  learning_style JSONB,
  performance_metrics JSONB,
  last_updated TIMESTAMP DEFAULT NOW()
);
```

#### Required Database Functions

```typescript
// Update src/lib/database/chat.ts
export class ChatDatabase {
  // Store conversation messages
  async saveMessage(conversationId: string, message: SaveMessageData): Promise<Message>

  // Retrieve conversation history
  async getConversationHistory(conversationId: string, limit?: number): Promise<Message[]>

  // Get or create conversation
  async getOrCreateConversation(userId: string, projectId?: string): Promise<Conversation>

  // Update learning context based on interactions
  async updateLearningContext(userId: string, subject: string, interactions: LearningInteraction[]): Promise<void>

  // Get user learning history for AI personalization
  async getUserLearningHistory(userId: string, subject?: string): Promise<LearningHistory>
}
```

### 3. AI Service Integration Layer

Create a new AI service abstraction that can support multiple AI providers:

```typescript
// src/lib/ai/aiService.ts
export interface AIServiceConfig {
  provider: 'openai' | 'ollama' | 'anthropic' | 'custom';
  apiKey?: string;
  endpoint?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface EducationalPromptContext {
  prompt: string;
  subject?: string;
  difficulty?: string;
  language?: string;
  conversationHistory?: Message[];
  learningObjectives?: string[];
  userLearningStyle?: string;
  projectContext?: ProjectContext;
}

export interface AIResponse {
  content: string;
  processingTime: number;
  metadata?: {
    model: string;
    tokens: number;
    confidence?: number;
  };
}

export abstract class AIService {
  abstract generateEducationalResponse(context: EducationalPromptContext): Promise<AIResponse>;
  abstract generateProjectAwareResponse(context: EducationalPromptContext): Promise<AIResponse>;
}

// Example OpenAI implementation
export class OpenAIService extends AIService {
  constructor(private config: AIServiceConfig) {
    super();
  }

  async generateEducationalResponse(context: EducationalPromptContext): Promise<AIResponse> {
    const prompt = this.buildEducationalPrompt(context);

    const response = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: 'system', content: this.getSystemPrompt(context) },
        ...this.formatConversationHistory(context.conversationHistory),
        { role: 'user', content: context.prompt }
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature
    });

    return {
      content: response.choices[0].message.content,
      processingTime: Date.now() - startTime,
      metadata: {
        model: response.model,
        tokens: response.usage?.total_tokens || 0
      }
    };
  }

  private getSystemPrompt(context: EducationalPromptContext): string {
    return `You are StemBot, an AI tutor specialized in ${context.subject || 'STEM education'}.

Your role:
- Provide educational guidance at ${context.difficulty || 'appropriate'} level
- Use ${context.language || 'English'} language
- Focus on understanding rather than just answers
- Encourage critical thinking and problem-solving
- Adapt to the student's learning style
- Provide step-by-step explanations when helpful

Context:
${context.projectContext ? `Current project: ${context.projectContext.name} - ${context.projectContext.description}` : 'General educational conversation'}
${context.learningObjectives ? `Learning objectives: ${context.learningObjectives.join(', ')}` : ''}

Always maintain an encouraging, supportive tone while being academically rigorous.`;
  }
}

// Example Ollama implementation for local processing
export class OllamaService extends AIService {
  async generateEducationalResponse(context: EducationalPromptContext): Promise<AIResponse> {
    const response = await fetch(`${this.config.endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        prompt: this.buildEducationalPrompt(context),
        stream: false
      })
    });

    const data = await response.json();

    return {
      content: data.response,
      processingTime: data.total_duration / 1000000, // Convert nanoseconds to milliseconds
      metadata: {
        model: this.config.model,
        tokens: data.eval_count || 0
      }
    };
  }
}
```

### 4. Client-Side Integration Updates

The existing ChatApi client (`src/lib/api/chatApi.ts`) is already designed to handle real API responses and requires minimal changes:

#### Enhanced Error Handling for AI Services

```typescript
// Add AI-specific error types
export class AIServiceError extends ChatApiError {
  constructor(message: string, details?: string) {
    super('AI_SERVICE_ERROR', message, details, 503);
    this.name = 'AIServiceError';
  }
}

export class AIRateLimitError extends ChatApiError {
  constructor(retryAfter?: number) {
    super('AI_RATE_LIMITED', 'AI service rate limit exceeded',
          retryAfter ? `Retry after ${retryAfter} seconds` : undefined, 429);
    this.name = 'AIRateLimitError';
  }
}
```

#### Response Type Enhancements

```typescript
// Enhanced response types for real AI integration
export interface EnhancedChatResponse extends ChatResponse {
  metadata?: {
    aiModel: string;
    tokensUsed: number;
    confidence?: number;
    suggestedFollowUps?: string[];
  };
}
```

### 5. Environment Configuration for AI Services

Add AI service configuration to environment variables:

```bash
# .env.local additions for WP5

# AI Service Configuration
AI_SERVICE_PROVIDER=openai  # or 'ollama', 'anthropic'
AI_MODEL=gpt-4
AI_API_KEY=your_api_key_here
AI_ENDPOINT=https://api.openai.com/v1  # For custom endpoints

# Ollama Configuration (for local processing)
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=llama2:7b

# AI Response Configuration
AI_MAX_TOKENS=1000
AI_TEMPERATURE=0.7
AI_REQUEST_TIMEOUT=30000

# Feature Flags
ENABLE_AI_CONVERSATION_HISTORY=true
ENABLE_AI_LEARNING_ANALYTICS=true
ENABLE_AI_RESPONSE_CACHING=false
```

### 6. Testing Strategy for AI Integration

#### Unit Tests for AI Service

```typescript
// src/lib/ai/__tests__/aiService.test.ts
describe('AIService', () => {
  describe('OpenAI Integration', () => {
    it('should generate educational responses', async () => {
      const aiService = new OpenAIService(config);
      const response = await aiService.generateEducationalResponse({
        prompt: 'Explain photosynthesis',
        subject: 'science',
        difficulty: 'intermediate',
        language: 'en'
      });

      expect(response.content).toBeTruthy();
      expect(response.processingTime).toBeGreaterThan(0);
    });
  });

  describe('Project-Aware Responses', () => {
    it('should include project context in responses', async () => {
      // Test project-specific response generation
    });
  });
});
```

#### Integration Tests

```typescript
// src/__tests__/integration/chat-api.test.ts
describe('Chat API with Real AI', () => {
  it('should handle end-to-end chat flow', async () => {
    // Test complete chat flow from API to AI service
  });

  it('should handle AI service failures gracefully', async () => {
    // Test error handling and fallback responses
  });
});
```

### 7. Performance Optimization for AI Integration

#### Response Caching Strategy

```typescript
// src/lib/ai/cache.ts
export class AIResponseCache {
  // Cache similar questions to reduce AI API calls
  async getCachedResponse(prompt: string, context: EducationalPromptContext): Promise<AIResponse | null>

  // Store AI responses for future use
  async cacheResponse(prompt: string, context: EducationalPromptContext, response: AIResponse): Promise<void>

  // Invalidate cache when learning context changes
  async invalidateUserCache(userId: string): Promise<void>
}
```

#### Streaming Responses (Advanced)

```typescript
// For real-time response streaming
export interface StreamingAIResponse {
  content: AsyncIterable<string>;
  metadata: Promise<AIResponseMetadata>;
}

export abstract class StreamingAIService extends AIService {
  abstract generateStreamingResponse(context: EducationalPromptContext): Promise<StreamingAIResponse>;
}
```

### 8. Privacy and Security Considerations

#### Data Privacy for AI Processing

```typescript
// src/lib/ai/privacy.ts
export class PrivacyFilter {
  // Remove or anonymize sensitive information before sending to AI
  static filterSensitiveData(content: string): string {
    // Remove personal information, email addresses, phone numbers, etc.
    return content
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
      .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD]');
  }

  // Ensure responses don't contain inappropriate content
  static validateAIResponse(response: string): boolean {
    // Content validation logic
    return true;
  }
}
```

#### Local AI Processing Option

```typescript
// For Dutch education privacy requirements
export class LocalAIService extends AIService {
  // Use local Ollama instance for complete data privacy
  async generateEducationalResponse(context: EducationalPromptContext): Promise<AIResponse> {
    // Process entirely on local infrastructure
    // No data leaves the educational institution
  }
}
```

### 9. Migration Steps from Mock to Real AI

#### Phase 1: Infrastructure Setup
1. Set up AI service accounts (OpenAI, Anthropic, or local Ollama)
2. Configure environment variables
3. Implement database schema changes
4. Deploy AIService implementations

#### Phase 2: Gradual Rollout
1. Enable AI for specific subjects first (e.g., start with Math)
2. A/B test AI responses vs mock responses
3. Monitor performance and user satisfaction
4. Gradually expand to all subjects

#### Phase 3: Advanced Features
1. Implement conversation history persistence
2. Add learning analytics and personalization
3. Integrate assessment and progress tracking
4. Deploy streaming responses for real-time interaction

### 10. Monitoring and Analytics

#### AI Performance Metrics

```typescript
// src/lib/analytics/aiMetrics.ts
export interface AIMetrics {
  responseTime: number;
  userSatisfaction: number;
  tokensUsed: number;
  costPerInteraction: number;
  errorRate: number;
  subjectAccuracy: number;
}

export class AIAnalytics {
  // Track AI performance metrics
  async recordInteraction(metrics: AIMetrics): Promise<void>

  // Generate AI performance reports
  async generatePerformanceReport(dateRange: DateRange): Promise<AIPerformanceReport>

  // Monitor for AI quality issues
  async detectQualityIssues(): Promise<QualityAlert[]>
}
```

## Summary

The current StemBot chat system provides a complete foundation for AI integration with:

- ✅ **Complete API Infrastructure**: Ready for real AI backend integration
- ✅ **TypeScript Client**: Comprehensive error handling and type safety
- ✅ **Educational Context**: Subject-aware and project-specific responses
- ✅ **Mock System**: Demonstrates expected AI behavior patterns
- ✅ **Error Handling**: Robust error recovery and user feedback
- ✅ **Performance**: Realistic processing times and optimized user experience

**Next Steps for WP5:**
1. Choose AI service provider (OpenAI, Anthropic, local Ollama)
2. Implement AIService interface for chosen provider
3. Set up database schema for conversation persistence
4. Configure environment variables and deploy
5. Test and monitor AI integration performance

The architecture is designed to support seamless transition from mock responses to real AI while maintaining all existing functionality and user experience quality.