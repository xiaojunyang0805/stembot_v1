/**
 * Error Handling Utilities
 * 
 * Comprehensive error handling system for the StemBot application.
 * Includes error types, handlers, formatters, and reporting mechanisms.
 * 
 * Location: src/lib/utils/errorHandler.ts
 */

import { logger } from './logger';

// Define constants inline to avoid dependency issues
const ERROR_CONSTANTS = {
  ERROR_CODES: {
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR', 
    UNAUTHORIZED: 'UNAUTHORIZED',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  },
  HTTP_STATUS: {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },
} as const;

// Custom Error Classes with proper optional property handling
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any> | undefined;

  constructor(
    message: string,
    code: string = ERROR_CONSTANTS.ERROR_CODES.INTERNAL_ERROR,
    statusCode: number = ERROR_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    context?: Record<string, any> | undefined
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    
    // Only assign context if it has a value
    if (context !== undefined) {
      this.context = context;
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  public readonly field?: string | undefined;
  public readonly value?: any;

  constructor(message: string, field?: string | undefined, value?: any) {
    super(
      message,
      ERROR_CONSTANTS.ERROR_CODES.VALIDATION_ERROR,
      ERROR_CONSTANTS.HTTP_STATUS.BAD_REQUEST,
      true,
      { field, value }
    );
    
    // Only assign field if it has a value
    if (field !== undefined) {
      this.field = field;
    }
    this.value = value;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(
      message,
      ERROR_CONSTANTS.ERROR_CODES.UNAUTHORIZED,
      ERROR_CONSTANTS.HTTP_STATUS.UNAUTHORIZED
    );
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(
      message,
      ERROR_CONSTANTS.ERROR_CODES.PERMISSION_DENIED,
      ERROR_CONSTANTS.HTTP_STATUS.FORBIDDEN
    );
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(
      `${resource} not found`,
      ERROR_CONSTANTS.ERROR_CODES.NOT_FOUND,
      ERROR_CONSTANTS.HTTP_STATUS.NOT_FOUND
    );
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(
      message,
      ERROR_CONSTANTS.ERROR_CODES.ALREADY_EXISTS,
      ERROR_CONSTANTS.HTTP_STATUS.CONFLICT
    );
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(
      message,
      ERROR_CONSTANTS.ERROR_CODES.RATE_LIMIT_EXCEEDED,
      ERROR_CONSTANTS.HTTP_STATUS.TOO_MANY_REQUESTS
    );
  }
}

export class AIServiceError extends AppError {
  constructor(message: string = 'AI service unavailable') {
    super(
      message,
      ERROR_CONSTANTS.ERROR_CODES.AI_SERVICE_ERROR,
      ERROR_CONSTANTS.HTTP_STATUS.SERVICE_UNAVAILABLE
    );
  }
}

// Error Handler Functions
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorReporters: ErrorReporter[] = [];

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public addReporter(reporter: ErrorReporter): void {
    this.errorReporters.push(reporter);
  }

  public async handleError(error: Error, context?: Record<string, any>): Promise<void> {
    // Log the error
    logger.error('Error occurred', error, {
      context,
      timestamp: new Date().toISOString(),
    });

    // Record error metrics
    ErrorMetrics.record(error);

    // Report to external services
    for (const reporter of this.errorReporters) {
      try {
        await reporter.report(error, context);
      } catch (reportError) {
        logger.error('Failed to report error', reportError as Error, {
          originalError: error.message,
        });
      }
    }
  }

  public formatError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError(
        error.message,
        ERROR_CONSTANTS.ERROR_CODES.INTERNAL_ERROR,
        ERROR_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR,
        false,
        { originalError: error.name }
      );
    }

    if (typeof error === 'string') {
      return new AppError(error);
    }

    return new AppError('An unknown error occurred');
  }

  public isOperationalError(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  }
}

