/**
 * Async Document Suggestion System
 * Processes document suggestions in background without blocking upload
 * Target: Document suggestions ready <3 seconds after upload
 */

import { QuestionMemoryHelpers } from '../memory/questionMemory';

export interface DocumentSuggestion {
  type: 'focus_refinement' | 'population_suggestion' | 'method_clarification' | 'measurement_idea';
  suggestion: string;
  confidence: number;
  documentName: string;
  reasoning: string;
}

/**
 * Generate quick document-based suggestions
 * Runs async after upload to avoid blocking
 */
async function generateDocumentSuggestions(
  document: { filename: string; content?: string; type?: string },
  currentQuestion: string,
  projectId: string
): Promise<DocumentSuggestion[]> {
  const suggestions: DocumentSuggestion[] = [];
  const filename = document.filename.toLowerCase();
  const questionLower = currentQuestion.toLowerCase();

  // Quick heuristic-based suggestions (fast, no AI needed)

  // 1. Data file suggestions
  if (filename.includes('data') || filename.includes('results') || filename.includes('.csv') || filename.includes('.xlsx')) {
    if (!questionLower.includes('rate') && !questionLower.includes('measurement')) {
      suggestions.push({
        type: 'measurement_idea',
        suggestion: `Your data file suggests focusing on measurable outcomes. Consider what specific rates, levels, or changes you want to track.`,
        confidence: 0.8,
        documentName: document.filename,
        reasoning: 'Data files typically contain measurable variables'
      });
    }

    if (!questionLower.includes('student') && !questionLower.includes('participant') && !questionLower.includes('subject')) {
      suggestions.push({
        type: 'population_suggestion',
        suggestion: `Who generated this data? Consider specifying your target population (students, patients, participants, etc.).`,
        confidence: 0.7,
        documentName: document.filename,
        reasoning: 'Data files imply a specific population was studied'
      });
    }
  }

  // 2. Research paper suggestions
  if (filename.includes('.pdf') || filename.includes('paper') || filename.includes('study') || filename.includes('research')) {
    if (questionLower.length < 50) {
      suggestions.push({
        type: 'focus_refinement',
        suggestion: `This research paper might help narrow your focus. What specific aspect from the paper interests you most?`,
        confidence: 0.75,
        documentName: document.filename,
        reasoning: 'Research papers often suggest specific research directions'
      });
    }

    suggestions.push({
      type: 'method_clarification',
      suggestion: `Research papers often describe methodology. Does this paper suggest a specific research approach for your question?`,
      confidence: 0.6,
      documentName: document.filename,
      reasoning: 'Academic papers contain methodological insights'
    });
  }

  // 3. Specific field suggestions based on filename patterns
  if (filename.includes('bacterial') || filename.includes('growth') || filename.includes('culture')) {
    if (!questionLower.includes('bacterial') && !questionLower.includes('microbe')) {
      suggestions.push({
        type: 'focus_refinement',
        suggestion: `Your file suggests bacterial research. Consider focusing your question on specific bacterial processes or species.`,
        confidence: 0.85,
        documentName: document.filename,
        reasoning: 'Filename indicates bacterial/microbiology focus'
      });
    }
  }

  if (filename.includes('calibration') || filename.includes('measurement') || filename.includes('accuracy')) {
    if (!questionLower.includes('accuracy') && !questionLower.includes('precision')) {
      suggestions.push({
        type: 'focus_refinement',
        suggestion: `Calibration data suggests measurement precision studies. Are you interested in accuracy, precision, or systematic errors?`,
        confidence: 0.8,
        documentName: document.filename,
        reasoning: 'Calibration files indicate measurement/instrumentation focus'
      });
    }
  }

  if (filename.includes('reaction') || filename.includes('kinetic') || filename.includes('enzyme')) {
    if (!questionLower.includes('reaction') && !questionLower.includes('kinetic')) {
      suggestions.push({
        type: 'focus_refinement',
        suggestion: `This file suggests chemical kinetics research. Consider focusing on reaction rates, catalysis, or enzyme activity.`,
        confidence: 0.85,
        documentName: document.filename,
        reasoning: 'Filename indicates chemical kinetics focus'
      });
    }
  }

  return suggestions;
}

/**
 * Process document upload and generate suggestions asynchronously
 * Returns immediately, processes suggestions in background
 */
export async function processDocumentSuggestionsAsync(
  document: { filename: string; content?: string; type?: string },
  currentQuestion: string,
  projectId: string,
  onSuggestionsReady?: (suggestions: DocumentSuggestion[]) => void
): Promise<void> {
  // Start async processing (don't await)
  setTimeout(async () => {
    try {
      const startTime = performance.now();

      // Generate suggestions
      const suggestions = await generateDocumentSuggestions(document, currentQuestion, projectId);

      const endTime = performance.now();
      console.log(`📄 Document suggestions generated: ${(endTime - startTime).toFixed(1)}ms`);

      // Store the best suggestion in memory for future reference
      if (suggestions.length > 0) {
        const bestSuggestion = suggestions.sort((a, b) => b.confidence - a.confidence)[0];

        await QuestionMemoryHelpers.storeDocumentInsight(
          projectId,
          `Document "${document.filename}" suggests: ${bestSuggestion.suggestion}`,
          document.filename
        );

        console.log(`💾 Document insight stored: ${bestSuggestion.type}`);
      }

      // Call callback if provided (for real-time UI updates)
      if (onSuggestionsReady) {
        onSuggestionsReady(suggestions);
      }

    } catch (error) {
      console.error('Error processing document suggestions:', error);
    }
  }, 100); // Small delay to ensure upload completes first

  console.log(`🚀 Document suggestion processing started for: ${document.filename}`);
}

/**
 * Get cached suggestions for a document (if already processed)
 */
export function getCachedDocumentSuggestions(filename: string): DocumentSuggestion[] | null {
  // This would connect to the memory system to retrieve cached suggestions
  // For now, return null to indicate no cached suggestions
  return null;
}

/**
 * Priority document types that get faster processing
 */
export function isPriorityDocument(filename: string): boolean {
  const priorityPatterns = [
    'data', 'results', 'analysis', 'measurement',
    'bacterial', 'growth', 'reaction', 'kinetic',
    'calibration', 'accuracy', 'precision'
  ];

  const filenameLower = filename.toLowerCase();
  return priorityPatterns.some(pattern => filenameLower.includes(pattern));
}

/**
 * Get processing time estimate for document suggestions
 */
export function getProcessingTimeEstimate(document: { filename: string; type?: string }): number {
  const isPriority = isPriorityDocument(document.filename);
  const baseTime = isPriority ? 1000 : 2000; // 1-2 seconds base

  // Add time based on document complexity
  const filename = document.filename.toLowerCase();
  if (filename.includes('.pdf')) {
    return baseTime + 1000; // PDFs take longer
  }

  return baseTime;
}