/**
 * Document to Source Conversion Service
 *
 * Converts uploaded documents to SourceData format for unified display
 * in the literature review interface, applying credibility assessment
 * to user-uploaded papers.
 *
 * Location: src/lib/services/documentToSource.ts
 */

import { SourceData, CredibilityAssessment } from '@/components/literature/SourceCard';
import { DocumentMetadata } from '@/lib/database/documents';
import { generateCredibilityAssessment } from './credibilityAssessment';

/**
 * Convert uploaded document to SourceData format
 */
export async function convertDocumentToSource(
  document: DocumentMetadata,
  researchQuestion: string
): Promise<SourceData> {
  const analysis = document.analysis_result as any;

  // Extract metadata from AI analysis
  const extractedMetadata = extractDocumentMetadata(analysis, document);

  // Generate credibility assessment for uploaded document
  const credibility = await generateDocumentCredibility(extractedMetadata, analysis, researchQuestion);

  return {
    id: `doc-${document.id}`,
    title: extractedMetadata.title || document.original_name.replace(/\.[^/.]+$/, ''), // Remove file extension
    authors: extractedMetadata.authors || ['Unknown Author'],
    journal: extractedMetadata.journal || 'Uploaded Document',
    year: extractedMetadata.year || new Date(document.created_at).getFullYear(),
    doi: extractedMetadata.doi || undefined,
    abstract: extractedMetadata.abstract || analysis?.summary || 'User uploaded document',
    keyFindings: extractedMetadata.keyFindings || analysis?.keyPoints?.slice(0, 5) || [],
    relevanceExplanation: generateRelevanceExplanation(analysis, researchQuestion),
    fullTextUrl: undefined, // Uploaded documents don't have external URLs
    credibility,
    isSaved: true, // Uploaded documents are always "saved"
    addedToProject: true,
    // Additional metadata to identify this as an uploaded document
    isUploaded: true,
    documentId: document.id,
    originalFileName: document.original_name,
    uploadDate: document.created_at
  };
}

/**
 * Extract structured metadata from document analysis
 */
function extractDocumentMetadata(analysis: any, document: DocumentMetadata) {
  // Try to extract structured data from AI analysis
  const metadata = {
    title: null as string | null,
    authors: null as string[] | null,
    journal: null as string | null,
    year: null as number | null,
    doi: null as string | null,
    abstract: null as string | null,
    keyFindings: null as string[] | null
  };

  if (!analysis) return metadata;

  // Extract title (prioritize actual document title over filename)
  if (analysis.title && analysis.title !== document.original_name) {
    metadata.title = analysis.title;
  } else if (analysis.documentTitle) {
    metadata.title = analysis.documentTitle;
  }

  // Extract authors
  if (analysis.authors && Array.isArray(analysis.authors)) {
    metadata.authors = analysis.authors;
  } else if (analysis.author) {
    metadata.authors = [analysis.author];
  }

  // Extract journal/publication venue
  if (analysis.journal) {
    metadata.journal = analysis.journal;
  } else if (analysis.publication) {
    metadata.journal = analysis.publication;
  } else if (analysis.venue) {
    metadata.journal = analysis.venue;
  }

  // Extract publication year
  if (analysis.year && typeof analysis.year === 'number') {
    metadata.year = analysis.year;
  } else if (analysis.publicationYear) {
    metadata.year = parseInt(analysis.publicationYear);
  } else if (analysis.date) {
    const yearMatch = analysis.date.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      metadata.year = parseInt(yearMatch[0]);
    }
  }

  // Extract DOI
  if (analysis.doi) {
    metadata.doi = analysis.doi;
  }

  // Extract abstract
  if (analysis.abstract && analysis.abstract !== analysis.summary) {
    metadata.abstract = analysis.abstract;
  }

  // Extract key findings
  if (analysis.keyPoints && Array.isArray(analysis.keyPoints)) {
    metadata.keyFindings = analysis.keyPoints.slice(0, 5); // Limit to 5 findings
  } else if (analysis.keyFindings && Array.isArray(analysis.keyFindings)) {
    metadata.keyFindings = analysis.keyFindings.slice(0, 5);
  }

  return metadata;
}

/**
 * Generate credibility assessment for uploaded document
 */
async function generateDocumentCredibility(
  metadata: any,
  analysis: any,
  researchQuestion: string
): Promise<CredibilityAssessment> {
  try {
    // Create partial source data for credibility assessment
    const partialSource = {
      title: metadata.title || 'Uploaded Document',
      journal: metadata.journal || 'Unknown',
      year: metadata.year || new Date().getFullYear(),
      authors: metadata.authors || ['Unknown'],
      credibility: {
        publicationYear: metadata.year || new Date().getFullYear(),
        studyType: detectStudyType(analysis),
        sampleSize: extractSampleSize(analysis)
      }
    };

    // Generate AI-powered credibility assessment
    const credibility = await generateCredibilityAssessment(partialSource as any, researchQuestion);

    // Enhance with document-specific adjustments
    return enhanceUploadedDocumentCredibility(credibility, analysis, metadata);

  } catch (error) {
    console.warn('Error generating credibility for uploaded document:', error);

    // Fallback credibility assessment
    return generateFallbackDocumentCredibility(metadata, analysis);
  }
}

/**
 * Enhance credibility assessment for uploaded documents
 */
