/**
 * Application Constants
 * 
 * Central location for all application constants, configuration values,
 * API endpoints, and other static data used throughout the StemBot application.
 * 
 * Location: src/lib/utils/constants.ts
 */

// Application metadata
export const APP_CONFIG = {
  name: 'StemBot',
  version: '1.0.0',
  description: 'AI-powered STEM education platform',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  supportEmail: 'support@stembot.nl',
  domain: 'stembot.nl',
} as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

// Authentication
export const AUTH_CONFIG = {
  sessionDuration: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  refreshTokenBuffer: 5 * 60 * 1000, // 5 minutes before expiry
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  passwordMinLength: 8,
  passwordMaxLength: 128,
} as const;

// STEM Subjects
export const SUBJECTS = {
  MATH: 'math',
  SCIENCE: 'science',
  CODING: 'coding',
} as const;

export const SUBJECT_LABELS = {
  [SUBJECTS.MATH]: 'Mathematics',
  [SUBJECTS.SCIENCE]: 'Science',
  [SUBJECTS.CODING]: 'Programming',
} as const;

export const SUBJECT_COLORS = {
  [SUBJECTS.MATH]: {
    primary: '#2563eb',
    light: '#dbeafe',
    dark: '#1e40af',
    bg: '#eff6ff',
  },
  [SUBJECTS.SCIENCE]: {
    primary: '#16a34a',
    light: '#dcfce7',
    dark: '#15803d',
    bg: '#f0fdf4',
  },
  [SUBJECTS.CODING]: {
    primary: '#9333ea',
    light: '#e9d5ff',
    dark: '#7c3aed',
    bg: '#faf5ff',
  },
} as const;

export const SUBJECT_ICONS = {
  [SUBJECTS.MATH]: '📊',
  [SUBJECTS.SCIENCE]: '🔬',
  [SUBJECTS.CODING]: '💻',
} as const;

// Grade Levels
export const GRADE_LEVELS = [
  '6', '7', '8', '9', '10', '11', '12'
] as const;

export const GRADE_LABELS = {
  '6': '6th Grade',
  '7': '7th Grade', 
  '8': '8th Grade',
  '9': '9th Grade',
  '10': '10th Grade',
  '11': '11th Grade',
  '12': '12th Grade',
} as const;

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  EDUCATOR: 'educator',
  PARENT: 'parent',
  ADMIN: 'admin',
} as const;

export const ROLE_PERMISSIONS = {
  [USER_ROLES.STUDENT]: [
    'projects:read',
    'projects:create',
    'projects:update_own',
    'progress:read_own',
    'chat:use',
  ],
  [USER_ROLES.EDUCATOR]: [
    'projects:read',
    'projects:create',
    'projects:update_own',
    'students:read',
    'classes:manage',
    'lesson_plans:create',
    'analytics:view',
    'progress:read_students',
  ],
  [USER_ROLES.PARENT]: [
    'progress:read_children',
    'reports:view',
  ],
  [USER_ROLES.ADMIN]: [
    'users:manage',
    'content:moderate',
    'analytics:admin',
    'system:manage',
  ],
} as const;

// Gamification
export const BADGE_RARITIES = {
  COMMON: 'common',
  RARE: 'rare',  
  EPIC: 'epic',
  LEGENDARY: 'legendary',
} as const;

export const BADGE_COLORS = {
  [BADGE_RARITIES.COMMON]: '#6b7280',
  [BADGE_RARITIES.RARE]: '#3b82f6',
  [BADGE_RARITIES.EPIC]: '#9333ea',
  [BADGE_RARITIES.LEGENDARY]: '#f59e0b',
} as const;

export const ACHIEVEMENT_TYPES = {
  STREAK: 'streak',
  PROBLEMS_SOLVED: 'problems_solved',
  TIME_SPENT: 'time_spent',
  ACCURACY: 'accuracy',
  TOPICS_MASTERED: 'topics_mastered',
  PROJECTS_COMPLETED: 'projects_completed',
  HELP_OTHERS: 'help_others',
} as const;

// File Upload
export const FILE_UPLOAD = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  imageTypes: ['image/jpeg', 'image/png', 'image/gif'],
  documentTypes: [
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
} as const;

// Progress and Analytics
export const PROGRESS_THRESHOLDS = {
  BEGINNER: 25,
  INTERMEDIATE: 50,
  ADVANCED: 75,
  EXPERT: 90,
} as const;

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365] as const;

