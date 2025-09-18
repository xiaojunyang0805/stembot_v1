/**
 * File Processing Utilities
 * 
 * Comprehensive file handling utilities for the StemBot application.
 * Includes validation, processing, conversion, and extraction functions.
 * 
 * Location: src/lib/utils/fileProcessor.ts
 */

import { logger } from './logger';

// Define supported file types as const arrays for type safety
const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
] as const;

const SUPPORTED_DOCUMENT_TYPES = [
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
] as const;

const SUPPORTED_MIME_TYPES = [
  ...SUPPORTED_IMAGE_TYPES,
  ...SUPPORTED_DOCUMENT_TYPES
] as const;

type SupportedMimeType = typeof SUPPORTED_MIME_TYPES[number];
type ImageMimeType = typeof SUPPORTED_IMAGE_TYPES[number];
type DocumentMimeType = typeof SUPPORTED_DOCUMENT_TYPES[number];

// Constants for file processing
export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILENAME_LENGTH: 255,
  ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'txt', 'csv', 'xls', 'xlsx'],
  DANGEROUS_EXTENSIONS: ['.exe', '.bat', '.cmd', '.scr', '.com', '.pif', '.js', '.vbs'],
  THUMBNAIL_SIZE: 150,
  PREVIEW_MAX_WIDTH: 800,
  PREVIEW_MAX_HEIGHT: 600,
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks
} as const;

// Custom error classes
export class FileValidationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'FileValidationError';
  }
}

export class FileProcessingError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'FileProcessingError';
  }
}

// File type definitions
export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo: {
    name: string;
    size: number;
    type: string;
    extension: string;
    isSupported: boolean;
  };
}

export interface ProcessedFile {
  file: File;
  content?: string;
  extractedText?: string;
  metadata: Record<string, any>;
  preview?: string;
  thumbnailUrl?: string;
  dimensions?: { width: number; height: number };
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface CSVData {
  headers: string[];
  rows: string[][];
  rowCount: number;
  columnCount: number;
}

// Type guard functions
export function isSupportedMimeType(mimeType: string): mimeType is SupportedMimeType {
  return (SUPPORTED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function isImageMimeType(mimeType: string): mimeType is ImageMimeType {
  return (SUPPORTED_IMAGE_TYPES as readonly string[]).includes(mimeType);
}

export function isDocumentMimeType(mimeType: string): mimeType is DocumentMimeType {
  return (SUPPORTED_DOCUMENT_TYPES as readonly string[]).includes(mimeType);
}

// Utility functions
export function getFileExtension(filename: string): string {
  if (typeof filename !== 'string') return '';
  const lastDot = filename.lastIndexOf('.');
  return lastDot >= 0 ? filename.substring(lastDot + 1).toLowerCase() : '';
}

export function getMimeTypeFromExtension(extension: string): string {
  if (typeof extension !== 'string') return 'application/octet-stream';
  
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    txt: 'text/plain',
    csv: 'text/csv',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

export function formatFileSize(bytes: number): string {
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = Math.round(bytes / Math.pow(1024, i) * 100) / 100;
  return `${size} ${sizes[i]}`;
}

export function sanitizeFileName(fileName: string): string {
  if (typeof fileName !== 'string') return 'unnamed_file';
  
  return fileName
    .replace(/[^a-zA-Z0-9._\-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, FILE_CONSTRAINTS.MAX_FILENAME_LENGTH);
}

export function generateUniqueFileName(originalName: string): string {
  if (typeof originalName !== 'string') return `file_${Date.now()}`;
  
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = getFileExtension(originalName);
  const lastDot = originalName.lastIndexOf('.');
  const baseName = lastDot >= 0 ? originalName.substring(0, lastDot) : originalName;
  
  const sanitizedBaseName = sanitizeFileName(baseName);
  return extension 
    ? `${sanitizedBaseName}_${timestamp}_${randomStr}.${extension}`
    : `${sanitizedBaseName}_${timestamp}_${randomStr}`;
}

// File validation functions
export function validateFile(file: File): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!(file instanceof File)) {
    return {
      isValid: false,
      errors: ['Invalid file object'],
      warnings: [],
      fileInfo: {
        name: 'unknown',
        size: 0,
        type: 'unknown',
        extension: '',
        isSupported: false,
      },
    };
  }
  
  const extension = getFileExtension(file.name);
  const fileInfo = {
    name: file.name,
    size: file.size,
    type: file.type,
    extension,
    isSupported: isSupportedMimeType(file.type),
  };

  // Size validation
  if (file.size > FILE_CONSTRAINTS.MAX_FILE_SIZE) {
    errors.push(`File size (${formatFileSize(file.size)}) exceeds the maximum allowed size (${formatFileSize(FILE_CONSTRAINTS.MAX_FILE_SIZE)})`);
  }

  if (file.size === 0) {
    errors.push('File is empty');
  }

  // Type validation
  if (!isSupportedMimeType(file.type)) {
    errors.push(`File type "${file.type}" is not supported. Allowed types: ${SUPPORTED_MIME_TYPES.join(', ')}`);
  }

  // Extension validation
  if (!FILE_CONSTRAINTS.ALLOWED_EXTENSIONS.includes(extension as any)) {
    warnings.push(`File extension "${extension}" may not be fully supported`);
  }

  // Security validation
  if (FILE_CONSTRAINTS.DANGEROUS_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))) {
    errors.push('Executable files are not allowed for security reasons');
  }

  // Name validation
  if (file.name.length > FILE_CONSTRAINTS.MAX_FILENAME_LENGTH) {
    errors.push(`File name is too long (max ${FILE_CONSTRAINTS.MAX_FILENAME_LENGTH} characters)`);
  }

  if (!/^[a-zA-Z0-9._\-\s()[\]{}]+$/.test(file.name)) {
    warnings.push('File name contains special characters that may cause issues');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fileInfo,
  };
}

// File reading functions with proper error handling
export function readTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File)) {
      reject(new FileProcessingError('Invalid file object'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        resolve('');
      }
    };
    
    reader.onerror = () => {
      reject(new FileProcessingError('Failed to read file as text'));
    };
    
    try {
      reader.readAsText(file);
    } catch (error) {
      reject(new FileProcessingError(`Failed to start reading file: ${error}`));
    }
  });
}

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File)) {
      reject(new FileProcessingError('Invalid file object'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result;
      if (result instanceof ArrayBuffer) {
        resolve(result);
      } else {
        reject(new FileProcessingError('Failed to read file as ArrayBuffer'));
      }
    };
    
    reader.onerror = () => {
      reject(new FileProcessingError('Failed to read file as ArrayBuffer'));
    };
    
    try {
      reader.readAsArrayBuffer(file);
    } catch (error) {
      reject(new FileProcessingError(`Failed to start reading file: ${error}`));
    }
  });
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File)) {
      reject(new FileProcessingError('Invalid file object'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new FileProcessingError('Failed to read file as Data URL'));
      }
    };
    
    reader.onerror = () => {
      reject(new FileProcessingError('Failed to read file as Data URL'));
    };
    
    try {
      reader.readAsDataURL(file);
    } catch (error) {
      reject(new FileProcessingError(`Failed to start reading file: ${error}`));
    }
  });
}