// Error Reporter Interface
export interface ErrorReporter {
  report(error: Error, context?: Record<string, any>): Promise<void>;
}

// Console Error Reporter (for development)
export class ConsoleErrorReporter implements ErrorReporter {
  async report(error: Error, context?: Record<string, any>): Promise<void> {
    console.group('🚨 Error Report');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    if (context) {
      console.error('Context:', context);
    }
    console.groupEnd();
  }
}

// Sentry Error Reporter (for production)
export class SentryErrorReporter implements ErrorReporter {
  async report(error: Error, context?: Record<string, any>): Promise<void> {
    // In a real implementation, this would integrate with Sentry
    // For now, we'll just log it
    logger.error('Sentry report', error, {
      context,
    });
  }
}

// Error Utilities
export function createErrorResponse(error: unknown) {
  const errorHandler = ErrorHandler.getInstance();
  const appError = errorHandler.formatError(error);

  return {
    success: false,
    error: {
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      timestamp: appError.timestamp,
      ...(process.env.NODE_ENV === 'development' && {
        stack: appError.stack,
        context: appError.context,
      }),
    },
  };
}

export function isClientError(statusCode: number): boolean {
  return statusCode >= 400 && statusCode < 500;
}

export function isServerError(statusCode: number): boolean {
  return statusCode >= 500 && statusCode < 600;
}

// Async error wrapper for API routes
export function asyncHandler(
  fn: (...args: any[]) => Promise<any>
) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Error boundary utilities for React components
export function getErrorBoundaryFallback(error: Error, _errorInfo?: any) {
  return {
    message: 'Something went wrong',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    canRetry: true,
    reportId: generateErrorId(),
  };
}

export function generateErrorId(): string {
  return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Validation error helpers
export function createValidationError(
  field: string,
  message: string,
  value?: any
): ValidationError {
  return new ValidationError(`${field}: ${message}`, field, value);
}

export function aggregateValidationErrors(errors: ValidationError[]): string {
  return errors.map(error => error.message).join('; ');
}

// Network error handling
export function handleNetworkError(error: any): AppError {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return new AppError(
      'You appear to be offline. Please check your internet connection.',
      ERROR_CONSTANTS.ERROR_CODES.SERVICE_UNAVAILABLE,
      ERROR_CONSTANTS.HTTP_STATUS.SERVICE_UNAVAILABLE
    );
  }

  if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    return new AppError(
      'Network error occurred. Please try again.',
      ERROR_CONSTANTS.ERROR_CODES.SERVICE_UNAVAILABLE,
      ERROR_CONSTANTS.HTTP_STATUS.SERVICE_UNAVAILABLE
    );
  }

  if (error.code === 'TIMEOUT_ERROR') {
    return new AppError(
      'Request timed out. Please try again.',
      ERROR_CONSTANTS.ERROR_CODES.SERVICE_UNAVAILABLE,
      ERROR_CONSTANTS.HTTP_STATUS.SERVICE_UNAVAILABLE
    );
  }

  return new AppError(
    'A network error occurred. Please try again.',
    ERROR_CONSTANTS.ERROR_CODES.SERVICE_UNAVAILABLE,
    ERROR_CONSTANTS.HTTP_STATUS.SERVICE_UNAVAILABLE
  );
}

