/**
 * Enhanced Document Analyzer
 * Automatically suggests research questions based on uploaded documents
 * Monitors student progress and provides proactive help when stuck
 */

import type { DocumentMetadata } from '../database/documents'

// Document analysis interfaces
export interface DocumentQuestionSuggestion {
  confidence: number; // 0-100
  suggestedQuestion: string;
  reasoning: string;
  documentBasis: string;
  variables?: {
    independent?: string;
    dependent?: string;
    population?: string;
  };
}

export interface StudentProgressCheck {
  isStuck: boolean;
  stuckIndicators: string[];
  suggestedHelp?: string;
  timeSinceLastProgress: number; // minutes
}

export interface DocumentPattern {
  type: 'data' | 'literature' | 'methodology' | 'lab_notes';
  confidence: number;
  keyElements: string[];
}

/**
 * Analyze document type and extract patterns for question suggestions
 */
export function analyzeDocumentPattern(document: DocumentMetadata): DocumentPattern {
  const filename = document.original_name.toLowerCase();
  const mimeType = document.mime_type;
  const text = document.extracted_text || '';
  const analysis = document.analysis_result as any;

  // Data files (Excel/CSV)
  if (mimeType.includes('spreadsheet') || filename.includes('.csv') || filename.includes('.xlsx')) {
    const dataPatterns = extractDataPatterns(text, analysis);
    return {
      type: 'data',
      confidence: dataPatterns.length > 0 ? 85 : 60,
      keyElements: dataPatterns
    };
  }

  // Research papers (PDF) - improved handling for failed text extraction
  if (mimeType.includes('pdf')) {
    const hasMinimalText = !text || text.length < 100;
    const seemsLikeResearchPaper = hasMinimalText ? isLikelyResearchPaperFromTitle(filename) : isResearchPaper(text, analysis);

    if (seemsLikeResearchPaper) {
      let literaturePatterns: string[];

      if (hasMinimalText) {
        // Use filename-based pattern extraction for failed text extraction
        literaturePatterns = extractPatternsFromFilename(filename);
      } else {
        literaturePatterns = extractLiteraturePatterns(text, analysis);
      }

      return {
        type: 'literature',
        confidence: literaturePatterns.length > 0 ? 75 : 60, // Slightly lower confidence for title-based
        keyElements: literaturePatterns
      };
    }
  }

  // Lab notes or methodology
  if (isLabDocument(text, filename)) {
    const methodPatterns = extractMethodologyPatterns(text);
    return {
      type: 'lab_notes',
      confidence: methodPatterns.length > 0 ? 75 : 50,
      keyElements: methodPatterns
    };
  }

  // Default methodology document
  return {
    type: 'methodology',
    confidence: 40,
    keyElements: extractGeneralPatterns(text)
  };
}

/**
 * Generate research question suggestions based on document analysis
 */
