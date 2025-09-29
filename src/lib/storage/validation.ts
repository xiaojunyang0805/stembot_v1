/**
 * File Upload and Storage Validation
 * Validates file sizes and prevents storage limit overruns
 */

import { checkStorageLimit } from './monitoring'

// File size limits (in MB)
export const FILE_SIZE_LIMITS = {
  free: {
    maxFileSize: 10,      // 10 MB max file on free plan
    maxTotalFiles: 50     // 50 MB total files on free plan
  },
  pro: {
    maxFileSize: 100,     // 100 MB max file on pro plan
    maxTotalFiles: 500    // 500 MB total files on pro plan
  },
  enterprise: {
    maxFileSize: 500,     // 500 MB max file on enterprise plan
    maxTotalFiles: 2000   // 2 GB total files on enterprise plan
  }
} as const

// Allowed file types for different contexts
export const ALLOWED_FILE_TYPES = {
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown'
  ],
  images: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ],
  data: [
    'text/csv',
    'application/json',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
} as const

export interface FileValidationResult {
  valid: boolean
  error?: string
  warning?: string
  fileInfo?: {
    name: string
    size: number
    type: string
    sizeMB: number
  }
}

export interface StorageValidationResult {
  canUpload: boolean
  error?: string
  storageInfo?: {
    currentUsageMB: number
    limitMB: number
    remainingMB: number
    percentageUsed: number
  }
}

/**
 * Validate a file for upload
 */
export function validateFile(
  file: File,
  context: 'documents' | 'images' | 'data' = 'documents',
  subscriptionTier: 'free' | 'pro' | 'enterprise' = 'free'
): FileValidationResult {
  const sizeMB = file.size / (1024 * 1024)
  const limits = FILE_SIZE_LIMITS[subscriptionTier]

  const fileInfo = {
    name: file.name,
    size: file.size,
    type: file.type,
    sizeMB: parseFloat(sizeMB.toFixed(2))
  }

  // Check file size
  if (sizeMB > limits.maxFileSize) {
    return {
      valid: false,
      error: `File size (${fileInfo.sizeMB} MB) exceeds the maximum allowed size of ${limits.maxFileSize} MB for your plan.`,
      fileInfo
    }
  }

  // Check file type
  const allowedTypes = ALLOWED_FILE_TYPES[context] as readonly string[]
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type '${file.type}' is not allowed. Allowed types: ${getAllowedExtensions(context).join(', ')}`,
      fileInfo
    }
  }

  // Warnings for large files
  let warning: string | undefined
  if (sizeMB > limits.maxFileSize * 0.8) {
    warning = `Large file detected (${fileInfo.sizeMB} MB). Consider compressing if possible.`
  }

  return {
    valid: true,
    warning,
    fileInfo
  }
}

/**
 * Validate multiple files for upload
 */
export function validateFiles(
  files: File[],
  context: 'documents' | 'images' | 'data' = 'documents',
  subscriptionTier: 'free' | 'pro' | 'enterprise' = 'free'
): { valid: boolean; results: FileValidationResult[]; totalSizeMB: number } {
  const results: FileValidationResult[] = []
  let totalSize = 0
  let allValid = true

  for (const file of files) {
    const result = validateFile(file, context, subscriptionTier)
    results.push(result)

    if (result.valid) {
      totalSize += result.fileInfo!.sizeMB
    } else {
      allValid = false
    }
  }

  // Check total size
  const limits = FILE_SIZE_LIMITS[subscriptionTier]
  if (totalSize > limits.maxTotalFiles) {
    allValid = false
    results.push({
      valid: false,
      error: `Total file size (${totalSize.toFixed(2)} MB) exceeds the limit of ${limits.maxTotalFiles} MB for your plan.`
    })
  }

  return {
    valid: allValid,
    results,
    totalSizeMB: parseFloat(totalSize.toFixed(2))
  }
}

/**
 * Check if user can upload files based on storage limits
 */
export async function validateStorageForUpload(
  fileSizeMB: number,
  userId?: string
): Promise<StorageValidationResult> {
  try {
    const { allowed, reason, currentUsage } = await checkStorageLimit(userId, fileSizeMB)

    if (!allowed) {
      return {
        canUpload: false,
        error: reason
      }
    }

    if (currentUsage) {
      return {
        canUpload: true,
        storageInfo: {
          currentUsageMB: currentUsage.totalUsedMB,
          limitMB: currentUsage.limitMB,
          remainingMB: parseFloat((currentUsage.limitMB - currentUsage.totalUsedMB).toFixed(2)),
          percentageUsed: currentUsage.percentageUsed
        }
      }
    }

    return { canUpload: true }

  } catch (error) {
    console.error('Error validating storage for upload:', error)
    return {
      canUpload: false,
      error: 'Unable to validate storage limits. Please try again.'
    }
  }
}

/**
 * Validate conversation length before saving
 */
export async function validateConversationStorage(
  messageLength: number,
  aiResponseLength: number,
  userId?: string
): Promise<{ canSave: boolean; error?: string; warning?: string }> {
  // Estimate storage impact (message + response + metadata ~= total text + 1KB overhead)
  const estimatedSizeMB = ((messageLength + aiResponseLength) * 2 + 1024) / (1024 * 1024) // Convert to MB with overhead

  // Check if this conversation would exceed storage limits
  const storageCheck = await validateStorageForUpload(estimatedSizeMB, userId)

  if (!storageCheck.canUpload) {
    return {
      canSave: false,
      error: storageCheck.error
    }
  }

  // Warning for very large conversations
  if (estimatedSizeMB > 1) { // Over 1 MB
    return {
      canSave: true,
      warning: `This conversation is quite large (${estimatedSizeMB.toFixed(2)} MB). Consider breaking it into smaller sessions.`
    }
  }

  return { canSave: true }
}

/**
 * Get human-readable file extensions for a context
 */
function getAllowedExtensions(context: keyof typeof ALLOWED_FILE_TYPES): string[] {
  const typeExtensions: Record<string, string> = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
    'text/markdown': '.md',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'text/csv': '.csv',
    'application/json': '.json',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx'
  }

  return ALLOWED_FILE_TYPES[context]
    .map(type => typeExtensions[type])
    .filter(Boolean)
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'

  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Check if file type is supported
 */
export function isFileTypeSupported(
  file: File,
  context: 'documents' | 'images' | 'data' = 'documents'
): boolean {
  return (ALLOWED_FILE_TYPES[context] as readonly string[]).includes(file.type)
}

/**
 * Get storage usage recommendations based on file upload
 */
export function getUploadRecommendations(
  fileValidation: FileValidationResult,
  storageValidation: StorageValidationResult
): string[] {
  const recommendations: string[] = []

  if (fileValidation.fileInfo) {
    const { sizeMB, type } = fileValidation.fileInfo

    // Large file recommendations
    if (sizeMB > 50) {
      recommendations.push('Consider compressing large files to save storage space')
    }

    // PDF specific recommendations
    if (type === 'application/pdf' && sizeMB > 10) {
      recommendations.push('For large PDFs, consider extracting key sections or reducing image quality')
    }

    // Image recommendations
    if (type.startsWith('image/') && sizeMB > 5) {
      recommendations.push('Large images can be compressed or resized to reduce storage usage')
    }
  }

  if (storageValidation.storageInfo) {
    const { percentageUsed } = storageValidation.storageInfo

    if (percentageUsed > 70) {
      recommendations.push('Your storage is getting full. Consider cleaning up old files or conversations')
    }

    if (percentageUsed > 85) {
      recommendations.push('Consider upgrading your plan for more storage space')
    }
  }

  return recommendations
}