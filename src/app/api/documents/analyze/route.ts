import { NextRequest, NextResponse } from 'next/server'

// Storage validation
import { validateStorageForUpload, validateFile } from '../../../../lib/storage/validation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60 seconds timeout for PDF processing

// Document analysis API endpoint
export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 })
    }

    // Validate file before processing
    const fileValidation = validateFile(file, 'documents', 'free') // TODO: Get actual subscription tier

    if (!fileValidation.valid) {
      return NextResponse.json({
        success: false,
        error: fileValidation.error,
        fileInfo: fileValidation.fileInfo
      }, { status: 400 })
    }

    // Validate storage limits
    const storageValidation = await validateStorageForUpload(fileValidation.fileInfo!.sizeMB)

    if (!storageValidation.canUpload) {
      return NextResponse.json({
        success: false,
        error: storageValidation.error,
        storageInfo: storageValidation.storageInfo
      }, { status: 413 })
    }

    // Convert File to Buffer for processing
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract text based on file type
    let extractedText = ''
    let analysis = {}

    try {
      switch (file.type) {
        case 'application/pdf':
          extractedText = await extractPdfText(buffer)
          break

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          extractedText = await extractDocxText(buffer)
          break

        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          extractedText = await extractXlsxText(buffer)
          break

        case 'text/plain':
          extractedText = buffer.toString('utf-8')
          break

        case 'application/msword':
          // Basic .doc support - fallback to filename info only
          extractedText = `Document: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\nFormat: Microsoft Word Document (.doc)`
          break

        case 'image/jpeg':
        case 'image/jpg':
        case 'image/png':
        case 'image/tiff':
        case 'image/bmp':
        case 'image/webp':
          extractedText = await extractImageText(buffer, file.type)
          break

        default:
          return NextResponse.json({
            success: false,
            error: `Unsupported file type: ${file.type}`,
            fileInfo: fileValidation.fileInfo
          }, { status: 400 })
      }

      // Generate AI analysis if text extraction successful
      if (extractedText.trim().length > 0) {
        analysis = await generateDocumentAnalysis(extractedText, file.name)
      }

    } catch (extractionError) {
      console.error('Text extraction failed:', extractionError)

      // Still try to get some analysis even with extraction error
      const errorMessage = extractionError instanceof Error ? extractionError.message : 'Unknown error'
      extractedText = `Document Processing Status: ${errorMessage}\n\nFile Information:\n` +
        `- Name: ${file.name}\n` +
        `- Size: ${(file.size / 1024).toFixed(1)} KB\n` +
        `- Type: ${file.type}\n` +
        `- Upload Date: ${new Date().toISOString()}\n\n` +
        `Note: Text extraction encountered an issue, but the file was successfully uploaded.`

      // Try to generate analysis even with limited info
      try {
        analysis = await generateDocumentAnalysis(extractedText, file.name)
      } catch (analysisError) {
        console.error('Analysis also failed:', analysisError)
        analysis = {
          summary: `Document uploaded but text extraction failed: ${errorMessage}. The file appears to be a ${file.type} document of ${(file.size / (1024 * 1024)).toFixed(2)} MB.`,
          keyPoints: [
            `Document name: ${file.name}`,
            `File size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            `File type: ${file.type}`,
            `Extraction issue: ${errorMessage}`
          ],
          documentType: file.type.includes('pdf') ? 'PDF Document' : 'Document',
          researchRelevance: 'Unable to analyze content due to extraction issue',
          error: 'Text extraction failed but file uploaded successfully'
        }
      }
    }

    return NextResponse.json({
      success: true,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        sizeMB: parseFloat((file.size / (1024 * 1024)).toFixed(2))
      },
      extractedText: extractedText.substring(0, 5000), // Limit text length
      analysis,
      storageInfo: storageValidation.storageInfo,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Document analysis error:', error)
    return NextResponse.json({
      success: false,
      error: 'Document analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Extract text from PDF files
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    console.log('Starting PDF text extraction...');
    const pdfParse = (await import('pdf-parse')).default

    console.log(`Processing PDF buffer of size: ${buffer.length} bytes`);

    // Enhanced PDF parsing with options - try different configurations
    let data;
    try {
      // First attempt with standard options
      data = await pdfParse(buffer, {
        max: 50  // Increase page processing limit
      })
    } catch (parseError) {
      console.log('Standard parsing failed, trying with different options:', parseError);
      // Fallback attempt with minimal options
      data = await pdfParse(buffer)
    }

    console.log(`PDF parsing completed. Pages: ${data.numpages}, Info:`, data.info);
    const extractedText = data.text?.trim()
    console.log(`Extracted text length: ${extractedText?.length || 0} characters`);

    if (extractedText && extractedText.length > 10) {
      console.log(`PDF extraction successful: ${extractedText.length} characters extracted`);
      // Log first 200 characters for debugging
      console.log('First 200 characters:', extractedText.substring(0, 200));
      return extractedText
    } else {
      // If minimal text found, might be a scanned PDF - still return what we have
      console.warn(`PDF contains minimal text (${extractedText?.length || 0} characters) - may be scanned document`);

      // Return metadata info if no text content
      const metadataText = `PDF Document Analysis\n` +
        `Pages: ${data.numpages}\n` +
        `Title: ${data.info?.Title || 'Not specified'}\n` +
        `Author: ${data.info?.Author || 'Not specified'}\n` +
        `Subject: ${data.info?.Subject || 'Not specified'}\n` +
        `Content: This appears to be a ${data.numpages}-page PDF document. ` +
        `${extractedText || 'No extractable text found - this may be a scanned document or image-based PDF.'}`;

      return metadataText;
    }

  } catch (error) {
    console.error('PDF extraction error:', error)

    // More detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : 'No stack trace'
    console.error('PDF extraction failed with error:', errorMessage)
    console.error('Error stack:', errorStack)

    // Instead of throwing, return a descriptive message that can still be analyzed
    const fallbackText = `PDF Document Analysis\n\n` +
      `File Name: ${buffer ? 'PDF file received' : 'No buffer'}\n` +
      `Processing Error: ${errorMessage}\n\n` +
      `This PDF file could not be processed for text extraction. Possible reasons:\n` +
      `- The PDF may be image-based or scanned (requires OCR)\n` +
      `- The PDF may be password-protected or encrypted\n` +
      `- The PDF format may be corrupted or non-standard\n` +
      `- There may be a temporary processing issue\n\n` +
      `The file has been successfully uploaded and can be manually reviewed.`;

    console.log('Returning fallback text for PDF analysis');
    return fallbackText;
  }
}

/**
 * Extract text from DOCX files
 */
async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value || 'No text found in DOCX'
  } catch (error) {
    console.error('DOCX extraction error:', error)
    throw new Error('Failed to extract text from DOCX')
  }
}

/**
 * Extract text from XLSX files
 */
async function extractXlsxText(buffer: Buffer): Promise<string> {
  try {
    const XLSX = await import('xlsx')
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    let allText = ''

    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName]
      const sheetText = XLSX.utils.sheet_to_csv(worksheet)
      allText += `Sheet: ${sheetName}\n${sheetText}\n\n`
    })

    return allText || 'No data found in spreadsheet'
  } catch (error) {
    console.error('XLSX extraction error:', error)
    throw new Error('Failed to extract data from XLSX')
  }
}

/**
 * Extract text from images using OCR (Tesseract.js)
 */
async function extractImageText(buffer: Buffer, mimeType: string): Promise<string> {
  try {
    const { createWorker } = await import('tesseract.js')

    // Create OCR worker with English language support
    const worker = await createWorker('eng', 1, {
      logger: m => console.log(m) // Optional: log OCR progress
    })

    // Perform OCR on the image buffer
    const { data: { text } } = await worker.recognize(buffer)

    // Terminate worker to free memory
    await worker.terminate()

    // Return extracted text or fallback message
    const extractedText = text.trim()
    if (extractedText.length > 0) {
      return `Image OCR Results:\n${extractedText}`
    } else {
      return `Image processed successfully but no readable text found.\nImage Type: ${mimeType}`
    }

  } catch (error) {
    console.error('OCR extraction error:', error)
    throw new Error(`Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate AI-powered document analysis using GPT-4o mini
 */
async function generateDocumentAnalysis(text: string, fileName: string): Promise<any> {
  try {
    // Prepare text for analysis (limit size for API)
    const analysisText = text.substring(0, 3000) // Limit for GPT processing

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a document analysis assistant. Analyze the provided document text and provide a structured summary with key points, document type, and research relevance. Return your response in JSON format with fields: summary, keyPoints (array), documentType, and researchRelevance.'
          },
          {
            role: 'user',
            content: `Analyze this document "${fileName}":\n\n${analysisText}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const analysisContent = data.choices[0]?.message?.content

    if (!analysisContent) {
      throw new Error('No analysis content received')
    }

    // Try to parse as JSON, fallback to text analysis
    try {
      return JSON.parse(analysisContent)
    } catch (parseError) {
      // Fallback: create structured response from text
      return {
        summary: analysisContent,
        keyPoints: ['AI analysis completed', `Document: ${fileName}`],
        documentType: 'Document',
        researchRelevance: 'Analysis available'
      }
    }

  } catch (error) {
    console.error('AI analysis error:', error)

    // Fallback analysis
    return {
      summary: `Document "${fileName}" uploaded successfully. AI analysis unavailable - using basic text extraction.`,
      keyPoints: [
        `Document name: ${fileName}`,
        `Text length: ${text.length} characters`,
        'Basic document processing completed'
      ],
      documentType: 'Document',
      researchRelevance: 'Analysis unavailable',
      error: 'AI analysis failed'
    }
  }
}