// API error handling
export function handleApiError(response: Response, data?: any): AppError {
  const { status } = response;

  // Common HTTP status code handling
  switch (status) {
    case ERROR_CONSTANTS.HTTP_STATUS.BAD_REQUEST:
      return new ValidationError(
        data?.message || 'Invalid request data'
      );
    
    case ERROR_CONSTANTS.HTTP_STATUS.UNAUTHORIZED:
      return new AuthenticationError(
        data?.message || 'Authentication required'
      );
    
    case ERROR_CONSTANTS.HTTP_STATUS.FORBIDDEN:
      return new AuthorizationError(
        data?.message || 'Access denied'
      );
    
    case ERROR_CONSTANTS.HTTP_STATUS.NOT_FOUND:
      return new NotFoundError(
        data?.message || 'Resource not found'
      );
    
    case ERROR_CONSTANTS.HTTP_STATUS.CONFLICT:
      return new ConflictError(
        data?.message || 'Resource conflict'
      );
    
    case ERROR_CONSTANTS.HTTP_STATUS.TOO_MANY_REQUESTS:
      return new RateLimitError(
        data?.message || 'Too many requests'
      );
    
    case ERROR_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return new AppError(
        data?.message || 'Internal server error',
        ERROR_CONSTANTS.ERROR_CODES.INTERNAL_ERROR,
        ERROR_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    
    case ERROR_CONSTANTS.HTTP_STATUS.SERVICE_UNAVAILABLE:
      return new AppError(
        data?.message || 'Service temporarily unavailable',
        ERROR_CONSTANTS.ERROR_CODES.SERVICE_UNAVAILABLE,
        ERROR_CONSTANTS.HTTP_STATUS.SERVICE_UNAVAILABLE
      );
    
    default:
      return new AppError(
        data?.message || `Request failed with status ${status}`,
        ERROR_CONSTANTS.ERROR_CODES.INTERNAL_ERROR,
        status
      );
  }
}

// Retry logic for failed operations
export class RetryHandler {
  private maxAttempts: number;
  private baseDelay: number;
  private maxDelay: number;

  constructor(
    maxAttempts: number = 3,
    baseDelay: number = 1000,
    maxDelay: number = 10000
  ) {
    this.maxAttempts = maxAttempts;
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
  }

  async execute<T>(
    operation: () => Promise<T>,
    shouldRetry: (error: Error) => boolean = this.defaultShouldRetry
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.maxAttempts || !shouldRetry(lastError)) {
          throw lastError;
        }

        const delay = Math.min(
          this.baseDelay * Math.pow(2, attempt - 1),
          this.maxDelay
        );

        logger.warn(`Operation failed, retrying in ${delay}ms`, undefined, {
          attempt,
          maxAttempts: this.maxAttempts,
          error: lastError.message,
        });

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  private defaultShouldRetry(error: Error): boolean {
    if (error instanceof AppError) {
      // Don't retry client errors (4xx) except for rate limiting
      if (error.statusCode >= 400 && error.statusCode < 500) {
        return error.statusCode === ERROR_CONSTANTS.HTTP_STATUS.TOO_MANY_REQUESTS;
      }
      // Retry server errors (5xx)
      return error.statusCode >= 500;
    }
    
    // Retry network errors
    return true;
  }
}

// Error context collector
export class ErrorContext {
  private static context: Record<string, any> = {};

  static set(key: string, value: any): void {
    this.context[key] = value;
  }

  static get(key: string): any {
    return this.context[key];
  }

  static clear(): void {
    this.context = {};
  }

  static getAll(): Record<string, any> {
    return { ...this.context };
  }

  static addUserContext(userId: string, userRole: string): void {
    this.set('userId', userId);
    this.set('userRole', userRole);
  }

  static addRequestContext(path: string, method: string): void {
    this.set('requestPath', path);
    this.set('requestMethod', method);
    this.set('timestamp', new Date().toISOString());
  }

  static addFeatureContext(feature: string, action: string): void {
    this.set('feature', feature);
    this.set('action', action);
  }
}

// Error recovery strategies
export interface RecoveryStrategy {
  canRecover(error: Error): boolean;
  recover(error: Error): Promise<any> | any;
}

export class AuthTokenRefreshStrategy implements RecoveryStrategy {
  canRecover(error: Error): boolean {
    return error instanceof AuthenticationError;
  }

  async recover(_error: Error): Promise<void> {
    // Attempt to refresh the authentication token
    try {
      // This would integrate with your auth system
      logger.info('Attempting to refresh authentication token');
      // await refreshAuthToken();
    } catch (refreshError) {
      throw new AuthenticationError('Failed to refresh authentication');
    }
  }
}

export class NetworkRetryStrategy implements RecoveryStrategy {
  canRecover(error: Error): boolean {
    return error.message.includes('network') || 
           error.message.includes('fetch') ||
           error.message.includes('timeout');
  }

  async recover(_error: Error): Promise<void> {
    // Wait for network connectivity
    if (typeof navigator !== 'undefined' && typeof window !== 'undefined' && !navigator.onLine) {
      return new Promise<void>((resolve) => {
        const handleOnline = () => {
          window.removeEventListener('online', handleOnline);
          resolve();
        };
        window.addEventListener('online', handleOnline);
      });
    }
  }
}

// Error metrics collector
export class ErrorMetrics {
  private static errors: Map<string, number> = new Map();
  private static errorsByTime: Map<string, number[]> = new Map();

  static record(error: Error): void {
    const key = error.constructor.name;
    const current = this.errors.get(key) || 0;
    this.errors.set(key, current + 1);

    // Track by time
    const hourKey = new Date().toISOString().slice(0, 13);
    const hourlyErrors = this.errorsByTime.get(hourKey) || [];
    hourlyErrors.push(Date.now());
    this.errorsByTime.set(hourKey, hourlyErrors);
  }

  static getErrorCounts(): Record<string, number> {
    return Object.fromEntries(this.errors);
  }

  static getErrorRate(hours: number = 1): number {
    const now = new Date();
    const cutoff = new Date(now.getTime() - (hours * 60 * 60 * 1000));
    
    let totalErrors = 0;
    for (const [timeKey, errors] of Array.from(this.errorsByTime.entries())) {
      const time = new Date(timeKey);
      if (time >= cutoff) {
        totalErrors += errors.length;
      }
    }
    
    return totalErrors / hours;
  }

  static reset(): void {
    this.errors.clear();
    this.errorsByTime.clear();
  }
}

// Global error handler setup
export function setupGlobalErrorHandler(): void {
  const errorHandler = ErrorHandler.getInstance();
  
  // Add error reporters
  if (process.env.NODE_ENV === 'development') {
    errorHandler.addReporter(new ConsoleErrorReporter());
  } else {
    errorHandler.addReporter(new SentryErrorReporter());
  }

  // Handle unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      errorHandler.handleError(event.reason, {
        type: 'unhandledrejection',
        url: window.location.href,
      });
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      errorHandler.handleError(event.error, {
        type: 'globalError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        url: window.location.href,
      });
    });
  }
}

