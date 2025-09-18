/**
 * Logging Service
 * 
 * Comprehensive logging utility for the StemBot application.
 * Supports different log levels, structured logging, and multiple output targets.
 * 
 * Location: src/lib/utils/logger.ts
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  context?: Record<string, any> | undefined;
  error?: Error;
  userId?: string | undefined;
  sessionId?: string;
  requestId?: string | undefined;
  component?: string;
  action?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  enableRemote: boolean;
  maxStorageEntries: number;
  remoteEndpoint?: string | undefined;
  formatOutput: boolean;
}

class Logger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private flushInterval?: NodeJS.Timeout;
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: (process.env.NODE_ENV === 'development' ? 'debug' : 'info') as LogLevel,
      enableConsole: true,
      enableStorage: typeof window !== 'undefined' && !!localStorage,
      enableRemote: process.env.NODE_ENV === 'production',
      maxStorageEntries: 1000,
      formatOutput: process.env.NODE_ENV === 'development',
      remoteEndpoint: undefined,
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.startPeriodicFlush();
    this.loadStoredLogs();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getLogLevelPriority(level: LogLevel): number {
    const priorities = { debug: 0, info: 1, warn: 2, error: 3 };
    return priorities[level];
  }

  private shouldLog(level: LogLevel): boolean {
    return this.getLogLevelPriority(level) >= this.getLogLevelPriority(this.config.level);
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: any,
    context?: Record<string, any> | undefined
  ): LogEntry {
    const baseEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    };

    // Add optional properties only if they have values
    if (data !== undefined) {
      baseEntry.data = data;
    }
    if (context !== undefined) {
      baseEntry.context = context;
    }

    // Add browser-specific properties if available
    if (typeof window !== 'undefined') {
      const userId = this.getCurrentUserId();
      const requestId = this.getCurrentRequestId();
      
      if (userId !== undefined) {
        baseEntry.userId = userId;
      }
      if (requestId !== undefined) {
        baseEntry.requestId = requestId;
      }
    }

    return baseEntry;
  }

  private getCurrentUserId(): string | undefined {
    // Extract from auth context or localStorage
    try {
      const authData = localStorage.getItem('stembot_auth_token');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.userId;
      }
    } catch {
      // Ignore errors
    }
    return undefined;
  }

  private getCurrentRequestId(): string | undefined {
    // This would typically be set by middleware or at the start of a request
    return (globalThis as any).__requestId;
  }

  private formatConsoleOutput(entry: LogEntry): void {
    if (!this.config.formatOutput) {
      console.log(JSON.stringify(entry));
      return;
    }

    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const level = entry.level.toUpperCase().padEnd(5);
    const prefix = `[${timestamp}] ${level}`;

    // Color coding for different log levels
    const colors = {
      debug: 'color: #6b7280',
      info: 'color: #3b82f6',
      warn: 'color: #f59e0b',
      error: 'color: #ef4444',
    };

    if (entry.level === 'error' && entry.error) {
      console.group(`%c${prefix} ${entry.message}`, colors[entry.level]);
      console.error(entry.error);
      if (entry.data) console.log('Data:', entry.data);
      if (entry.context) console.log('Context:', entry.context);
      console.groupEnd();
    } else {
      console.log(`%c${prefix} ${entry.message}`, colors[entry.level]);
      if (entry.data) console.log('Data:', entry.data);
      if (entry.context) console.log('Context:', entry.context);
    }
  }

  private saveToStorage(entry: LogEntry): void {
    if (!this.config.enableStorage || typeof window === 'undefined') return;

    try {
      const stored = JSON.parse(localStorage.getItem('stembot_logs') || '[]');
      stored.push(entry);

      // Maintain max entries limit
      if (stored.length > this.config.maxStorageEntries) {
        stored.splice(0, stored.length - this.config.maxStorageEntries);
      }

      localStorage.setItem('stembot_logs', JSON.stringify(stored));
    } catch (error) {
      console.warn('Failed to save log to storage:', error);
    }
  }

  private loadStoredLogs(): void {
    if (!this.config.enableStorage || typeof window === 'undefined') return;

    try {
      const stored = JSON.parse(localStorage.getItem('stembot_logs') || '[]');
      this.logBuffer.push(...stored);
    } catch (error) {
      console.warn('Failed to load stored logs:', error);
    }
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);

    // Prevent memory leaks by limiting buffer size
    if (this.logBuffer.length > this.config.maxStorageEntries * 2) {
      this.logBuffer.splice(0, this.config.maxStorageEntries);
    }
  }

  private startPeriodicFlush(): void {
    if (!this.config.enableRemote) return;

    this.flushInterval = setInterval(() => {
      this.flushToRemote();
    }, 30000); // Flush every 30 seconds
  }

  private async flushToRemote(): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint || this.logBuffer.length === 0) {
      return;
    }

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs: logsToSend,
          metadata: {
            sessionId: this.sessionId,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
          },
        }),
      });
    } catch (error) {
      // Re-add logs to buffer if sending failed
      this.logBuffer.unshift(...logsToSend);
      console.warn('Failed to send logs to remote endpoint:', error);
    }
  }

  // Public logging methods
  public debug(message: string, data?: any, context?: Record<string, any>): void {
    if (!this.shouldLog('debug')) return;

    const entry = this.createLogEntry('debug', message, data, context);
    
    if (this.config.enableConsole) this.formatConsoleOutput(entry);
    if (this.config.enableStorage) this.saveToStorage(entry);
    this.addToBuffer(entry);
  }

  public info(message: string, data?: any, context?: Record<string, any>): void {
    if (!this.shouldLog('info')) return;

    const entry = this.createLogEntry('info', message, data, context);
    
    if (this.config.enableConsole) this.formatConsoleOutput(entry);
    if (this.config.enableStorage) this.saveToStorage(entry);
    this.addToBuffer(entry);
  }

  public warn(message: string, data?: any, context?: Record<string, any>): void {
    if (!this.shouldLog('warn')) return;

    const entry = this.createLogEntry('warn', message, data, context);
    
    if (this.config.enableConsole) this.formatConsoleOutput(entry);
    if (this.config.enableStorage) this.saveToStorage(entry);
    this.addToBuffer(entry);
  }

  public error(message: string, error?: Error | any, context?: Record<string, any>): void {
    if (!this.shouldLog('error')) return;

    const entry = this.createLogEntry('error', message, undefined, context);
    if (error instanceof Error) {
      entry.error = error;
      entry.data = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      entry.data = error;
    }
    
    if (this.config.enableConsole) this.formatConsoleOutput(entry);
    if (this.config.enableStorage) this.saveToStorage(entry);
    this.addToBuffer(entry);
  }

  // Specialized logging methods
  public apiCall(method: string, url: string, status: number, duration: number, data?: any): void {
    this.info('API Call', {
      method,
      url,
      status,
      duration: `${duration}ms`,
      ...data,
    }, {
      category: 'api',
      success: status >= 200 && status < 300,
    });
  }

  public userAction(action: string, component: string, data?: any): void {
    this.info('User Action', data, {
      category: 'user',
      action,
      component,
    });
  }

  public performance(metric: string, value: number, unit: string = 'ms'): void {
    this.debug('Performance Metric', {
      metric,
      value,
      unit,
    }, {
      category: 'performance',
    });
  }

  public aiInteraction(type: 'request' | 'response' | 'error', data: any): void {
    this.info('AI Interaction', data, {
      category: 'ai',
      type,
    });
  }

  public security(event: string, severity: 'low' | 'medium' | 'high', details?: any): void {
    const logMethod = severity === 'high' ? this.error : severity === 'medium' ? this.warn : this.info;
    logMethod.call(this, `Security Event: ${event}`, details, {
      category: 'security',
      severity,
    });
  }

  // Utility methods
  public setUserId(userId: string): void {
    this.info('User Session Started', { userId }, { category: 'auth' });
  }

  public clearUserId(): void {
    this.info('User Session Ended', undefined, { category: 'auth' });
  }

  public setLevel(level: LogLevel): void {
    this.config.level = level;
    this.info('Log level changed', { level }, { category: 'system' });
  }

  public getStoredLogs(): LogEntry[] {
    if (typeof window === 'undefined') return [];

    try {
      return JSON.parse(localStorage.getItem('stembot_logs') || '[]');
    } catch {
      return [];
    }
  }

  public clearStoredLogs(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('stembot_logs');
    }
    this.logBuffer = [];
  }

  public async exportLogs(): Promise<string> {
    const logs = this.getStoredLogs();
    return JSON.stringify(logs, null, 2);
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public flush(): Promise<void> {
    return this.flushToRemote();
  }

  public destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushToRemote();
  }
}

// Create and export default logger instance
const logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
const enableRemote = process.env.NODE_ENV === 'production';
const remoteEndpoint = process.env.NEXT_PUBLIC_LOG_ENDPOINT || undefined;

export const logger = new Logger({
  level: logLevel,
  enableRemote,
  ...(remoteEndpoint && { remoteEndpoint }),
});

// Helper functions for common logging patterns
export function logPageView(page: string, userId?: string): void {
  logger.info('Page View', { page, userId }, { category: 'navigation' });
}

export function logFeatureUsage(feature: string, action: string, data?: any): void {
  logger.info('Feature Usage', { feature, action, ...data }, { category: 'feature' });
}

export function logError(error: Error, context?: string, additionalData?: any): void {
  logger.error(`Error${context ? ` in ${context}` : ''}`, error, {
    category: 'error',
    context,
    ...additionalData,
  });
}

export function logPerformance(operation: string, duration: number): void {
  logger.performance(operation, duration);
}

export function logAIUsage(operation: string, model?: string, tokens?: number): void {
  logger.aiInteraction('request', {
    operation,
    model,
    tokens,
    timestamp: new Date().toISOString(),
  });
}

// Performance measurement decorator
export function measurePerformance(operationName: string) {
  return function (_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      try {
        const result = await originalMethod.apply(this, args);
        const duration = performance.now() - start;
        logPerformance(`${operationName}.${propertyKey}`, duration);
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        logger.error(`${operationName}.${propertyKey} failed`, error as Error, {
          duration,
          arguments: args.length,
        });
        throw error;
      }
    };

    return descriptor;
  };
}

// Request ID context for server-side logging
export function setRequestId(requestId: string): void {
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).__requestId = requestId;
  }
}

export function clearRequestId(): void {
  if (typeof globalThis !== 'undefined') {
    delete (globalThis as any).__requestId;
  }
}