function enhanceUploadedDocumentCredibility(
  credibility: CredibilityAssessment,
  analysis: any,
  metadata: any
): CredibilityAssessment {
  const enhancedStrengths = [...credibility.strengths];
  const enhancedLimitations = [...credibility.limitations];

  // Add upload-specific considerations
  enhancedStrengths.push('Document directly uploaded by user');

  if (analysis && analysis.summary) {
    enhancedStrengths.push('AI analysis completed');
  }

  if (!metadata.journal || metadata.journal === 'Uploaded Document') {
    enhancedLimitations.push('Publication venue unknown - cannot verify peer review status');
  }

  if (!metadata.authors || metadata.authors.includes('Unknown Author')) {
    enhancedLimitations.push('Author information incomplete');
  }

  // Adjust explanation for uploaded documents
  const uploadExplanation = credibility.explanation.replace(
    /This (source|paper)/g,
    'This uploaded document'
  ) + ' Since you uploaded this document, it may be highly relevant to your research, but consider verifying its publication status and peer review.';

  return {
    ...credibility,
    strengths: enhancedStrengths,
    limitations: enhancedLimitations,
    explanation: uploadExplanation
  };
}

/**
 * Generate fallback credibility for uploaded documents
 */
function generateFallbackDocumentCredibility(metadata: any, analysis: any): CredibilityAssessment {
  const currentYear = new Date().getFullYear();
  const year = metadata.year || currentYear;
  const age = currentYear - year;

  let level: 'High' | 'Moderate' | 'Low' = 'Moderate';
  let score = 60; // Start with moderate score for uploaded documents

  const strengths = ['Document uploaded by user', 'Available for detailed review'];
  const limitations = ['Publication status unknown', 'Peer review status unclear'];

  // Adjust based on available metadata
  if (metadata.journal && metadata.journal !== 'Uploaded Document') {
    strengths.push('Publication venue identified');
    score += 10;
  }

  if (metadata.authors && !metadata.authors.includes('Unknown Author')) {
    strengths.push('Author information available');
    score += 5;
  }

  if (age <= 5) {
    strengths.push('Recent publication');
    score += 10;
  } else if (age > 10) {
    limitations.push('Older publication (may be outdated)');
    score -= 10;
  }

  if (analysis && analysis.summary) {
    strengths.push('AI analysis completed');
    score += 5;
  }

  // Determine final level
  if (score >= 80) level = 'High';
  else if (score < 50) level = 'Low';

  return {
    level,
    score: Math.max(30, Math.min(90, score)), // Keep within reasonable bounds
    strengths,
    limitations,
    explanation: `This uploaded document has ${level.toLowerCase()} credibility based on available information. Since you uploaded it, it may be highly relevant to your research. Consider verifying its publication status, peer review process, and methodology to fully assess its reliability for academic use.`,
    publicationYear: year,
    studyType: detectStudyType(analysis)
  };
}

/**
 * Generate relevance explanation based on research question
 */
function generateRelevanceExplanation(analysis: any, researchQuestion: string): string {
  if (!analysis || !analysis.summary) {
    return `This uploaded document may contain relevant information for your research question: "${researchQuestion}". Review the document content to determine its specific relevance and key contributions.`;
  }

  // Extract key themes from analysis
  const summary = analysis.summary.toLowerCase();
  const question = researchQuestion.toLowerCase();

  // Simple keyword matching for relevance
  const questionWords = question.split(' ').filter(word => word.length > 3);
  const relevantWords = questionWords.filter(word => summary.includes(word));

  if (relevantWords.length > 0) {
    return `This document appears relevant to your research as it discusses topics related to ${relevantWords.join(', ')}. The AI analysis suggests it contains information that could contribute to understanding your research question about ${researchQuestion}.`;
  }

  return `This uploaded document may provide valuable background or methodological insights for your research on "${researchQuestion}". Review the content to identify specific connections and contributions to your research objectives.`;
}

/**
 * Detect study type from analysis
 */
function detectStudyType(analysis: any): string | undefined {
  if (!analysis || !analysis.summary) return undefined;

  const text = analysis.summary.toLowerCase();

  if (text.includes('meta-analysis') || text.includes('systematic review')) {
    return 'Meta-analysis/Systematic Review';
  } else if (text.includes('randomized') && text.includes('controlled')) {
    return 'Randomized Controlled Trial';
  } else if (text.includes('cohort') || text.includes('longitudinal')) {
    return 'Cohort Study';
  } else if (text.includes('cross-sectional')) {
    return 'Cross-sectional Study';
  } else if (text.includes('case study') || text.includes('case report')) {
    return 'Case Study';
  } else if (text.includes('survey') || text.includes('questionnaire')) {
    return 'Survey Study';
  } else if (text.includes('experimental') || text.includes('experiment')) {
    return 'Experimental Study';
  } else if (text.includes('qualitative') || text.includes('interview')) {
    return 'Qualitative Study';
  }

  return 'Research Study';
}

/**
 * Extract sample size from analysis
 */
function extractSampleSize(analysis: any): number | undefined {
  if (!analysis || !analysis.summary) return undefined;

  const text = analysis.summary;

  // Look for patterns like "n=123", "N=123", "sample of 123", "123 participants", etc.
  const patterns = [
    /n\s*=\s*(\d+)/i,
    /N\s*=\s*(\d+)/i,
    /sample\s+of\s+(\d+)/i,
    /(\d+)\s+participants/i,
    /(\d+)\s+subjects/i,
    /(\d+)\s+patients/i,
    /(\d+)\s+individuals/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const size = parseInt(match[1]);
      if (size > 0 && size < 1000000) { // Reasonable bounds
        return size;
      }
    }
  }

  return undefined;
}