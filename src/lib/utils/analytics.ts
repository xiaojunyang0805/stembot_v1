/**
 * Analytics Tracking Utilities
 * 
 * Comprehensive analytics system for tracking user interactions, learning progress,
 * and educational effectiveness in the StemBot application.
 * 
 * Location: src/lib/utils/analytics.ts
 */

import { logger } from './logger';

// Define constants inline to avoid dependency issues
const ANALYTICS_CONSTANTS = {
  FEATURES: {
    ANALYTICS: true,
  },
  SUBJECTS: ['math', 'science', 'coding'] as const,
  USER_ROLES: ['student', 'educator', 'parent'] as const,
} as const;

// Analytics Event Types with proper optional property handling
export interface BaseEvent {
  eventId: string;
  timestamp: string;
  userId?: string | undefined;
  sessionId: string;
  userRole?: string | undefined;
  deviceInfo: {
    userAgent: string;
    screenSize: string;
    viewport: string;
    platform: string;
  };
  page: {
    url: string;
    title: string;
    referrer: string;
  };
}

export interface UserEvent extends BaseEvent {
  type: 'user_action';
  action: string;
  category: string;
  label?: string | undefined;
  value?: number | undefined;
  properties?: Record<string, any> | undefined;
}

export interface LearningEvent extends BaseEvent {
  type: 'learning';
  subject: string;
  topic: string;
  action: 'start' | 'progress' | 'complete' | 'help_request';
  projectId: string;
  progressBefore?: number | undefined;
  progressAfter?: number | undefined;
  timeSpent?: number | undefined;
  accuracy?: number | undefined;
  hintsUsed?: number | undefined;
  attemptsCount?: number | undefined;
}

export interface AIEvent extends BaseEvent {
  type: 'ai_interaction';
  action: 'query' | 'response' | 'error' | 'feedback';
  model?: string | undefined;
  promptLength?: number | undefined;
  responseLength?: number | undefined;
  processingTime?: number | undefined;
  subject?: string | undefined;
  topicCategory?: string | undefined;
  qualityRating?: number | undefined;
}

export interface PerformanceEvent extends BaseEvent {
  type: 'performance';
  metric: string;
  value: number;
  unit: string;
  context?: string | undefined;
  criticalPath?: boolean | undefined;
}

export interface ErrorEvent extends BaseEvent {
  type: 'error';
  errorType: string;
  errorMessage: string;
  errorStack?: string | undefined;
  component?: string | undefined;
  action?: string | undefined;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userImpact: 'none' | 'minor' | 'major' | 'blocking';
}

export interface GameEvent extends BaseEvent {
  type: 'gamification';
  action: 'badge_earned' | 'streak_updated' | 'level_up' | 'achievement_viewed';
  badgeId?: string | undefined;
  badgeRarity?: string | undefined;
  streakDays?: number | undefined;
  level?: number | undefined;
  xpGained?: number | undefined;
}

export type AnalyticsEvent = UserEvent | LearningEvent | AIEvent | PerformanceEvent | ErrorEvent | GameEvent;

// Analytics Configuration
interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  batchSize: number;
  flushInterval: number;
  storageKey: string;
  maxRetries: number;
  endpoints: {
    events: string;
    batch: string;
  };
  sampling: {
    performance: number;
    errors: number;
    user: number;
  };
}

