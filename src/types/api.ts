/**
 * API Type Definitions
 *
 * Comprehensive TypeScript interfaces for API requests, responses,
 * and error handling across the research mentoring platform.
 *
 * @location src/types/api.ts
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
  requestId?: string;
}

/**
 * API error structure with detailed information
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string; // For validation errors
  statusCode: number;
  stack?: string; // Only in development
}

/**
 * Pagination metadata for list endpoints
 */
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  page?: number;
  totalPages?: number;
  hasMore: boolean;
  nextCursor?: string;
  prevCursor?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  filters?: Record<string, any>;
  sort?: SortOptions;
}

/**
 * Sorting options for list endpoints
 */
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
  secondary?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

/**
 * Common query parameters for list endpoints
 */
export interface ListQueryParams {
  limit?: number;
  offset?: number;
  page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
  include?: string[]; // Related data to include
}

/**
 * Authentication API types
 */
export namespace AuthApi {
  export interface LoginRequest {
    email: string;
    password: string;
    remember?: boolean;
    twoFactorCode?: string;
  }

  export interface LoginResponse {
    user: {
      id: string;
      email: string;
      role: string;
      profile?: any;
    };
    session: {
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
    };
    requiresTwoFactor?: boolean;
  }

  export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    institution: string;
    fieldOfStudy: string;
    role: 'researcher';
    acceptTerms: boolean;
    acceptPrivacy: boolean;
    inviteToken?: string;
  }

  export interface RegisterResponse {
    user: {
      id: string;
      email: string;
      emailVerified: boolean;
    };
    session?: {
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
    };
    requiresEmailVerification: boolean;
  }

  export interface RefreshTokenRequest {
    refreshToken: string;
  }

  export interface PasswordResetRequest {
    email: string;
  }

  export interface PasswordUpdateRequest {
    currentPassword: string;
    newPassword: string;
  }
}

/**
 * Projects API types
 */
export namespace ProjectsApi {
  export interface CreateProjectRequest {
    title: string;
    description: string;
    field: string;
    initialQuestion: string;
    objectives: string[];
    significance: string;
    timeframe?: string;
    methodology?: string;
    priorKnowledge?: string;
    isPublic?: boolean;
    collaborators?: string[];
  }

  export interface UpdateProjectRequest {
    title?: string;
    description?: string;
    stage?: string;
    priority?: string;
    tags?: string[];
    metadata?: Record<string, any>;
  }

  export interface ProjectResponse {
    id: string;
    title: string;
    description: string;
    field: string;
    stage: string;
    progress: {
      overall: number;
      byStage: Record<string, number>;
    };
    milestones: any[];
    deadlines: any[];
    memoryContext: any;
    createdAt: string;
    updatedAt: string;
  }

  export interface ProjectListResponse extends PaginatedResponse<ProjectResponse> {}

  export interface ProjectFilters {
    stage?: string[];
    field?: string[];
    priority?: string[];
    tags?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
    hasDeadlines?: boolean;
    isPublic?: boolean;
  }
}

/**
 * Memory API types
 */
export namespace MemoryApi {
  export interface StoreMemoryRequest {
    projectId: string;
    type: 'factual' | 'procedural' | 'contextual';
    content: string;
    source?: string;
    tags?: string[];
    importance?: number;
    reliability?: number;
    metadata?: Record<string, any>;
  }

  export interface RecallMemoryRequest {
    projectId: string;
    query: string;
    types?: string[];
    tags?: string[];
    maxResults?: number;
    minRelevance?: number;
    timeRange?: {
      start: string;
      end: string;
    };
  }

  export interface MemoryResponse {
    id: string;
    type: string;
    content: string;
    source?: string;
    tags: string[];
    importance: number;
    relevance?: number;
    createdAt: string;
    lastAccessed?: string;
  }

  export interface ContextResponse {
    projectId: string;
    stage: string;
    recentMemories: MemoryResponse[];
    relevantContext: string[];
    suggestions: string[];
    confidence: number;
  }
}

