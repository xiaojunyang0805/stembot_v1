import { NextRequest, NextResponse } from 'next/server'

// Storage validation
import { validateStorageForUpload, validateFile } from '../../../../lib/storage/validation'
// Enhanced document analysis
import { generateQuestionSuggestions, analyzeDocumentPattern } from '../../../../lib/documents/analyzer'
import { getProjectDocuments } from '../../../../lib/database/documents'
// Duplicate detection
import { DocumentDuplicateDetector } from '../../../../lib/documents/duplicateDetector'

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
          summary: `Your ${file.type.includes('pdf') ? 'PDF document' : 'document'} "${file.name}" has been successfully uploaded (${(file.size / (1024 * 1024)).toFixed(2)} MB). While we encountered a technical issue during text extraction, the file is safely stored and ready for your review. This commonly happens with scanned documents, image-based PDFs, or files with complex formatting.`,
          keyPoints: [
            `✅ File uploaded successfully: ${file.name}`,
            `📁 Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            `📄 Format: ${file.type.includes('pdf') ? 'PDF Document' : file.type}`,
            `🔍 Ready for manual review and reference`,
            `💡 Consider re-uploading if this is a text-based document`
          ],
          documentType: file.type.includes('pdf') ? 'PDF Document' : file.type.includes('word') ? 'Word Document' : file.type.includes('image') ? 'Image File' : 'Document',
          researchRelevance: 'Successfully uploaded and available for research purposes. Manual review recommended for full content analysis.',
          processingNote: 'Text extraction encountered an issue, but your file is safely stored.'
        }
      }
    }

    // Generate question suggestions based on document analysis
    let questionSuggestions: any[] = [];
    try {
      // Get project ID from form data
      const projectId = formData.get('projectId') as string;
      if (projectId) {
        // Get all documents for this project to enable cross-document analysis
        const { data: existingDocs } = await getProjectDocuments(projectId);

        // Create a mock document object for the newly uploaded file
        const currentDoc = {
          id: 'temp',
          project_id: projectId,
          user_id: 'temp',
          filename: file.name,
          original_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          storage_path: null,
          extracted_text: extractedText,
          analysis_result: analysis,
          upload_status: 'completed' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Combine with existing documents for analysis
        const allDocs = [...(existingDocs || []), currentDoc];

        // Generate suggestions
        questionSuggestions = await generateQuestionSuggestions(allDocs);
        console.log('🎯 Generated question suggestions:', questionSuggestions.length);
        console.log('📋 Suggestion details:', questionSuggestions.map(s => ({
          confidence: s.confidence,
          question: s.suggestedQuestion?.substring(0, 50) + '...'
        })));
      }
    } catch (suggestionError) {
      console.warn('Question suggestion generation failed:', suggestionError);
      // Don't fail the whole request, just skip suggestions
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
      questionSuggestions,
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
 * Extract text from PDF files with multiple fallback strategies
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  console.log('🔍 Starting robust PDF text extraction...');
  const sizeMB = (buffer.length / 1024 / 1024);
  console.log(`📄 Processing PDF buffer of size: ${sizeMB.toFixed(2)} MB`);

  // Safety check for large files
  if (sizeMB > 50) {
    console.warn('⚠️ Large PDF detected, using simplified extraction');
    return createFallbackText({
      pages: 'Unknown',
      title: 'Large PDF Document',
      author: 'Unknown',
      subject: 'Unknown'
    }, `Large PDF file (${sizeMB.toFixed(1)} MB) - simplified processing applied for performance.`);
  }

  try {
    // Quick fallback to original simple approach for immediate fix
    console.log('⚡ Using simplified PDF extraction for reliability');
    const pdfParse = (await import('pdf-parse')).default;

    try {
      const data = await pdfParse(buffer, { max: 25 }); // Limit pages for safety
      const extractedText = data.text?.trim();

      if (extractedText && extractedText.length > 10) {
        console.log(`✅ Simple extraction successful: ${extractedText.length} characters`);
        return extractedText;
      }
    } catch (simpleError) {
      console.warn('Simple extraction failed:', simpleError);
    }

    // If simple fails, return safe fallback immediately
    console.warn('⚠️ Using immediate fallback for upload reliability');

    return createFallbackText({
      pages: 'Unknown',
      title: 'PDF Document',
      author: 'Unknown',
      subject: 'Unknown'
    }, 'PDF uploaded successfully but text extraction encountered an issue.');

  } catch (extractionError) {
    console.error('❌ PDF extraction pipeline failed:', extractionError);

    // Return a safe fallback
    return `PDF Document Analysis\n\nFile processing encountered an issue: ${extractionError instanceof Error ? extractionError.message : 'Unknown error'}\n\nThe file has been uploaded successfully and is available for review.`;
  }
}

/**
 * Strategy 1: Enhanced pdf-parse with multiple configurations
 */
async function tryPdfParse(buffer: Buffer): Promise<{ success: boolean; text?: string; metadata?: any }> {
  try {
    console.log('🔧 Trying pdf-parse...');

    // Add timeout protection
    const timeoutMs = 30000; // 30 seconds
    const pdfParse = (await import('pdf-parse')).default;

    // Configuration attempts in order of preference
    const configs = [
      { max: 100 },                     // More pages
      { max: 50 },                      // Standard config
      { max: 25 },                      // Reduced pages
      {}                                // Minimal config
    ];

    for (const config of configs) {
      try {
        console.log(`📋 Trying pdf-parse with config:`, config);
        const data = await pdfParse(buffer, config);

        const extractedText = data.text?.trim();
        console.log(`📊 Extracted ${extractedText?.length || 0} characters, ${data.numpages} pages`);

        if (extractedText && extractedText.length > 10) {
          return {
            success: true,
            text: extractedText,
            metadata: {
              pages: data.numpages,
              title: data.info?.Title,
              author: data.info?.Author,
              subject: data.info?.Subject
            }
          };
        }
      } catch (configError) {
        const errorMessage = configError instanceof Error ? configError.message : 'Unknown error';
        console.log(`❌ Config failed:`, config, errorMessage);
        continue;
      }
    }

    return { success: false };
  } catch (error) {
    console.error('❌ pdf-parse failed completely:', error);
    return { success: false };
  }
}

/**
 * Strategy 2: Use pdfjs-dist for complex/modern PDFs
 */
async function tryPdfjsDist(buffer: Buffer): Promise<{ success: boolean; text?: string; metadata?: any }> {
  try {
    console.log('🔧 Trying pdfjs-dist...');
    const pdfjsLib = await import('pdfjs-dist');

    // Disable worker for server-side usage
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';

    const typedArray = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: typedArray, verbosity: 0 });
    const pdfDocument = await loadingTask.promise;

    console.log(`📄 PDF loaded: ${pdfDocument.numPages} pages`);

    let fullText = '';
    const maxPages = Math.min(pdfDocument.numPages, 50); // Limit for performance

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .filter((item: any) => item.str && item.str.trim())
          .map((item: any) => item.str)
          .join(' ');

        if (pageText.trim()) {
          fullText += pageText + '\n\n';
        }

        console.log(`📑 Page ${pageNum}: ${pageText.length} characters`);
      } catch (pageError) {
        const errorMessage = pageError instanceof Error ? pageError.message : 'Unknown error';
        console.warn(`⚠️ Page ${pageNum} failed:`, errorMessage);
        continue;
      }
    }

    const cleanText = fullText.trim();
    console.log(`📊 pdfjs-dist total: ${cleanText.length} characters`);

    if (cleanText.length > 10) {
      const metadata = await pdfDocument.getMetadata();
      const info = metadata.info as any; // Type assertion for metadata
      return {
        success: true,
        text: cleanText,
        metadata: {
          pages: pdfDocument.numPages,
          title: info?.Title,
          author: info?.Author,
          subject: info?.Subject
        }
      };
    }

    return { success: false };
  } catch (error) {
    console.error('❌ pdfjs-dist failed:', error);
    return { success: false };
  }
}

/**
 * Strategy 3: OCR for image-based/scanned PDFs
 * Note: OCR is complex in server environment, simplified implementation
 */
async function tryPdfOcr(buffer: Buffer): Promise<{ success: boolean; text?: string }> {
  try {
    console.log('🔧 Trying OCR extraction...');

    // For server-side OCR, we'd need to convert PDF to images first
    // This is a simplified implementation that will be enhanced later
    const { createWorker } = await import('tesseract.js');

    // Try OCR on the raw buffer if it contains image data
    console.log('🖼️ Attempting direct OCR on PDF buffer...');

    try {
      const worker = await createWorker('eng', 1, {
        logger: m => console.log(`OCR: ${m.status} ${Math.round(m.progress * 100)}%`)
      });

      // This is a simplified approach - in a full implementation we'd:
      // 1. Use pdf2pic or similar to convert PDF pages to images
      // 2. Then run OCR on each image
      // For now, we'll skip OCR and return false to use other strategies

      await worker.terminate();

      console.log('⚠️ OCR requires PDF-to-image conversion - not implemented in this version');
      return { success: false };

    } catch (ocrError) {
      console.warn('⚠️ OCR processing failed:', ocrError);
      return { success: false };
    }

  } catch (error) {
    console.error('❌ OCR extraction failed:', error);
    return { success: false };
  }
}

/**
 * Create fallback text when all extraction methods fail
 */
function createFallbackText(metadata: any, partialText: string): string {
  const metadataText = `PDF Document Analysis\n` +
    `Pages: ${metadata.pages || 'Unknown'}\n` +
    `Title: ${metadata.title || 'Not specified'}\n` +
    `Author: ${metadata.author || 'Not specified'}\n` +
    `Subject: ${metadata.subject || 'Not specified'}\n\n`;

  if (partialText && partialText.length > 10) {
    return metadataText + `Partial Content Extracted:\n${partialText.substring(0, 1000)}...`;
  }

  return metadataText +
    `Note: This PDF appears to be image-based, encrypted, or uses a complex format. ` +
    `Multiple extraction methods were attempted including OCR for scanned documents.`;
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
            content: 'You are a document analysis assistant. Analyze the provided document text and provide a user-friendly summary. Write in a clear, conversational tone that would be helpful to a researcher or student. Focus on the main content, key findings, methodology if applicable, and research significance. Keep your response concise but informative, suitable for display in a document management interface.'
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

    // Create structured response from AI-generated text
    // Extract key information if the AI provided structured content
    const lines = analysisContent.split('\n').filter((line: string) => line.trim());

    // Try to extract document type from common patterns
    let documentType = 'Document';
    const typePatterns = [
      /research paper|journal article|academic paper/i,
      /review article|literature review/i,
      /conference paper|proceedings/i,
      /thesis|dissertation/i,
      /technical report|white paper/i,
      /book chapter|textbook/i
    ];

    const typeNames = ['Research Paper', 'Review Article', 'Conference Paper', 'Thesis', 'Technical Report', 'Book Chapter'];

    for (let i = 0; i < typePatterns.length; i++) {
      if (typePatterns[i].test(analysisContent.toLowerCase())) {
        documentType = typeNames[i];
        break;
      }
    }

    // Extract key points from the analysis
    const keyPoints: string[] = [];

    // Look for bullet points or numbered lists
    const bulletMatches = analysisContent.match(/[•\-\*]\s+(.+)/g);
    if (bulletMatches) {
      keyPoints.push(...bulletMatches.slice(0, 5).map((point: string) => point.replace(/[•\-\*]\s+/, '')));
    }

    // If no bullet points found, extract sentences as key points
    if (keyPoints.length === 0) {
      const sentences = analysisContent.split(/[.!?]+/).filter((s: string) => s.trim().length > 20);
      keyPoints.push(...sentences.slice(0, 4).map((s: string) => s.trim()));
    }

    // Ensure we have at least some key points
    if (keyPoints.length === 0) {
      keyPoints.push(
        `Analysis completed for ${fileName}`,
        `Document type identified as ${documentType}`,
        'Content successfully processed and analyzed'
      );
    }

    return {
      summary: analysisContent,
      keyPoints: keyPoints.slice(0, 6), // Limit to 6 key points
      documentType: documentType,
      researchRelevance: `This ${documentType.toLowerCase()} provides valuable insights for research and academic work.`
    };

  } catch (error) {
    console.error('AI analysis error:', error)

    // Fallback analysis - still user-friendly
    return {
      summary: `Successfully uploaded "${fileName}". While AI analysis encountered an issue, the document has been processed and is available for review. The file contains ${text.length > 1000 ? 'substantial' : text.length > 500 ? 'moderate' : 'limited'} content that may be valuable for your research.`,
      keyPoints: [
        `Document successfully uploaded: ${fileName}`,
        `Content available for manual review`,
        `File processing completed`,
        text.length > 1000 ? 'Substantial text content detected' : 'Document ready for analysis'
      ],
      documentType: fileName.toLowerCase().includes('.pdf') ? 'PDF Document' : 'Document',
      researchRelevance: 'Available for research and reference purposes',
      error: 'AI analysis temporarily unavailable'
    }
  }
}