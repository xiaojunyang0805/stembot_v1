import { NextRequest, NextResponse } from 'next/server'
import { DocumentDuplicateDetector, createDuplicateMessage } from '../../../../lib/documents/duplicateDetector'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Check for duplicate documents before upload
 */
export async function POST(request: NextRequest) {
  try {
    // Clear debug info for this request
    global.debugInfo = [];
    global.debugInfo.push('API STARTED');
    console.log('🔍 DUPLICATE CHECK API - Starting duplicate detection...');

    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const extractedText = formData.get('extractedText') as string | null

    console.log('📄 File details:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      projectId: projectId
    });

    if (!file || !projectId) {
      console.error('❌ Missing required parameters:', { file: !!file, projectId: !!projectId });
      return NextResponse.json({
        success: false,
        error: 'Missing file or project ID'
      }, { status: 400 })
    }

    console.log('🔧 Creating duplicate detector...');
    const detector = new DocumentDuplicateDetector()

    console.log('🔍 Running duplicate detection...');
    const result = await detector.detectDuplicates(
      projectId,
      file,
      extractedText || undefined
    )

    console.log('📊 Duplicate detection result:', {
      isDuplicate: result.isDuplicate,
      confidence: result.confidence,
      matchCount: result.matchedDocuments.length,
      recommendation: result.recommendation
    });

    // Enhanced debugging for troubleshooting
    console.log('🔍 ENHANCED DEBUGGING:');
    console.log('📄 Input file details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      extractedTextLength: extractedText?.length || 0
    });

    if (result.matchedDocuments.length > 0) {
      console.log('🎯 FOUND POTENTIAL MATCHES:');
      result.matchedDocuments.forEach((match, index) => {
        console.log(`  Match ${index + 1}:`, {
          id: match.id,
          filename: match.originalName,
          similarity: `${match.similarity}%`,
          matchType: match.matchType,
          similarity_threshold: 'Need >70% for duplicate detection'
        });
      });
    } else {
      console.log('❌ NO POTENTIAL MATCHES: Either no documents in database or all similarities < 30%');
    }

    if (result.isDuplicate) {
      console.log('⚠️ DUPLICATES FOUND:', result.matchedDocuments.map(match => ({
        filename: match.originalName,
        similarity: match.similarity,
        matchType: match.matchType
      })));
    } else {
      console.log('✅ No duplicates detected');
    }

    // Create user-friendly message
    const message = result.isDuplicate ? createDuplicateMessage(result) : ''

    const response = {
      success: true,
      isDuplicate: result.isDuplicate,
      confidence: result.confidence,
      matches: result.matchedDocuments,
      recommendation: result.recommendation,
      message,
      timestamp: new Date().toISOString(),
      debug: global.debugInfo || [] // Include debug info for testing
    };

    console.log('📤 Sending response:', response);

    return NextResponse.json(response)

  } catch (error) {
    console.error('Duplicate check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Duplicate check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}