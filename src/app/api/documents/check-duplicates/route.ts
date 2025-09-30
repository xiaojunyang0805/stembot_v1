import { NextRequest, NextResponse } from 'next/server'
import { DocumentDuplicateDetector, createDuplicateMessage } from '../../../../lib/documents/duplicateDetector'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Check for duplicate documents before upload
 */
export async function POST(request: NextRequest) {
  try {
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
      timestamp: new Date().toISOString()
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