/**
 * Validation Utilities
 * 
 * Zod schemas and validation functions for forms, API inputs, and data validation.
 * Includes common patterns for authentication, project management, and educational content.
 * 
 * Location: src/lib/utils/validation.ts
 */

import { z } from 'zod';

// Common validation patterns
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be less than 20 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens');

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  role: z.enum(['student', 'educator', 'parent']).optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Project schemas
export const subjectSchema = z.enum(['math', 'science', 'coding'] as const, {
  message: 'Please select a valid subject',
});

export const gradeLevelSchema = z.enum(['6', '7', '8', '9', '10', '11', '12'] as const, {
  message: 'Please select a valid grade level',
});

export const projectSchema = z.object({
  title: z
    .string()
    .min(1, 'Project title is required')
    .min(3, 'Project title must be at least 3 characters')
    .max(100, 'Project title must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  subject: subjectSchema,
  gradeLevel: gradeLevelSchema,
  goals: z
    .array(z.string().min(1, 'Goal cannot be empty'))
    .min(1, 'At least one learning goal is required')
    .max(5, 'Maximum 5 learning goals allowed'),
  isPublic: z.boolean().default(false),
  tags: z
    .array(z.string().min(1).max(20))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
});

export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(file => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine(
      file => ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'].includes(file.type),
      'File must be PDF, image, or text file'
    ),
  projectId: z.string().uuid('Invalid project ID'),
});

// User profile schemas
export const profileUpdateSchema = z.object({
  name: nameSchema,
  bio: z
    .string()
    .max(200, 'Bio must be less than 200 characters')
    .optional(),
  grade: gradeLevelSchema.optional(),
  subjects: z
    .array(subjectSchema)
    .max(3, 'Maximum 3 subjects allowed')
    .optional(),
  preferences: z.object({
    language: z.enum(['en', 'nl']).default('en'),
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      achievements: z.boolean().default(true),
    }).optional(),
  }).optional(),
});

// Educator schemas
export const classSchema = z.object({
  name: z
    .string()
    .min(1, 'Class name is required')
    .max(50, 'Class name must be less than 50 characters'),
  description: z
    .string()
    .max(200, 'Description must be less than 200 characters')
    .optional(),
  subject: subjectSchema,
  gradeLevel: gradeLevelSchema,
  students: z
    .array(z.string().email())
    .max(50, 'Maximum 50 students per class')
    .optional(),
});

export const lessonPlanSchema = z.object({
  title: z
    .string()
    .min(1, 'Lesson title is required')
    .max(100, 'Lesson title must be less than 100 characters'),
  subject: subjectSchema,
  gradeLevel: gradeLevelSchema,
  duration: z
    .number()
    .min(15, 'Lesson must be at least 15 minutes')
    .max(180, 'Lesson must be less than 3 hours'),
  objectives: z
    .array(z.string().min(1, 'Objective cannot be empty'))
    .min(1, 'At least one learning objective is required')
    .max(5, 'Maximum 5 learning objectives allowed'),
  materials: z
    .array(z.string().min(1))
    .optional(),
  activities: z
    .array(z.string().min(1))
    .min(1, 'At least one activity is required'),
  assessment: z
    .string()
    .min(1, 'Assessment method is required')
    .max(200, 'Assessment description must be less than 200 characters'),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
});

// Chat and tutoring schemas
export const chatMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message must be less than 1000 characters'),
  projectId: z.string().uuid('Invalid project ID'),
  type: z.enum(['text', 'image', 'file']).default('text'),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Progress and analytics schemas
export const progressUpdateSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  subject: subjectSchema,
  topicId: z.string().min(1, 'Topic ID is required'),
  progress: z
    .number()
    .min(0, 'Progress cannot be negative')
    .max(100, 'Progress cannot exceed 100%'),
  timeSpent: z
    .number()
    .min(0, 'Time spent cannot be negative'),
  accuracy: z
    .number()
    .min(0, 'Accuracy cannot be negative')
    .max(100, 'Accuracy cannot exceed 100%')
    .optional(),
  completed: z.boolean().default(false),
});

// Settings schemas
export const notificationSettingsSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  achievements: z.boolean(),
  weeklyReports: z.boolean(),
  reminders: z.boolean(),
});

export const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'friends', 'private']),
  showProgress: z.boolean(),
  shareAchievements: z.boolean(),
  allowAnalytics: z.boolean(),
});

// API response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Validation helper functions
export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const result = passwordSchema.safeParse(password);
  return {
    isValid: result.success,
    errors: result.success ? [] : result.error.issues.map(issue => issue.message),
  };
}

export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

// Custom validation functions
export function isValidGrade(grade: string): boolean {
  return ['6', '7', '8', '9', '10', '11', '12'].includes(grade);
}

export function isValidSubject(subject: string): boolean {
  return ['math', 'science', 'coding'].includes(subject);
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .slice(0, 1000); // Limit length
}

// Enhanced validation function with detailed error reporting
export function validateAndFormatErrors<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: [],
    };
  }

  const formattedErrors = result.error.issues.map((issue) => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
    code: issue.code,
  }));

  return {
    success: false,
    errors: formattedErrors,
  };
}

// Async validation for server-side operations
export async function validateWithAsyncRules<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  asyncValidators?: Array<(data: T) => Promise<string | null>>
): Promise<{
  success: boolean;
  data?: T;
  errors: string[];
}> {
  // First run synchronous validation
  const syncResult = schema.safeParse(data);
  if (!syncResult.success) {
    return {
      success: false,
      errors: syncResult.error.issues.map(issue => issue.message),
    };
  }

  // Run async validators if provided
  if (asyncValidators && asyncValidators.length > 0) {
    const asyncErrors: string[] = [];
    
    for (const validator of asyncValidators) {
      try {
        const error = await validator(syncResult.data);
        if (error) {
          asyncErrors.push(error);
        }
      } catch (err) {
        asyncErrors.push('Validation failed due to server error');
      }
    }

    if (asyncErrors.length > 0) {
      return {
        success: false,
        errors: asyncErrors,
      };
    }
  }

  return {
    success: true,
    data: syncResult.data,
    errors: [],
  };
}

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type ProgressUpdateInput = z.infer<typeof progressUpdateSchema>;
export type LessonPlanInput = z.infer<typeof lessonPlanSchema>;
export type ClassInput = z.infer<typeof classSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;