// Image processing functions
export async function createImagePreview(
  file: File, 
  maxWidth: number = FILE_CONSTRAINTS.PREVIEW_MAX_WIDTH, 
  maxHeight: number = FILE_CONSTRAINTS.PREVIEW_MAX_HEIGHT
): Promise<string> {
  if (!isImageMimeType(file.type)) {
    throw new FileProcessingError('File is not a supported image type');
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new FileProcessingError('Could not get canvas context'));
      return;
    }
    
    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      } catch (error) {
        reject(new FileProcessingError(`Failed to process image: ${error}`));
      }
    };
    
    img.onerror = () => {
      reject(new FileProcessingError('Failed to load image'));
    };
    
    readFileAsDataURL(file)
      .then(dataUrl => {
        img.src = dataUrl;
      })
      .catch(reject);
  });
}

export async function createImageThumbnail(file: File): Promise<string> {
  const size = FILE_CONSTRAINTS.THUMBNAIL_SIZE;
  return createImagePreview(file, size, size);
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  if (!isImageMimeType(file.type)) {
    return Promise.reject(new FileProcessingError('File is not a supported image type'));
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({ 
        width: img.naturalWidth, 
        height: img.naturalHeight 
      });
    };
    
    img.onerror = () => {
      reject(new FileProcessingError('Failed to load image for dimension calculation'));
    };
    
    readFileAsDataURL(file)
      .then(dataUrl => {
        img.src = dataUrl;
      })
      .catch(reject);
  });
}

