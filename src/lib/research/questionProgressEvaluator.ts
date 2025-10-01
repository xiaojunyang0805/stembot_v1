/**
 * Question Progress Evaluator
 *
 * Evaluates research question maturity and overall progress
 * Based on real project data and user activities
 */

export interface QuestionAnalysis {
  stage: 'initial' | 'emerging' | 'focused' | 'research-ready';
  progress: number; // 0-100
  factors: {
    hasSpecificPopulation: boolean;
    hasResearchMethod: boolean;
    hasMeasurableOutcome: boolean;
    isSpecific: boolean;
    hasRefinements: boolean;
  };
  recommendations: string[];
}

export interface ProjectProgress {
  questionProgress: number;
  researchDepth: number;
  overallProgress: number;
  stage: 'initial' | 'emerging' | 'focused' | 'research-ready';
}

/**
 * Analyzes question quality and determines research stage
 */
export function analyzeQuestionProgress(
  question: string,
  conversationCount: number = 0,
  documentCount: number = 0,
  questionHistory: any[] = []
): QuestionAnalysis {
  const factors = {
    hasSpecificPopulation: false,
    hasResearchMethod: false,
    hasMeasurableOutcome: false,
    isSpecific: false,
    hasRefinements: false
  };

  const recommendations: string[] = [];
  const lowerQuestion = question.toLowerCase();

  // Check for specific population
  const populationKeywords = ['student', 'patients', 'children', 'adults', 'elderly', 'participants', 'users', 'consumers', 'workers', 'athletes'];
  factors.hasSpecificPopulation = populationKeywords.some(keyword => lowerQuestion.includes(keyword));

  // Check for research method indicators
  const methodKeywords = ['how', 'what', 'why', 'does', 'will', 'can', 'effect', 'impact', 'influence', 'relationship', 'compare', 'correlation'];
  factors.hasResearchMethod = methodKeywords.some(keyword => lowerQuestion.includes(keyword));

  // Check for measurable outcome indicators
  const measurementKeywords = ['performance', 'rate', 'level', 'score', 'improvement', 'reduction', 'increase', 'percentage', 'frequency', 'accuracy'];
  factors.hasMeasurableOutcome = measurementKeywords.some(keyword => lowerQuestion.includes(keyword));

  // Check specificity (length and detail)
  factors.isSpecific = question.split(' ').length >= 8 && question.length >= 50;

  // Check if there have been refinements
  factors.hasRefinements = questionHistory.length > 1 || conversationCount > 3;

  // Calculate progress based on factors
  let progress = 0;

  // Base progress for having a question
  progress += 10;

  // Population specificity (20 points)
  if (factors.hasSpecificPopulation) {
    progress += 20;
  } else {
    recommendations.push("Add specific target population (e.g., 'college students', 'elderly patients')");
  }

  // Research method clarity (25 points)
  if (factors.hasResearchMethod) {
    progress += 25;
  } else {
    recommendations.push("Clarify research approach (how/what/why will you study this?)");
  }

  // Measurable outcomes (20 points)
  if (factors.hasMeasurableOutcome) {
    progress += 20;
  } else {
    recommendations.push("Define measurable outcomes (performance, rates, scores, etc.)");
  }

  // Question specificity (15 points)
  if (factors.isSpecific) {
    progress += 15;
  } else {
    recommendations.push("Make question more specific and detailed");
  }

  // Refinement through research (10 points)
  if (factors.hasRefinements) {
    progress += 10;
  } else {
    recommendations.push("Engage with AI mentor to refine your question");
  }

  // Determine stage based on progress
  let stage: 'initial' | 'emerging' | 'focused' | 'research-ready';
  if (progress <= 25) {
    stage = 'initial';
  } else if (progress <= 50) {
    stage = 'emerging';
  } else if (progress <= 75) {
    stage = 'focused';
  } else {
    stage = 'research-ready';
  }

  return {
    stage,
    progress,
    factors,
    recommendations
  };
}

/**
 * Evaluates overall project progress including research activities
 */
export function evaluateProjectProgress(
  project: any,
  conversationCount: number = 0,
  documentCount: number = 0,
  questionHistory: any[] = []
): ProjectProgress {
  // Analyze question progress (60% of total)
  const questionAnalysis = analyzeQuestionProgress(
    project.title || project.research_question || "Untitled project",
    conversationCount,
    documentCount,
    questionHistory
  );

  // Calculate research depth (40% of total)
  let researchDepth = 0;

  // Documents uploaded (20 points)
  if (documentCount > 0) {
    researchDepth += Math.min(20, documentCount * 5);
  }

  // AI conversations (20 points)
  if (conversationCount > 0) {
    researchDepth += Math.min(20, conversationCount * 2);
  }

  // Overall progress calculation
  const questionWeight = 0.6;
  const researchWeight = 0.4;

  const overallProgress = Math.round(
    (questionAnalysis.progress * questionWeight) +
    (researchDepth * researchWeight)
  );

  return {
    questionProgress: questionAnalysis.progress,
    researchDepth,
    overallProgress,
    stage: questionAnalysis.stage
  };
}

/**
 * Simple heuristic for question stage (backward compatibility)
 */
export function getQuestionStage(question: string): 'initial' | 'emerging' | 'focused' | 'research-ready' {
  const analysis = analyzeQuestionProgress(question);
  return analysis.stage;
}