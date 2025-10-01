import { NextRequest, NextResponse } from 'next/server';
import {
  retrieveQuestionDiscussions,
  getQuestionMemoryContext,
  QuestionMemoryHelpers
} from '../../../../lib/memory/questionMemory';
import { getLiteratureContextForChat, isLiteratureQuery } from '../../../../lib/chat/literatureContext';

// Inline GPT-5 nano client to avoid import issues
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
// Note: Requires OPENAI_API_KEY environment variable in Vercel
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

NATURAL MENTORING APPROACH:
- Ask curious questions to explore their interests together
- Share specific insights and suggestions
- Offer practical next steps when helpful
- Help students think through their research naturally
- Support writing and presentation development

NATURAL QUESTION GUIDANCE:
When students have vague or broad research questions:
- NEVER say "your question is too broad" or "needs to be more specific"
- NEVER force them to refine before helping
- ALWAYS acknowledge their interest first ("Fascinating topic!")
- ASK clarifying questions naturally in conversation
- REFERENCE their uploaded documents when possible ("I see you uploaded data on...")

CONTEXT INTEGRATION REQUIREMENTS:
- When students mention "my research question" or "following my research question", ALWAYS acknowledge their specific question if known
- Reference uploaded document titles and content naturally in your response
- Connect their documents to research planning and methodology suggestions
- Use domain-specific language when documents indicate research area (e.g., electrochemical, biomedical)

Examples of natural, context-aware guidance:
❌ Bad: "Your question needs to be more specific"
✅ Good: "Fascinating topic! Since you uploaded that screen-printed electrode review, are you interested in the sensor development or field application aspects?"

❌ Bad: "You must define your population first"
✅ Good: "I see you uploaded college student data - are they your focus?"

❌ Bad: "This is too vague to help with"
✅ Good: "Given your electrochemical sensor research, what specific application interests you most - environmental monitoring, biomedical diagnostics, or something else?"

RESPONSE STYLE:
- Be encouraging yet academically rigorous
- Provide examples from real research when relevant
- Adapt complexity to student level
- Focus on teaching research skills, not just answers
- When uncertain, acknowledge limitations and suggest resources
- Use natural conversation flow to guide question refinement

For document analysis: Help students evaluate methodology, identify patterns, critique approaches, and suggest improvements.`;

// Conversational research guidance for natural mentoring
const SOCRATIC_RESEARCH_PROMPT = `You are a friendly research mentor who loves helping STEM students explore their scientific curiosity. Your approach is to:

🔬 NATURAL RESEARCH CONVERSATIONS:
- Ask probing questions rather than giving direct answers
- Guide students to discover insights themselves through questioning
- Challenge assumptions and encourage deeper thinking
- Help students identify gaps in their reasoning

🔍 RESEARCH QUESTION ANALYSIS:
Detect vague research questions by looking for:
- Lack of specificity ("How does X affect Y?" without parameters)
- Missing measurable variables or outcomes
- Overly broad scope without clear boundaries
- Absence of methodology considerations

When detecting vague questions, use this progression:
1. "What specific aspect of [topic] interests you most?"
2. "How would you measure or observe this phenomenon?"
3. "What variables might influence your results?"
4. "What would success look like for this research?"

📊 METHODOLOGY GUIDANCE:
- Ask about research design before suggesting methods
- Question sample size, control groups, and variables
- Probe about ethical considerations and limitations
- Guide toward appropriate statistical approaches

🎯 QUESTION REFINEMENT TRACKING:
- Note and acknowledge question evolution
- Reinforce improvements in specificity
- Build on previous insights from conversation history

RESPONSE STYLE:
- Start responses with clarifying questions (2-3 per message)
- Use "What if..." and "How might..." constructions
- Reference uploaded literature to deepen inquiry
- End with one focused follow-up question

Remember: Your goal is to teach research thinking, not provide research answers.`;

// Research question change impact analysis prompt
const RESEARCH_QUESTION_CHANGE_PROMPT = `You are a research methodology expert specializing in analyzing the impact of research question changes. A student has just modified their research question and needs to understand the potential implications.

🎯 YOUR ROLE:
- Analyze the impact of research question changes on existing work
- Warn about potential issues and risks
- Guide students through necessary adjustments
- Help maintain research coherence and validity