// Document processing functions
export async function extractTextFromDocument(file: File): Promise<string> {
  const extension = getFileExtension(file.name);
  
  if (!extension) {
    throw new FileProcessingError('File has no extension');
  }

  try {
    switch (extension) {
      case 'txt':
        return await readTextFromFile(file);
      
      case 'pdf':
        return await extractTextFromPDF(file);
      
      case 'csv':
        return await readTextFromFile(file);
      
      default:
        throw new FileProcessingError(`Text extraction not supported for ${extension} files`);
    }
  } catch (error) {
    if (error instanceof FileProcessingError) {
      throw error;
    }
    throw new FileProcessingError(`Failed to extract text: ${error}`);
  }
}

// PDF text extraction placeholder
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // This is a placeholder implementation
    // In production, you would use pdf.js or similar library
    const fileSize = formatFileSize(file.size);
    const fileName = file.name || 'unknown.pdf';
    return `PDF Document: ${fileName} (${fileSize})\n\nThis PDF file contains text content. In a production environment, this would be extracted using pdf.js library.`;
  } catch (error) {
    throw new FileProcessingError('PDF text extraction failed');
  }
}

// CSV processing
export async function parseCSV(file: File): Promise<CSVData> {
  if (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv')) {
    throw new FileProcessingError('File is not a CSV file');
  }

  try {
    const content = await readTextFromFile(file);
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return { 
        headers: [], 
        rows: [], 
        rowCount: 0, 
        columnCount: 0 
      };
    }
    
    // Simple CSV parsing - in production you'd use a proper CSV parser
    const firstLine = lines[0];
    if (!firstLine) {
      return { 
        headers: [], 
        rows: [], 
        rowCount: 0, 
        columnCount: 0 
      };
    }
    
    const headers = firstLine.split(',').map(header => header.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => 
      line.split(',').map(cell => cell.trim().replace(/"/g, ''))
    );
    
    return { 
      headers, 
      rows, 
      rowCount: rows.length, 
      columnCount: headers.length 
    };
  } catch (error) {
    throw new FileProcessingError(`Failed to parse CSV: ${error}`);
  }
}

// Main file processing function
export async function processFile(file: File): Promise<ProcessedFile> {
  const validation = validateFile(file);
  
  if (!validation.isValid) {
    throw new FileValidationError(`File validation failed: ${validation.errors.join(', ')}`);
  }

  const processedFile: ProcessedFile = {
    file,
    metadata: {
      ...validation.fileInfo,
      uploadedAt: new Date().toISOString(),
      validationWarnings: validation.warnings,
    },
  };

  try {
    // Process based on file type
    if (isImageMimeType(file.type)) {
      const [preview, thumbnail, dimensions] = await Promise.allSettled([
        createImagePreview(file),
        createImageThumbnail(file),
        getImageDimensions(file)
      ]);

      if (preview.status === 'fulfilled') {
        processedFile.preview = preview.value;
      }
      if (thumbnail.status === 'fulfilled') {
        processedFile.thumbnailUrl = thumbnail.value;
      }
      if (dimensions.status === 'fulfilled') {
        processedFile.dimensions = dimensions.value;
      }

    } else if (isDocumentMimeType(file.type)) {
      const [content, extractedText] = await Promise.allSettled([
        readTextFromFile(file),
        extractTextFromDocument(file)
      ]);

      if (content.status === 'fulfilled') {
        processedFile.content = content.value;
      }
      if (extractedText.status === 'fulfilled') {
        processedFile.extractedText = extractedText.value;
      }
    }

    logger.info('File processed successfully', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    return processedFile;

  } catch (error) {
    logger.error('File processing failed', error as Error, {
      fileName: file.name,
      fileType: file.type,
    });
    
    if (error instanceof FileProcessingError || error instanceof FileValidationError) {
      throw error;
    }
    throw new FileProcessingError(`Failed to process file: ${error}`);
  }
}

// File conversion utilities
export async function convertToBase64(file: File): Promise<string> {
  try {
    const dataUrl = await readFileAsDataURL(file);
    const base64 = dataUrl.split(',')[1];
    if (!base64) {
      throw new FileProcessingError('Failed to extract base64 data from file');
    }
    return base64;
  } catch (error) {
    throw new FileProcessingError(`Failed to convert file to base64: ${error}`);
  }
}

export function dataURLToFile(dataURL: string, filename: string): File {
  try {
    const arr = dataURL.split(',');
    if (arr.length < 2) {
      throw new FileProcessingError('Invalid data URL format');
    }
    
    const headerPart = arr[0];
    if (!headerPart) {
      throw new FileProcessingError('Invalid data URL header');
    }
    
    const mimeMatch = headerPart.match(/:(.*?);/);
    const mime = mimeMatch?.[1] || 'application/octet-stream';
    const base64Data = arr[1];
    
    if (!base64Data) {
      throw new FileProcessingError('No base64 data found in data URL');
    }
    
    const bstr = atob(base64Data);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  } catch (error) {
    throw new FileProcessingError(`Failed to convert data URL to file: ${error}`);
  }
}

// File upload utilities
export function createUploadProgress(loaded: number, total: number, status?: FileUploadProgress['status']): FileUploadProgress {
  const percentage = total > 0 ? Math.round((loaded / total) * 100) : 0;
  const calculatedStatus = status || (loaded >= total ? 'complete' : 'uploading');
  
  return {
    loaded,
    total,
    percentage,
    status: calculatedStatus,
  };
}

export async function uploadFileWithProgress(
  file: File,
  url: string,
  onProgress?: (progress: FileUploadProgress) => void
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = createUploadProgress(event.loaded, event.total, 'uploading');
        onProgress(progress);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) {
          onProgress(createUploadProgress(1, 1, 'complete'));
        }
        resolve(new Response(xhr.responseText, { status: xhr.status }));
      } else {
        if (onProgress) {
          onProgress(createUploadProgress(0, 1, 'error'));
        }
        reject(new FileProcessingError(`Upload failed with status ${xhr.status}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      if (onProgress) {
        onProgress(createUploadProgress(0, 1, 'error'));
      }
      reject(new FileProcessingError('Upload failed due to network error'));
    });
    
    xhr.addEventListener('abort', () => {
      if (onProgress) {
        onProgress(createUploadProgress(0, 1, 'error'));
      }
      reject(new FileProcessingError('Upload was aborted'));
    });
    
    try {
      xhr.open('POST', url);
      xhr.send(formData);
    } catch (error) {
      reject(new FileProcessingError(`Failed to start upload: ${error}`));
    }
  });
}

// File chunking for large uploads
export function chunkFile(file: File, chunkSize: number = FILE_CONSTRAINTS.CHUNK_SIZE): Blob[] {
  if (!(file instanceof File)) {
    throw new FileProcessingError('Invalid file object for chunking');
  }
  
  if (chunkSize <= 0) {
    throw new FileProcessingError('Chunk size must be positive');
  }

  const chunks: Blob[] = [];
  let offset = 0;
  
  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize);
    chunks.push(chunk);
    offset += chunkSize;
  }
  
  return chunks;
}

// File type detection
export function detectFileType(file: File): 'image' | 'document' | 'text' | 'unknown' {
  if (!(file instanceof File)) return 'unknown';
  
  if (isImageMimeType(file.type)) return 'image';
  if (isDocumentMimeType(file.type)) return 'document';
  if (file.type.startsWith('text/')) return 'text';
  return 'unknown';
}

// Batch file processing
export async function processBatchFiles(
  files: FileList | File[],
  onProgress?: (index: number, total: number, processedFile: ProcessedFile | null) => void
): Promise<ProcessedFile[]> {
  if (!files) {
    throw new FileProcessingError('No files provided for batch processing');
  }

  const fileArray = Array.from(files);
  const results: ProcessedFile[] = [];
  
  for (let i = 0; i < fileArray.length; i++) {
    const currentFile = fileArray[i];
    
    if (!currentFile) {
      logger.error('Undefined file in batch processing', new Error('File is undefined'), {
        fileIndex: i,
      });
      continue;
    }
    
    try {
      const processedFile = await processFile(currentFile);
      results.push(processedFile);
      
      if (onProgress) {
        onProgress(i + 1, fileArray.length, processedFile);
      }
      
    } catch (error) {
      logger.error('Failed to process file in batch', error as Error, {
        fileName: currentFile.name || 'unknown',
        fileIndex: i,
      });
      
      // Create a failed processing result
      const failedFile: ProcessedFile = {
        file: currentFile,
        metadata: {
          name: currentFile.name || 'unknown',
          size: currentFile.size || 0,
          type: currentFile.type || 'unknown',
          extension: getFileExtension(currentFile.name || ''),
          error: error instanceof Error ? error.message : String(error),
          uploadedAt: new Date().toISOString(),
        },
      };
      
      results.push(failedFile);
      
      if (onProgress) {
        onProgress(i + 1, fileArray.length, null);
      }
    }
  }
  
  return results;
}

// Utility function to check if file processing is supported
export function isFileProcessingSupported(): boolean {
  return typeof FileReader !== 'undefined' && 
         typeof File !== 'undefined' && 
         typeof Blob !== 'undefined';
}

// Clean up function for any created object URLs
export function cleanupObjectURL(url: string): void {
  if (typeof url === 'string' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}