export async function generateQuestionSuggestions(
  documents: DocumentMetadata[],
  currentQuestion?: string
): Promise<DocumentQuestionSuggestion[]> {
  const suggestions: DocumentQuestionSuggestion[] = [];

  // Group documents by type
  const documentPatterns = documents.map(doc => ({
    doc,
    pattern: analyzeDocumentPattern(doc)
  }));

  // Generate suggestions for each document type
  for (const { doc, pattern } of documentPatterns) {
    if (pattern.confidence > 70) {
      const suggestion = await generateSpecificSuggestion(doc, pattern, currentQuestion);
      if (suggestion && suggestion.confidence > 70) {
        suggestions.push(suggestion);
      }
    }
  }

  // Cross-document analysis for literature reviews
  const literatureDocs = documentPatterns.filter(dp => dp.pattern.type === 'literature');
  if (literatureDocs.length >= 3) {
    const crossAnalysis = await generateCrossDocumentSuggestion(literatureDocs);
    if (crossAnalysis) {
      suggestions.push(crossAnalysis);
    }
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
}

/**
 * Check if student appears to be stuck and needs proactive help
 */
export function checkStudentProgress(
  documents: DocumentMetadata[],
  currentQuestion: string,
  projectStartTime: string,
  lastQuestionUpdate?: string
): StudentProgressCheck {
  const now = new Date();
  const projectStart = new Date(projectStartTime);
  const timeSinceStart = (now.getTime() - projectStart.getTime()) / (1000 * 60); // minutes

  const stuckIndicators: string[] = [];
  let isStuck = false;

  // Check time-based indicators
  if (timeSinceStart > 30) {
    // Been in project for 30+ minutes
    if (isVagueQuestion(currentQuestion)) {
      stuckIndicators.push('Question still vague after 30+ minutes');
      isStuck = true;
    }
  }

  // Check document upload patterns
  if (documents.length > 0) {
    const lastUpload = new Date(Math.max(...documents.map(d => new Date(d.created_at).getTime())));
    const timeSinceLastUpload = (now.getTime() - lastUpload.getTime()) / (1000 * 60);

    if (timeSinceLastUpload > 20 && isVagueQuestion(currentQuestion)) {
      stuckIndicators.push('Uploaded documents but question unchanged for 20+ minutes');
      isStuck = true;
    }

    // Check if they have good data but vague question
    const hasDataFiles = documents.some(d =>
      d.mime_type.includes('spreadsheet') || d.original_name.toLowerCase().includes('.csv')
    );

    if (hasDataFiles && isVagueQuestion(currentQuestion)) {
      stuckIndicators.push('Has data files but question lacks specificity');
      isStuck = true;
    }
  }

  // Generate proactive help suggestion
  let suggestedHelp: string | undefined;
  if (isStuck) {
    suggestedHelp = generateProactiveHelp(documents, currentQuestion, stuckIndicators);
  }

  return {
    isStuck,
    stuckIndicators,
    suggestedHelp,
    timeSinceLastProgress: lastQuestionUpdate
      ? (now.getTime() - new Date(lastQuestionUpdate).getTime()) / (1000 * 60)
      : timeSinceStart
  };
}

// Helper functions for pattern detection

function extractDataPatterns(text: string, analysis: any): string[] {
  const patterns: string[] = [];

  // Look for column headers in CSV/Excel text
  const lines = text.split('\n').slice(0, 10); // First 10 lines
  for (const line of lines) {
    if (line.includes(',') || line.includes('\t')) {
      const headers = line.split(/[,\t]/).map(h => h.trim()).filter(h => h.length > 0);
      if (headers.length >= 2) {
        patterns.push(`Variables detected: ${headers.slice(0, 4).join(', ')}`);

        // Detect potential relationships
        const sleepWords = ['sleep', 'rest', 'hour'];
        const performanceWords = ['score', 'grade', 'performance', 'test', 'result'];

        const hasSleep = headers.some(h => sleepWords.some(w => h.toLowerCase().includes(w)));
        const hasPerformance = headers.some(h => performanceWords.some(w => h.toLowerCase().includes(w)));

        if (hasSleep && hasPerformance) {
          patterns.push('Potential sleep-performance relationship detected');
        }
        break;
      }
    }
  }

  return patterns;
}

function extractLiteraturePatterns(text: string, analysis: any): string[] {
  const patterns: string[] = [];

  // Look for common research themes
  const themePatterns = [
    { keywords: ['student', 'academic', 'learning'], theme: 'Academic performance' },
    { keywords: ['sleep', 'rest', 'fatigue'], theme: 'Sleep research' },
    { keywords: ['stress', 'anxiety', 'mental health'], theme: 'Mental health' },
    { keywords: ['technology', 'social media', 'digital'], theme: 'Technology impact' },
    { keywords: ['exercise', 'physical', 'fitness'], theme: 'Physical health' }
  ];

  for (const { keywords, theme } of themePatterns) {
    if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
      patterns.push(`Research theme: ${theme}`);
    }
  }

  // Look for gap mentions
  if (text.toLowerCase().includes('future research') ||
      text.toLowerCase().includes('limitations') ||
      text.toLowerCase().includes('gap in')) {
    patterns.push('Research gaps identified');
  }

  return patterns;
}

function extractMethodologyPatterns(text: string): string[] {
  const patterns: string[] = [];

  const methodKeywords = [
    'experiment', 'survey', 'interview', 'observation',
    'control group', 'randomized', 'participants', 'sample'
  ];

  for (const keyword of methodKeywords) {
    if (text.toLowerCase().includes(keyword)) {
      patterns.push(`Methodology element: ${keyword}`);
    }
  }

  return patterns;
}

function extractGeneralPatterns(text: string): string[] {
  const patterns: string[] = [];

  if (text.length > 1000) {
    patterns.push('Substantial content for analysis');
  }

  if (text.toLowerCase().includes('research') || text.toLowerCase().includes('study')) {
    patterns.push('Research-related content');
  }

  return patterns;
}