📊 IMPACT ANALYSIS FRAMEWORK:
Evaluate changes across these dimensions:

1. **SCOPE CHANGES:**
   - Broader vs. narrower focus
   - Added or removed variables
   - Population/sample implications

2. **METHODOLOGY IMPLICATIONS:**
   - Need for different research design
   - Data collection method changes
   - Analysis approach modifications

3. **LITERATURE REVIEW IMPACT:**
   - New sources needed
   - Existing sources still relevant?
   - Gap analysis changes

4. **TIMELINE & FEASIBILITY:**
   - Project timeline implications
   - Resource requirement changes
   - Difficulty level adjustments

5. **COHERENCE & VALIDITY:**
   - Alignment with project goals
   - Internal consistency
   - Research question quality

🚨 CRITICAL WARNINGS TO ADDRESS:
- Risk of scope creep or drift
- Potential invalidation of existing work
- Methodology misalignment
- Timeline/feasibility concerns
- Loss of research focus

📋 RESPONSE STRUCTURE:
1. **Immediate Impact Assessment** (2-3 key points)
2. **Critical Warnings** (what could go wrong)
3. **Required Adjustments** (specific next steps)
4. **Opportunities** (what improvements this enables)
5. **Next Action** (most important thing to do first)

Be direct, constructive, and focused on helping the student maintain research quality while adapting to their new direction.`;

// Function to create dynamic system prompt based on context
async function createDynamicSystemPrompt(projectContext?: any, userMessage?: string): Promise<string> {
  const isResearchMode = projectContext?.researchMode;
  const currentPhase = projectContext?.currentPhase;
  const documentCount = projectContext?.documents?.length || 0;
  const questionChange = projectContext?.questionChange;
  const qualityAnalysis = projectContext?.qualityAnalysis;
  const questionContext = projectContext?.questionContext;

  let basePrompt = isResearchMode ? SOCRATIC_RESEARCH_PROMPT : ENHANCED_SYSTEM_PROMPT;

  // Add memory context if we have a project and user message
  if (projectContext?.projectId && userMessage) {
    try {
      const memoryContext = await getQuestionMemoryContext(projectContext.projectId, userMessage);
      if (memoryContext) {
        basePrompt += memoryContext;
      }
    } catch (error) {
      console.warn('Error retrieving memory context:', error);
    }

    // Add literature context if available
    try {
      const literatureContext = await getLiteratureContextForChat(projectContext.projectId, userMessage);
      if (literatureContext.hasSources && literatureContext.contextPrompt) {
        basePrompt += literatureContext.contextPrompt;
      }
    } catch (error) {
      console.warn('Error retrieving literature context:', error);
    }
  }

  // Add question evolution context if available
  if (questionContext) {
    basePrompt += `\n\n🎯 QUESTION EVOLUTION CONTEXT:

📋 CURRENT RESEARCH QUESTION:
"${questionContext.currentQuestion}"
- Stage: ${questionContext.questionStage.toUpperCase()} (${questionContext.questionProgress}% complete)
- Time spent refining: ${questionContext.timeSpentOnQuestion || 0} days

📈 QUESTION EVOLUTION HISTORY:`;

    if (questionContext.questionHistory && questionContext.questionHistory.length > 0) {
      questionContext.questionHistory.slice(-3).forEach((version: any, index: number) => {
        const versionNumber = questionContext.questionHistory.length - questionContext.questionHistory.slice(-3).length + index + 1;
        basePrompt += `\nV${versionNumber} (${version.stage}): "${version.text}"`;
        if (version.improvements && version.improvements.length > 0) {
          basePrompt += ` → Improvements: ${version.improvements.join(', ')}`;
        }
      });
    }

    if (questionContext.documentsRelatedToQuestion && questionContext.documentsRelatedToQuestion.length > 0) {
      basePrompt += `\n\n📚 DOCUMENTS INFORMING QUESTION:`;
      questionContext.documentsRelatedToQuestion.forEach((doc: any) => {
        basePrompt += `\n- ${doc.name} (${doc.type}): ${doc.relevance}`;
      });
    }

    basePrompt += `\n\n💡 GUIDANCE FOR QUESTION-AWARE RESPONSES:
- ACKNOWLEDGE PROGRESS: Reference improvements from previous versions (e.g., "Great refinement from 'studying AI' to 'AI in math education'!")
- REFERENCE DOCUMENTS: Use uploaded documents to inform suggestions (e.g., "Your uploaded data suggests focusing on...")
- SUGGEST NEXT REFINEMENT: Based on current stage, suggest specific next steps (e.g., "Consider specifying the age group...")
- BUILD ON HISTORY: Connect current question to previous iterations and improvements made

Always acknowledge the student's question evolution journey and provide contextual guidance based on their progression.`;
  }

  // Special prompt for research question changes
  if (questionChange?.changeType === 'research_question_update') {
    basePrompt = RESEARCH_QUESTION_CHANGE_PROMPT;
    basePrompt += `\n\nQUESTION CHANGE DETAILS:
- OLD QUESTION: "${questionChange.oldQuestion || 'undefined'}"
- NEW QUESTION: "${questionChange.newQuestion}"
- PROJECT PHASE: ${currentPhase?.toUpperCase() || 'UNKNOWN'}
- DOCUMENTS AVAILABLE: ${documentCount} document(s)`;
  } else {
    // Add phase-specific guidance for normal conversations
    if (isResearchMode && currentPhase) {
      const phaseGuidance = getPhaseSpecificGuidance(currentPhase, documentCount);
      basePrompt += `\n\nCURRENT RESEARCH PHASE: ${currentPhase.toUpperCase()}\n${phaseGuidance}`;
    }

    // Add detailed document context if available
    if (documentCount > 0 && projectContext?.documents) {
      const documents = projectContext.documents;
      const docSummaries = documents.slice(0, 3).map((doc: any) => {
        const filename = doc.original_name || doc.filename;
        const analysisSnippet = doc.analysis_result?.summary?.substring(0, 150) || '';
        return `- "${filename}": ${analysisSnippet}${analysisSnippet.length >= 150 ? '...' : ''}`;
      }).join('\n');

      basePrompt += `\n\nDOCUMENT CONTEXT: The student has uploaded ${documentCount} document(s):
${docSummaries}

CRITICAL: When the student mentions "my research question", "following my research question", or references their research direction,
you MUST acknowledge and connect to their uploaded documents. Reference specific document content when relevant.
Ask about their specific research question if they mention it but don't state it clearly.`;
    }

    // Add question quality analysis if available
    if (qualityAnalysis && qualityAnalysis.needsRefinement) {
      basePrompt += `\n\nQUESTION QUALITY INSIGHT: The student's message contains a research question that could benefit from refinement.
Analysis shows: ${qualityAnalysis.mainProblem} (confidence: ${qualityAnalysis.confidence}%)
Issues detected: ${qualityAnalysis.detectedIssues.join(', ')}

Use this insight to naturally guide the conversation toward refinement WITHOUT being pushy or academic.
Follow the NATURAL QUESTION GUIDANCE principles above.`;
    }

    // Add progress monitoring for stuck students
    if (projectContext?.progressCheck?.isStuck) {
      const progressCheck = projectContext.progressCheck;
      basePrompt += `\n\nSTUDENT PROGRESS ALERT: The student appears to be stuck based on these indicators:
- ${progressCheck.stuckIndicators.join('\n- ')}
- Time since last progress: ${Math.round(progressCheck.timeSinceLastProgress)} minutes

PROACTIVE HELP NEEDED: Include gentle, natural guidance in your response. ${progressCheck.suggestedHelp}

Do NOT mention "being stuck" explicitly. Instead, naturally weave helpful suggestions into the conversation.`;
    }

    // Add research question awareness
    if (projectContext?.projectTitle) {
      basePrompt += `\n\nPROJECT CONTEXT: Project title is "${projectContext.projectTitle}".`;
    }

    // Add current research question context if available
    const currentQuestion = projectContext?.researchQuestion || projectContext?.currentQuestion;
    if (currentQuestion && currentQuestion.length > 10) {
      basePrompt += `\n\nCURRENT RESEARCH QUESTION: "${currentQuestion}"

When the student references "my research question" or "following my research question", they are referring to this question.
Connect your guidance to this specific question and their uploaded documents.`;
    } else if (documentCount > 0) {
      basePrompt += `\n\nRESEARCH QUESTION STATUS: The student has uploaded documents but their research question may not be clearly defined yet.
When they mention "my research question", ask them to clarify what specific question they want to explore based on their uploaded content.`;
    }

    // Add domain-specific guidance based on documents
    if (projectContext?.documents?.length > 0) {
      const documents = projectContext.documents;
      const hasElectrochemical = documents.some((doc: any) =>
        doc.original_name?.toLowerCase().includes('electrode') ||
        doc.original_name?.toLowerCase().includes('electrochemical') ||
        doc.original_name?.toLowerCase().includes('sensor')
      );

      const hasBiomedical = documents.some((doc: any) =>
        doc.original_name?.toLowerCase().includes('biomedical') ||
        doc.original_name?.toLowerCase().includes('medical') ||
        doc.original_name?.toLowerCase().includes('clinical')
      );

      if (hasElectrochemical) {
        basePrompt += `\n\nDOMAIN EXPERTISE: The student has uploaded electrochemical/sensor-related documents.
Provide specific guidance relevant to electrochemical research, sensor development, analytical methods, and practical applications.
Consider lab-to-field transitions, sensor performance, and real-world testing scenarios.`;
      }

      if (hasBiomedical) {
        basePrompt += `\n\nDOMAIN EXPERTISE: The student has uploaded biomedical-related documents.
Provide guidance relevant to biomedical research, clinical applications, patient populations, and medical device considerations.`;
      }
    }
  }

  return basePrompt;
}