/**
 * AI/Chat API types
 */
export namespace ChatApi {
  export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    metadata?: {
      type?: 'question' | 'suggestion' | 'feedback';
      stage?: string;
      confidence?: number;
      sources?: string[];
    };
  }

  export interface ChatRequest {
    message: string;
    projectId?: string;
    stage?: string;
    context?: string[];
    history?: ChatMessage[];
    preferences?: {
      style?: 'supportive' | 'challenging' | 'analytical';
      depth?: 'brief' | 'detailed' | 'comprehensive';
      includeExamples?: boolean;
    };
  }

  export interface ChatResponse {
    message: ChatMessage;
    suggestions?: string[];
    memoryUpdates?: string[];
    nextSteps?: string[];
    confidence: number;
    usage: {
      tokensUsed: number;
      estimatedCost: number;
    };
  }

  export interface ChatStreamResponse {
    id: string;
    delta: string;
    finished: boolean;
    metadata?: any;
  }
}

/**
 * Research API types (literature, methodology, etc.)
 */
export namespace ResearchApi {
  export interface LiteratureSearchRequest {
    query: string;
    fields?: string[];
    yearRange?: {
      start: number;
      end: number;
    };
    sources?: string[];
    maxResults?: number;
    sortBy?: 'relevance' | 'date' | 'citations';
  }

  export interface LiteratureItem {
    id: string;
    title: string;
    authors: string[];
    journal?: string;
    year: number;
    doi?: string;
    abstract?: string;
    citations: number;
    relevanceScore: number;
    tags: string[];
    accessUrl?: string;
  }

  export interface MethodologyRequest {
    researchQuestion: string;
    field: string;
    constraints?: {
      timeline?: string;
      budget?: string;
      resources?: string[];
    };
    preferences?: {
      type?: 'quantitative' | 'qualitative' | 'mixed';
      complexity?: 'simple' | 'moderate' | 'advanced';
    };
  }

  export interface MethodologyResponse {
    recommended: {
      type: string;
      description: string;
      steps: string[];
      timeline: string;
      resources: string[];
      pros: string[];
      cons: string[];
    }[];
    alternatives: any[];
    considerations: string[];
    examples: any[];
  }
}

/**
 * Billing API types
 */
export namespace BillingApi {
  export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: {
      monthly: number;
      yearly: number;
      currency: string;
    };
    features: string[];
    limits: {
      projects: number;
      aiInteractions: number;
      storage: number; // in GB
      collaborators: number;
    };
    popular?: boolean;
  }

  export interface BillingInfo {
    customerId: string;
    subscription?: {
      id: string;
      plan: SubscriptionPlan;
      status: 'active' | 'canceled' | 'past_due' | 'unpaid';
      currentPeriodStart: string;
      currentPeriodEnd: string;
      cancelAtPeriodEnd: boolean;
      trialEnd?: string;
    };
    usage: {
      projects: number;
      aiInteractions: number;
      storage: number;
      period: {
        start: string;
        end: string;
      };
    };
    paymentMethods: PaymentMethod[];
    invoices: Invoice[];
  }

  export interface PaymentMethod {
    id: string;
    type: 'card' | 'bank' | 'paypal';
    card?: {
      brand: string;
      last4: string;
      expMonth: number;
      expYear: number;
    };
    isDefault: boolean;
    createdAt: string;
  }

  export interface Invoice {
    id: string;
    number: string;
    amount: number;
    currency: string;
    status: 'paid' | 'pending' | 'failed' | 'refunded';
    date: string;
    dueDate: string;
    pdfUrl?: string;
  }

  export interface CreateSubscriptionRequest {
    planId: string;
    paymentMethodId: string;
    billingInterval: 'monthly' | 'yearly';
  }

  export interface UpdateBillingRequest {
    paymentMethodId?: string;
    billingAddress?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  }
}

/**
 * Analytics API types
 */
export namespace AnalyticsApi {
  export interface ProjectAnalyticsRequest {
    projectId: string;
    dateRange?: {
      start: string;
      end: string;
    };
    metrics?: string[];
  }