class Analytics {
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private sessionId: string;
  private flushTimer?: NodeJS.Timeout;
  private userId?: string | undefined;
  private userRole?: string | undefined;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enabled: ANALYTICS_CONSTANTS.FEATURES.ANALYTICS && process.env.NODE_ENV === 'production',
      debug: process.env.NODE_ENV === 'development',
      batchSize: 50,
      flushInterval: 30000, // 30 seconds
      storageKey: 'stembot_analytics_queue',
      maxRetries: 3,
      endpoints: {
        events: '/api/analytics/events',
        batch: '/api/analytics/batch',
      },
      sampling: {
        performance: 0.1, // 10%
        errors: 1.0, // 100%
        user: 1.0, // 100%
      },
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.loadQueuedEvents();
    this.startPeriodicFlush();
    this.setupPageTracking();
  }

  private generateSessionId(): string {
    return `analytics-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadQueuedEvents(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.eventQueue = parsed;
        }
      }
    } catch (error) {
      logger.warn('Failed to load queued analytics events', error);
    }
  }

  private saveQueuedEvents(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(this.eventQueue));
    } catch (error) {
      logger.warn('Failed to save analytics queue', error);
    }
  }

  private startPeriodicFlush(): void {
    if (!this.config.enabled) return;

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private setupPageTracking(): void {
    if (typeof window === 'undefined') return;

    // Track page views
    let currentPath = window.location.pathname;
    this.trackPageView();

    // Listen for navigation changes (SPA)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args: Parameters<typeof history.pushState>) => {
      originalPushState.apply(history, args);
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        this.trackPageView();
      }
    };

    history.replaceState = (...args: Parameters<typeof history.replaceState>) => {
      originalReplaceState.apply(history, args);
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        this.trackPageView();
      }
    };

    // Listen for back/forward navigation
    window.addEventListener('popstate', () => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        this.trackPageView();
      }
    });
  }

  private createBaseEvent(): BaseEvent {
    const baseEvent: BaseEvent = {
      eventId: this.generateEventId(),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      deviceInfo: this.getDeviceInfo(),
      page: this.getPageInfo(),
    };

    // Only add optional properties if they have values
    if (this.userId !== undefined) {
      baseEvent.userId = this.userId;
    }
    if (this.userRole !== undefined) {
      baseEvent.userRole = this.userRole;
    }

    return baseEvent;
  }

  private generateEventId(): string {
    return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceInfo() {
    if (typeof window === 'undefined') {
      return {
        userAgent: '',
        screenSize: '',
        viewport: '',
        platform: '',
      };
    }

    return {
      userAgent: navigator.userAgent || '',
      screenSize: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      platform: navigator.platform || '',
    };
  }

  private getPageInfo() {
    if (typeof window === 'undefined') {
      return {
        url: '',
        title: '',
        referrer: '',
      };
    }

    return {
      url: window.location.href,
      title: document.title || '',
      referrer: document.referrer || '',
    };
  }

  private shouldSample(type: keyof AnalyticsConfig['sampling']): boolean {
    return Math.random() < this.config.sampling[type];
  }

  private async sendBatch(events: AnalyticsEvent[]): Promise<void> {
    if (!this.config.enabled || events.length === 0) return;

    try {
      const response = await fetch(this.config.endpoints.batch, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });

      if (!response.ok) {
        throw new Error(`Analytics batch API error: ${response.status}`);
      }

      if (this.config.debug) {
        logger.debug(`Sent analytics batch: ${events.length} events`);
      }
    } catch (error) {
      logger.warn('Failed to send analytics batch', error);
      // Re-queue the events for retry
      this.eventQueue.push(...events);
    }
  }

  // Public API Methods
  public setUser(userId: string, role?: string): void {
    this.userId = userId;
    this.userRole = role;
    
    this.track('session', 'user_identified', undefined, {
      userId,
      role,
    });
  }

  public clearUser(): void {
    this.track('session', 'user_cleared');
    this.userId = undefined;
    this.userRole = undefined;
  }

  public track(
    category: string,
    action: string,
    label?: string | undefined,
    properties?: Record<string, any> | undefined
  ): void {
    if (!this.config.enabled || !this.shouldSample('user')) return;

    const event: UserEvent = {
      ...this.createBaseEvent(),
      type: 'user_action',
      category,
      action,
    };

    // Only add optional properties if they have values
    if (label !== undefined) {
      event.label = label;
    }
    if (properties !== undefined) {
      event.properties = properties;
    }

    this.queueEvent(event);
  }

  public trackPageView(page?: string | undefined): void {
    if (!this.config.enabled) return;

    const pagePath = page || (typeof window !== 'undefined' ? window.location.pathname : '');
    const referrer = typeof document !== 'undefined' ? document.referrer : '';
    const loadTime = typeof performance !== 'undefined' ? performance.now() : 0;

    this.track('navigation', 'page_view', pagePath, {
      referrer,
      loadTime,
    });
  }

  public trackLearning(data: Omit<LearningEvent, keyof BaseEvent | 'type'>): void {
    if (!this.config.enabled) return;

    const event: LearningEvent = {
      ...this.createBaseEvent(),
      type: 'learning',
      subject: data.subject,
      topic: data.topic,
      action: data.action,
      projectId: data.projectId,
    };

    // Add optional properties only if provided
    if (data.progressBefore !== undefined) {
      event.progressBefore = data.progressBefore;
    }
    if (data.progressAfter !== undefined) {
      event.progressAfter = data.progressAfter;
    }
    if (data.timeSpent !== undefined) {
      event.timeSpent = data.timeSpent;
    }
    if (data.accuracy !== undefined) {
      event.accuracy = data.accuracy;
    }
    if (data.hintsUsed !== undefined) {
      event.hintsUsed = data.hintsUsed;
    }
    if (data.attemptsCount !== undefined) {
      event.attemptsCount = data.attemptsCount;
    }

    this.queueEvent(event);
  }

  public trackAI(data: Omit<AIEvent, keyof BaseEvent | 'type'>): void {
    if (!this.config.enabled) return;

    const event: AIEvent = {
      ...this.createBaseEvent(),
      type: 'ai_interaction',
      action: data.action,
    };

    // Add optional properties only if provided
    if (data.model !== undefined) {
      event.model = data.model;
    }
    if (data.promptLength !== undefined) {
      event.promptLength = data.promptLength;
    }
    if (data.responseLength !== undefined) {
      event.responseLength = data.responseLength;
    }
    if (data.processingTime !== undefined) {
      event.processingTime = data.processingTime;
    }
    if (data.subject !== undefined) {
      event.subject = data.subject;
    }
    if (data.topicCategory !== undefined) {
      event.topicCategory = data.topicCategory;
    }
    if (data.qualityRating !== undefined) {
      event.qualityRating = data.qualityRating;
    }

    this.queueEvent(event);
  }

  public trackPerformance(
    metric: string,
    value: number,
    unit: string = 'ms',
    context?: string | undefined
  ): void {
    if (!this.config.enabled || !this.shouldSample('performance')) return;

    const event: PerformanceEvent = {
      ...this.createBaseEvent(),
      type: 'performance',
      metric,
      value,
      unit,
      criticalPath: metric.includes('critical') || metric.includes('load'),
    };

    if (context !== undefined) {
      event.context = context;
    }

    this.queueEvent(event);
  }

  public trackError(
    error: Error,
    component?: string | undefined,
    action?: string | undefined,
    severity: ErrorEvent['severity'] = 'medium'
  ): void {
    if (!this.config.enabled || !this.shouldSample('errors')) return;

    const event: ErrorEvent = {
      ...this.createBaseEvent(),
      type: 'error',
      errorType: error.name,
      errorMessage: error.message,
      severity,
      userImpact: this.determineUserImpact(error, severity),
    };

    if (error.stack !== undefined) {
      event.errorStack = error.stack;
    }
    if (component !== undefined) {
      event.component = component;
    }
    if (action !== undefined) {
      event.action = action;
    }

    this.queueEvent(event);
  }

  public trackGameification(data: Omit<GameEvent, keyof BaseEvent | 'type'>): void {
    if (!this.config.enabled) return;

    const event: GameEvent = {
      ...this.createBaseEvent(),
      type: 'gamification',
      action: data.action,
    };

    // Add optional properties only if provided
    if (data.badgeId !== undefined) {
      event.badgeId = data.badgeId;
    }
    if (data.badgeRarity !== undefined) {
      event.badgeRarity = data.badgeRarity;
    }
    if (data.streakDays !== undefined) {
      event.streakDays = data.streakDays;
    }
    if (data.level !== undefined) {
      event.level = data.level;
    }
    if (data.xpGained !== undefined) {
      event.xpGained = data.xpGained;
    }

    this.queueEvent(event);
  }

  private determineUserImpact(_error: Error, severity: ErrorEvent['severity']): ErrorEvent['userImpact'] {
    if (severity === 'critical') return 'blocking';
    if (severity === 'high') return 'major';
    if (severity === 'medium') return 'minor';
    return 'none';
  }

  private queueEvent(event: AnalyticsEvent): void {
    if (this.config.debug) {
      logger.debug('Analytics event queued', event);
    }

    this.eventQueue.push(event);
    this.saveQueuedEvents();

    // Send immediately if queue is full
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  public async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];
    this.saveQueuedEvents();

    await this.sendBatch(eventsToSend);
  }

  public getQueuedEvents(): AnalyticsEvent[] {
    return [...this.eventQueue];
  }

  public clearQueue(): void {
    this.eventQueue = [];
    this.saveQueuedEvents();
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Create and export default analytics instance
export const analytics = new Analytics({
  enabled: ANALYTICS_CONSTANTS.FEATURES.ANALYTICS,
});

// Convenience functions for common tracking scenarios
export function trackUserAction(action: string, category: string = 'user', properties?: Record<string, any>): void {
  analytics.track(category, action, undefined, properties);
}

export function trackButtonClick(buttonId: string, page: string): void {
  analytics.track('interaction', 'button_click', buttonId, { page });
}

export function trackFormSubmission(formId: string, success: boolean, errors?: string[]): void {
  analytics.track('form', success ? 'submit_success' : 'submit_error', formId, { errors });
}

export function trackSearch(query: string, results: number, filters?: Record<string, any>): void {
  analytics.track('search', 'query', query, { results, filters });
}

export function trackFeatureUsage(feature: string, action: string, data?: Record<string, any>): void {
  analytics.track('feature', action, feature, data);
}

// Learning-specific tracking functions
export function trackLearningStart(projectId: string, subject: string, topic: string): void {
  analytics.trackLearning({
    action: 'start',
    projectId,
    subject,
    topic,
  });
}

export function trackLearningProgress(
  projectId: string,
  subject: string,
  topic: string,
  progressBefore: number,
  progressAfter: number,
  timeSpent: number
): void {
  analytics.trackLearning({
    action: 'progress',
    projectId,
    subject,
    topic,
    progressBefore,
    progressAfter,
    timeSpent,
  });
}

export function trackHelpRequest(
  projectId: string,
  subject: string,
  topic: string,
  _context?: string
): void {
  analytics.trackLearning({
    action: 'help_request',
    projectId,
    subject,
    topic,
    attemptsCount: 1,
  });
}

// AI interaction tracking
export function trackAIQuery(
  model: string,
  subject: string,
  promptLength: number,
  processingTime: number
): void {
  analytics.trackAI({
    action: 'query',
    model,
    subject,
    promptLength,
    processingTime,
  });
}

export function trackAIResponse(
  model: string,
  responseLength: number,
  qualityRating?: number
): void {
  analytics.trackAI({
    action: 'response',
    model,
    responseLength,
    qualityRating,
  });
}

// Performance tracking helpers
export function measureAndTrack<T>(
  operation: string,
  fn: () => T | Promise<T>,
  context?: string
): Promise<T> {
  const start = performance.now();
  
  const result = Promise.resolve(fn());
  
  return result.then(
    (value) => {
      const duration = performance.now() - start;
      analytics.trackPerformance(operation, duration, 'ms', context);
      return value;
    },
    (error) => {
      const duration = performance.now() - start;
      analytics.trackPerformance(`${operation}_error`, duration, 'ms', context);
      analytics.trackError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  );
}

// Gamification tracking
export function trackBadgeEarned(badgeId: string, rarity: string): void {
  analytics.trackGameification({
    action: 'badge_earned',
    badgeId,
    badgeRarity: rarity,
  });
}

export function trackStreakUpdate(days: number): void {
  analytics.trackGameification({
    action: 'streak_updated',
    streakDays: days,
  });
}

// Setup function to initialize analytics
export function setupAnalytics(userId?: string, userRole?: string): void {
  if (userId) {
    analytics.setUser(userId, userRole);
  }
  
  // Track app initialization
  trackUserAction('app_initialized', 'system', {
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  });
}