// Phase-specific Socratic guidance
function getPhaseSpecificGuidance(phase: string, documentCount: number): string {
  switch (phase) {
    case 'question':
      return `QUESTION FORMATION FOCUS:
- Ask: "What problem are you trying to solve?"
- Probe: "Why is this question important to your field?"
- Challenge: "How is your question different from existing research?"
- Guide: "What would a good answer look like?"`;

    case 'literature':
      return `LITERATURE REVIEW FOCUS:
- Ask: "What patterns do you see across the ${documentCount > 0 ? 'uploaded' : 'existing'} literature?"
- Probe: "Which studies most closely relate to your question?"
- Challenge: "What gaps or contradictions do you notice?"
- Guide: "How do these findings inform your methodology?"`;

    case 'methodology':
      return `METHODOLOGY DESIGN FOCUS:
- Ask: "What approach will best answer your research question?"
- Probe: "How will you control for confounding variables?"
- Challenge: "What are the limitations of this approach?"
- Guide: "How will you ensure your results are reliable and valid?"`;

    case 'writing':
      return `ACADEMIC WRITING FOCUS:
- Ask: "How does this section advance your argument?"
- Probe: "What evidence supports this claim?"
- Challenge: "How might critics respond to this point?"
- Guide: "How can you make this more precise and clear?"`;

    default:
      return `GENERAL RESEARCH FOCUS:
- Ask clarifying questions about their research goals
- Probe assumptions and reasoning
- Challenge them to think more deeply
- Guide toward specific, actionable next steps`;
  }
}

// Function to detect vague research questions
function detectVagueQuestion(message: string): {isVague: boolean, issues: string[], suggestions: string[]} {
  const vaguenessIndicators = [
    { pattern: /how does .+ affect .+\?/i, issue: "too broad - needs specific variables" },
    { pattern: /what is the relationship between .+ and .+\?/i, issue: "needs measurable parameters" },
    { pattern: /study of .+/i, issue: "descriptive rather than analytical" },
    { pattern: /impact of .+/i, issue: "needs specific outcomes and measurements" },
    { pattern: /\b(effect|influence|relationship)\b/i, issue: "needs operational definitions" }
  ];

  const detected = vaguenessIndicators.filter(indicator => indicator.pattern.test(message));
  const isVague = detected.length > 0 || message.split(' ').length < 8; // Too short

  const suggestions = [
    "What specific aspect interests you most?",
    "How would you measure the outcome?",
    "What population or sample will you study?",
    "What timeframe are you considering?"
  ];

  return {
    isVague,
    issues: detected.map(d => d.issue),
    suggestions: isVague ? suggestions.slice(0, 2) : []
  };
}