function isLikelyResearchPaperFromTitle(filename: string): boolean {
  const researchIndicators = [
    'review', 'study', 'analysis', 'research', 'investigation',
    'journal', 'paper', 'article', 'proceedings', 'conference',
    'effect', 'impact', 'influence', 'relationship', 'comparison'
  ];

  const academicPatterns = [
    /\d{4}[_\-\s]/,  // Year pattern (e.g., "2021_", "2023-")
    /[_\-\s](review|study|analysis)[_\-\s]/i,
    /[_\-\s](effect|impact|influence)[_\-\s]/i
  ];

  const hasResearchWords = researchIndicators.some(indicator =>
    filename.toLowerCase().includes(indicator)
  );

  const hasAcademicPattern = academicPatterns.some(pattern =>
    pattern.test(filename)
  );

  return hasResearchWords || hasAcademicPattern;
}

function extractPatternsFromFilename(filename: string): string[] {
  const patterns: string[] = [];

  // Extract potential research topic from filename
  const cleanTitle = filename
    .replace(/\.pdf$/i, '')
    .replace(/\d{4}[_\-\s]/g, '') // Remove years
    .replace(/[_\-]/g, ' ')
    .trim();

  // Look for research themes in title
  const electrochemicalTerms = ['electrode', 'electrochemical', 'sensor', 'detection', 'analytical'];
  const biomedicalTerms = ['biomedical', 'diagnostic', 'medical', 'clinical', 'health'];
  const environmentalTerms = ['environmental', 'monitoring', 'field', 'portable', 'real-time'];

  if (electrochemicalTerms.some(term => filename.toLowerCase().includes(term))) {
    patterns.push('Electrochemical research focus');
  }

  if (biomedicalTerms.some(term => filename.toLowerCase().includes(term))) {
    patterns.push('Biomedical applications');
  }

  if (environmentalTerms.some(term => filename.toLowerCase().includes(term))) {
    patterns.push('Environmental monitoring applications');
  }

  // Add the cleaned title as a research area
  if (cleanTitle.length > 10) {
    patterns.push(`Research area: ${cleanTitle}`);
  }

  return patterns;
}

function isResearchPaper(text: string, analysis: any): boolean {
  const academicKeywords = [
    'abstract', 'introduction', 'methodology', 'results', 'discussion',
    'references', 'literature review', 'hypothesis', 'p <', 'significant'
  ];

  const keywordCount = academicKeywords.filter(keyword =>
    text.toLowerCase().includes(keyword)
  ).length;

  return keywordCount >= 3;
}

function isLabDocument(text: string, filename: string): boolean {
  const labKeywords = ['lab', 'experiment', 'procedure', 'protocol', 'method'];
  const filenameMatch = labKeywords.some(keyword => filename.includes(keyword));
  const contentMatch = labKeywords.some(keyword => text.toLowerCase().includes(keyword));

  return filenameMatch || contentMatch;
}

async function generateSpecificSuggestion(
  document: DocumentMetadata,
  pattern: DocumentPattern,
  currentQuestion?: string
): Promise<DocumentQuestionSuggestion | null> {
  try {
    const analysisText = document.extracted_text?.substring(0, 1500) || '';
    const documentType = pattern.type;
    const keyElements = pattern.keyElements.join('. ');

    // If text extraction failed but we have a descriptive filename, use title-based analysis
    const hasMinimalContent = !analysisText || analysisText.length < 100;
    const hasDescriptiveTitle = document.original_name.length > 10;

    let prompt: string;
    if (hasMinimalContent && hasDescriptiveTitle) {
      prompt = createTitleBasedSuggestionPrompt(document.original_name, currentQuestion);
    } else {
      prompt = createSuggestionPrompt(documentType, analysisText, keyElements, currentQuestion);
    }

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
            content: 'You are a research mentor helping students develop specific research questions. Respond with a JSON object containing: suggestedQuestion (specific research question), reasoning (brief explanation), confidence (0-100), and variables (if applicable).'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) return null;

    const parsed = JSON.parse(content);

    return {
      confidence: parsed.confidence || 75,
      suggestedQuestion: parsed.suggestedQuestion,
      reasoning: parsed.reasoning,
      documentBasis: `Based on ${document.original_name}`,
      variables: parsed.variables
    };

  } catch (error) {
    console.error('Error generating suggestion:', error);
    return null;
  }
}