  export interface ProjectAnalyticsResponse {
    projectId: string;
    period: {
      start: string;
      end: string;
    };
    timeSpent: {
      total: number;
      byStage: Record<string, number>;
      trend: Array<{ date: string; hours: number }>;
    };
    productivity: {
      sessionsCount: number;
      averageSessionLength: number;
      mostActiveTime: string;
      efficiency: number;
    };
    progress: {
      milestonesCompleted: number;
      milestonesTotal: number;
      progressRate: number;
      estimatedCompletion: string;
    };
    aiUsage: {
      interactions: number;
      averagePerSession: number;
      satisfaction: number;
      topFeatures: string[];
    };
  }

  export interface PlatformAnalyticsResponse {
    users: {
      total: number;
      active: number;
      new: number;
      retention: number;
    };
    projects: {
      total: number;
      active: number;
      completed: number;
      averageCompletion: number;
    };
    usage: {
      aiInteractions: number;
      averageSessionLength: number;
      popularFeatures: string[];
    };
    performance: {
      responseTime: number;
      uptime: number;
      errorRate: number;
    };
  }
}

/**
 * File upload and management API types
 */
export namespace FilesApi {
  export interface UploadRequest {
    file: File;
    projectId?: string;
    category?: 'document' | 'image' | 'data' | 'reference';
    description?: string;
    tags?: string[];
  }

  export interface FileResponse {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    category: string;
    uploadedAt: string;
    metadata?: Record<string, any>;
  }

  export interface ProcessDocumentRequest {
    fileId: string;
    operations: Array<{
      type: 'extract_text' | 'summarize' | 'extract_citations' | 'analyze_structure';
      options?: Record<string, any>;
    }>;
  }

  export interface ProcessDocumentResponse {
    fileId: string;
    results: Array<{
      operation: string;
      success: boolean;
      data?: any;
      error?: string;
    }>;
    extractedText?: string;
    summary?: string;
    citations?: any[];
    structure?: any;
  }
}

/**
 * WebSocket API types for real-time features
 */
export namespace WebSocketApi {
  export interface WebSocketMessage {
    type: string;
    payload: any;
    timestamp: string;
    id?: string;
  }

  export interface ChatStreamMessage extends WebSocketMessage {
    type: 'chat_stream';
    payload: {
      sessionId: string;
      delta: string;
      finished: boolean;
      metadata?: any;
    };
  }

  export interface ProjectUpdateMessage extends WebSocketMessage {
    type: 'project_update';
    payload: {
      projectId: string;
      field: string;
      value: any;
      userId: string;
    };
  }

  export interface CollaborationMessage extends WebSocketMessage {
    type: 'collaboration';
    payload: {
      projectId: string;
      action: 'join' | 'leave' | 'cursor_move' | 'edit';
      userId: string;
      data?: any;
    };
  }
}

/**
 * Common HTTP status codes used by the API
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * API error codes for specific error conditions
 */
export const API_ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  TWO_FACTOR_REQUIRED: 'TWO_FACTOR_REQUIRED',

  // Authorization
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
  USAGE_LIMIT_EXCEEDED: 'USAGE_LIMIT_EXCEEDED',

  // Validation
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',

  // Resources
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',

  // External services
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',
  PAYMENT_PROCESSING_FAILED: 'PAYMENT_PROCESSING_FAILED',
  EMAIL_DELIVERY_FAILED: 'EMAIL_DELIVERY_FAILED',

  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
} as const;

/**
 * TODO: Additional API types to consider
 *
 * 1. Integration APIs:
 *    - External research databases
 *    - Reference management systems
 *    - Institutional repositories
 *    - Academic social networks
 *
 * 2. Advanced features:
 *    - Real-time collaboration
 *    - Voice/video call integration
 *    - Mobile app sync
 *    - Offline mode support
 *
 * 3. Administrative APIs:
 *    - User management
 *    - System monitoring
 *    - Content moderation
 *    - Analytics and reporting
 */