export const TIME_PERIODS = {
  DAY: 'day',
  WEEK: 'week', 
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
} as const;

// AI Configuration
export const AI_CONFIG = {
  maxTokens: 2048,
  temperature: 0.7,
  maxContextLength: 4096,
  responseTimeout: 30000, // 30 seconds
  models: {
    math: 'codellama:13b',
    science: 'llama3.1:8b',
    coding: 'codellama:13b',
    general: 'llama3.1:8b',
  },
  prompts: {
    maxLength: 1000,
    minLength: 5,
  },
} as const;

// Chat Configuration
export const CHAT_CONFIG = {
  maxMessageLength: 1000,
  maxMessagesPerMinute: 10,
  typingIndicatorDelay: 500,
  messageRetentionDays: 90,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  supportedFileTypes: ['pdf', 'txt', 'docx', 'png', 'jpg'],
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  ACHIEVEMENT: 'achievement',
  PROGRESS: 'progress',
  REMINDER: 'reminder',
  SYSTEM: 'system',
  SOCIAL: 'social',
} as const;

// Localization
export const LOCALES = {
  EN: 'en',
  NL: 'nl',
} as const;

export const LOCALE_LABELS = {
  [LOCALES.EN]: 'English',
  [LOCALES.NL]: 'Nederlands',
} as const;

export const DEFAULT_LOCALE = LOCALES.EN;

// Rate Limiting
export const RATE_LIMITS = {
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  ai: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
  },
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  },
} as const;

// Error Codes
export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // AI
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  CONTEXT_TOO_LONG: 'CONTEXT_TOO_LONG',
  MODEL_UNAVAILABLE: 'MODEL_UNAVAILABLE',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Database Configuration
export const DB_CONFIG = {
  maxConnections: 20,
  idleTimeoutMs: 30000,
  connectionTimeoutMs: 2000,
  maxRetries: 3,
} as const;

// Pagination
export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
  minLimit: 1,
} as const;

// Session Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'stembot_auth_token',
  REFRESH_TOKEN: 'stembot_refresh_token',
  USER_PREFERENCES: 'stembot_user_preferences',
  THEME: 'stembot_theme',
  LANGUAGE: 'stembot_language',
  ONBOARDING_COMPLETE: 'stembot_onboarding_complete',
  LAST_ACTIVITY: 'stembot_last_activity',
} as const;

// Feature Flags
export const FEATURES = {
  COLLABORATION: process.env.NEXT_PUBLIC_ENABLE_COLLABORATION === 'true',
  GAMIFICATION: process.env.NEXT_PUBLIC_ENABLE_GAMIFICATION === 'true',
  ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  BILLING: process.env.NEXT_PUBLIC_ENABLE_BILLING === 'true',
  AI_TUTORING: process.env.NEXT_PUBLIC_ENABLE_AI_TUTORING !== 'false',
  GOOGLE_AUTH: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === 'true',
  REGISTRATION: process.env.NEXT_PUBLIC_ENABLE_REGISTRATION !== 'false',
  DARK_MODE: true,
  MULTILINGUAL: true,
  OFFLINE_MODE: false, // Future feature
} as const;

// External Service URLs
export const EXTERNAL_URLS = {
  documentation: 'https://docs.stembot.nl',
  support: 'https://support.stembot.nl',
  privacy: 'https://stembot.nl/privacy',
  terms: 'https://stembot.nl/terms',
  blog: 'https://blog.stembot.nl',
  github: 'https://github.com/stembot',
  twitter: 'https://twitter.com/stembotai',
} as const;

// Development and Testing
export const DEV_CONFIG = {
  enableMockData: process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true',
  showDebugInfo: process.env.NEXT_PUBLIC_SHOW_DEBUG_INFO === 'true',
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  enableHotReload: process.env.NODE_ENV === 'development',
} as const;

// Type exports for better TypeScript support
export type Subject = typeof SUBJECTS[keyof typeof SUBJECTS];
export type GradeLevel = typeof GRADE_LEVELS[number];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type BadgeRarity = typeof BADGE_RARITIES[keyof typeof BADGE_RARITIES];
export type AchievementType = typeof ACHIEVEMENT_TYPES[keyof typeof ACHIEVEMENT_TYPES];
export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
export type Locale = typeof LOCALES[keyof typeof LOCALES];
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export type TimePeriod = typeof TIME_PERIODS[keyof typeof TIME_PERIODS];