import { NextRequest, NextResponse } from 'next/server'
import { DocumentDuplicateDetector, createDuplicateMessage } from '../../../../lib/documents/duplicateDetector'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Check for duplicate documents before upload
 */
export async function POST(request: NextRequest) {
  try {

    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const extractedText = formData.get('extractedText') as string | null

    if (!file || !projectId) {
      return NextResponse.json({
        success: false,
        error: 'Missing file or project ID'
      }, { status: 400 })
    }

    const detector = new DocumentDuplicateDetector()
    const result = await detector.detectDuplicates(
      projectId,
      file,
      extractedText || undefined
    )

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