// Error boundary component props
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorId?: string;
  canRetry: boolean;
}

export interface ErrorFallbackProps {
  error: Error;
  errorId: string;
  retry: () => void;
  canRetry: boolean;
}

// Utility to check if error should be shown to user
export function shouldShowErrorToUser(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  
  // Don't show technical errors to users
  const technicalErrors = [
    'ChunkLoadError',
    'TypeError',
    'ReferenceError',
    'SyntaxError',
  ];
  
  return !technicalErrors.includes(error.constructor.name);
}

// User-friendly error messages
export function getUserFriendlyMessage(error: Error): string {
  if (error instanceof ValidationError) {
    return error.message;
  }
  
  if (error instanceof AuthenticationError) {
    return 'Please log in to continue.';
  }
  
  if (error instanceof AuthorizationError) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error instanceof NotFoundError) {
    return 'The requested item could not be found.';
  }
  
  if (error instanceof RateLimitError) {
    return 'You are making requests too quickly. Please wait a moment and try again.';
  }
  
  if (error instanceof AIServiceError) {
    return 'The AI tutoring service is temporarily unavailable. Please try again later.';
  }
  
  // Generic fallback
  return 'Something went wrong. Please try again or contact support if the problem persists.';
}

// Initialize error handling system
setupGlobalErrorHandler();