async function generateCrossDocumentSuggestion(
  literatureDocs: Array<{ doc: DocumentMetadata; pattern: DocumentPattern }>
): Promise<DocumentQuestionSuggestion | null> {
  try {
    const themes = literatureDocs.flatMap(ld => ld.pattern.keyElements);
    const commonThemes = findCommonThemes(themes);

    if (commonThemes.length === 0) return null;

    const prompt = `Based on analysis of ${literatureDocs.length} research papers with common themes: ${commonThemes.join(', ')}, suggest a specific research question that could address a gap or extend this research. Focus on student populations if possible.`;

    // Similar API call structure as above
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
            content: 'You are a research mentor. Respond with JSON containing: suggestedQuestion, reasoning, confidence (0-100).'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.4
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) return null;

    const parsed = JSON.parse(content);

    return {
      confidence: parsed.confidence || 80,
      suggestedQuestion: parsed.suggestedQuestion,
      reasoning: parsed.reasoning,
      documentBasis: `Cross-analysis of ${literatureDocs.length} research papers`
    };

  } catch (error) {
    console.error('Error generating cross-document suggestion:', error);
    return null;
  }
}

function createTitleBasedSuggestionPrompt(
  filename: string,
  currentQuestion?: string
): string {
  let prompt = `Based on this research document title: "${filename}"

This appears to be a research paper. Based on the title alone, suggest a specific research question that could:
1. Build on this research area
2. Address potential gaps or applications
3. Be feasible for a student researcher
4. Follow the format "How does X affect Y in Z population?" when possible

Focus on practical applications, student-accessible populations, or extensions of the work implied by the title.`;

  if (currentQuestion) {
    prompt += `\n\nCurrent question: "${currentQuestion}". If this is vague, suggest how to make it more specific based on the research area indicated by the document title.`;
  }

  return prompt;
}

function createSuggestionPrompt(
  documentType: string,
  content: string,
  keyElements: string,
  currentQuestion?: string
): string {
  let basePrompt = '';

  switch (documentType) {
    case 'data':
      basePrompt = `This is a data file with elements: ${keyElements}. Based on the column names and data patterns, suggest a specific research question in the format "How does X affect Y in Z population?" that could be explored with this data.`;
      break;
    case 'literature':
      basePrompt = `This is a research paper with themes: ${keyElements}. Based on the content, suggest a research question that could extend this work or address gaps mentioned, preferably focusing on student populations.`;
      break;
    case 'lab_notes':
      basePrompt = `This appears to be lab notes or methodology with elements: ${keyElements}. Suggest a research question that matches this experimental approach.`;
      break;
    default:
      basePrompt = `Based on this document content: ${keyElements}, suggest a specific research question.`;
  }

  if (currentQuestion) {
    basePrompt += `\n\nCurrent question: "${currentQuestion}". If this is vague, suggest how to make it more specific based on the document.`;
  }

  basePrompt += `\n\nDocument content preview: ${content.substring(0, 500)}`;

  return basePrompt;
}

function findCommonThemes(themes: string[]): string[] {
  const themeMap = new Map<string, number>();

  for (const theme of themes) {
    const normalized = theme.toLowerCase();
    themeMap.set(normalized, (themeMap.get(normalized) || 0) + 1);
  }

  return Array.from(themeMap.entries())
    .filter(([, count]) => count >= 2)
    .map(([theme]) => theme)
    .slice(0, 3);
}

function isVagueQuestion(question: string): boolean {
  if (!question || question.length < 10) return true;

  const vaguePatterns = [
    /^(i want to|looking at|studying|researching|investigating)/i,
    /^(what|how|why) (is|are|does|do|can|will)/i
  ];

  // If it matches vague patterns and doesn't have specific elements
  const hasVagueStart = vaguePatterns.some(pattern => pattern.test(question.trim()));
  const hasSpecificElements = /\b(students?|adults?|children|participants?|in|among|between|compared to|measured by|using)\b/i.test(question);

  return hasVagueStart && !hasSpecificElements;
}

function generateProactiveHelp(
  documents: DocumentMetadata[],
  currentQuestion: string,
  stuckIndicators: string[]
): string {
  // Customize help based on what they have
  if (documents.length > 0) {
    const hasData = documents.some(d => d.mime_type.includes('spreadsheet'));
    const hasPapers = documents.some(d => d.mime_type.includes('pdf'));

    if (hasData) {
      const dataDoc = documents.find(d => d.mime_type.includes('spreadsheet'));
      return `I notice you've uploaded some great data (${dataDoc?.original_name}). Would it help to frame a specific question around the variables in that dataset? I can help you identify what relationships you could explore.`;
    }

    if (hasPapers) {
      return `I see you've uploaded several research papers. Would you like me to help you identify potential research gaps or suggest how to build on this existing work with a more focused question?`;
    }
  }

  return `I notice you've been working on this question for a while. Would it help to break it down into more specific components? I can guide you through refining your research focus step by step.`;
}