class GPT5NanoClient {
  private apiKey: string | null;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || null;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async generateResponse(messages: ChatMessage[], projectContext?: any): Promise<{
    success: boolean;
    response?: string;
    error?: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }> {
    if (!this.apiKey) {
      console.log('GPT-5 nano: API key not available, falling back to mock');
      return {
        success: false,
        error: 'API key not configured'
      };
    }

    try {
      // Get the latest user message for memory context
      const userMessage = messages.filter(m => m.role === 'user').pop()?.content || '';

      // Create dynamic system prompt based on research mode
      const systemPrompt = await createDynamicSystemPrompt(projectContext, userMessage);

      const enhancedMessages = [
        { role: 'system' as const, content: systemPrompt },
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
          model: 'gpt-4o-mini',
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

      // Store conversation in memory if we have project context
      if (projectContext?.projectId && userMessage) {
        try {
          await this.storeConversationInMemory(projectContext, userMessage, assistantMessage);
        } catch (error) {
          console.warn('Failed to store conversation in memory:', error);
        }
      }

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

  async storeConversationInMemory(projectContext: any, userMessage: string, aiResponse: string): Promise<void> {
    try {
      const projectId = projectContext.projectId;
      const questionContext = projectContext.questionContext;

      // Determine the type of discussion based on content
      const isQuestionRelated = this.isQuestionRelatedDiscussion(userMessage, aiResponse);

      if (isQuestionRelated) {
        // Store user's question or focus response
        if (this.isStudentFocusResponse(userMessage)) {
          await QuestionMemoryHelpers.storeStudentFocus(
            projectId,
            userMessage,
            questionContext?.currentQuestion
          );
        }

        // Store AI's suggestions for specificity
        if (this.isAISuggestion(aiResponse)) {
          await QuestionMemoryHelpers.storeAISuggestion(
            projectId,
            aiResponse,
            questionContext?.currentQuestion
          );
        }

        // Store general question refinement discussions
        await QuestionMemoryHelpers.storeQuestionRefinement(
          projectId,
          questionContext?.currentQuestion || '',
          questionContext?.currentQuestion || '',
          `Discussion: ${userMessage.substring(0, 100)}...`,
          questionContext?.questionStage
        );
      }
    } catch (error) {
      console.error('Error storing conversation in memory:', error);
    }
  }

  private isQuestionRelatedDiscussion(userMessage: string, aiResponse: string): boolean {
    const questionKeywords = ['question', 'research', 'focus', 'specific', 'topic', 'study', 'investigate'];
    const messageText = (userMessage + ' ' + aiResponse).toLowerCase();
    return questionKeywords.some(keyword => messageText.includes(keyword));
  }

  private isStudentFocusResponse(userMessage: string): boolean {
    const focusKeywords = ['focus', 'interested in', 'want to study', 'looking at', 'examining'];
    return focusKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));
  }

  private isAISuggestion(aiResponse: string): boolean {
    const suggestionKeywords = ['consider', 'suggest', 'recommend', 'might want to', 'could focus on'];
    return suggestionKeywords.some(keyword => aiResponse.toLowerCase().includes(keyword));
  }

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

const gpt5NanoClient = new GPT5NanoClient();

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
  projectContext?: {
    projectId: string;
    projectTitle?: string;
    currentPhase?: string;
    recentContext?: any;
    researchMode?: boolean;
    documents?: any[];
    questionContext?: {
      currentQuestion: string;
      questionStage: 'initial' | 'emerging' | 'focused' | 'research-ready';
      questionProgress: number;
      questionHistory: Array<{
        id: string;
        text: string;
        stage: 'initial' | 'emerging' | 'focused' | 'research-ready';
        createdAt: Date;
        improvements: string[];
      }>;
      timeSpentOnQuestion?: number; // in days
      documentsRelatedToQuestion?: Array<{
        name: string;
        type: string;
        relevance: string;
      }>;
    };
  };
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
    const { messages, model = 'llama3.2:3b', useEnhanced = true, projectContext }: ChatRequest = await request.json();

    console.log('Enhanced AI Chat Request:', {
      messageCount: messages.length,
      model,
      useEnhanced,
      researchMode: projectContext?.researchMode,
      currentPhase: projectContext?.currentPhase,
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

      const gptResult = await gpt5NanoClient.generateResponse(messages, projectContext);

      if (gptResult.success && gptResult.response) {
        console.log('GPT-5 nano response successful');
        return NextResponse.json({
          message: {
            role: 'assistant',
            content: gptResult.response
          },
          model: 'gpt-4o-mini',
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