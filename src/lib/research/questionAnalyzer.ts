// Question Quality Analyzer
// Automatically detects research question problems and refinement needs

export interface QuestionAnalysis {
  needsRefinement: boolean;
  currentStage: 'vague' | 'emerging' | 'focused' | 'research-ready';
  mainProblem: string;
  confidence: number; // 0-100%
  detectedIssues: string[];
  suggestions: string[];
}

export interface ProblemPattern {
  pattern: RegExp;
  issue: string;
  weight: number; // Impact on confidence score
}

// Common vague question patterns
const VAGUE_PATTERNS: ProblemPattern[] = [
  { pattern: /^(I want to study|research|investigate|look at|examine)\s+(?!.*\b(how|what|why|when|where|which)\b)/i, issue: "too broad - no specific research question", weight: 30 },
  { pattern: /\b(AI|machine learning|technology|social media|stress|learning)\b(?!.*\b(affects?|impacts?|influences?|relates? to|causes?)\b)/i, issue: "topic mentioned but no relationship studied", weight: 25 },
  { pattern: /\b(effects? of|impact of|influence of)\s+\w+$/i, issue: "missing outcome or dependent variable", weight: 20 },
  { pattern: /\b(how does|what is the effect of)\s+\w+(?!\s+on\s+)/i, issue: "missing what is being affected", weight: 25 },
];

// Missing population patterns
const POPULATION_PATTERNS: ProblemPattern[] = [
  { pattern: /\b(affects?|impacts?|influences?|improves?|reduces?|increases?)\b(?!.*\b(in|among|for|with)\s+(students|children|adults|patients|people|users|participants)\b)/i, issue: "no population specified", weight: 20 },
  { pattern: /\b(memory|sleep|stress|learning|performance)\b(?!.*\b(in|among)\s+[\w\s]*?(students|adults|children)\b)/i, issue: "needs target population", weight: 15 },
];

// Unclear variables patterns
const VARIABLE_PATTERNS: ProblemPattern[] = [
  { pattern: /\b(test|study|measure|analyze)\s+(reactions?|responses?|effects?)\b(?!.*\b(of|using|with)\s+\w+)/i, issue: "unclear what is being tested", weight: 20 },
  { pattern: /\b(chemical reactions?|experiments?|treatments?)\b(?!\s+(of|using|with|involving)\s+\w+)/i, issue: "unspecified variables or methods", weight: 15 },
];

// Unmeasurable outcomes patterns
const MEASUREMENT_PATTERNS: ProblemPattern[] = [
  { pattern: /\b(improve|better|enhance|increase|decrease)\s+(learning|performance|understanding)\b(?!.*\b(measured by|using|through|via)\b)/i, issue: "outcome not measurable", weight: 25 },
  { pattern: /\b(effectiveness|success|quality|satisfaction)\b(?!.*\b(measured|assessed|evaluated)\b)/i, issue: "needs measurement method", weight: 20 },
];

// Positive indicators (good question elements)
const GOOD_PATTERNS = [
  /\b(how does|what is the effect of|does)\s+[\w\s]+\s+(affect|impact|influence|relate to)\s+[\w\s]+\s+(in|among)\s+[\w\s]+(students|adults|children|patients)\b/i,
  /\bmeasured (by|using|through|via)\b/i,
  /\b(compared to|versus|vs\.?|control group|placebo)\b/i,
  /\b(randomized|controlled|experimental|longitudinal|cross-sectional)\s+(trial|study|design)\b/i,
];

/**
 * Analyzes a research question for quality and refinement needs
 */
export function analyzeQuestionQuality(text: string): QuestionAnalysis {
  const detectedIssues: string[] = [];
  const suggestions: string[] = [];
  let problemScore = 0;
  let maxPossibleScore = 0;

  // Check for vague patterns
  VAGUE_PATTERNS.forEach(pattern => {
    maxPossibleScore += pattern.weight;
    if (pattern.pattern.test(text)) {
      detectedIssues.push(pattern.issue);
      problemScore += pattern.weight;
    }
  });

  // Check for missing population
  POPULATION_PATTERNS.forEach(pattern => {
    maxPossibleScore += pattern.weight;
    if (pattern.pattern.test(text)) {
      detectedIssues.push(pattern.issue);
      problemScore += pattern.weight;
      suggestions.push("Specify your target population (e.g., 'in college students', 'among elderly patients')");
    }
  });

  // Check for unclear variables
  VARIABLE_PATTERNS.forEach(pattern => {
    maxPossibleScore += pattern.weight;
    if (pattern.pattern.test(text)) {
      detectedIssues.push(pattern.issue);
      problemScore += pattern.weight;
      suggestions.push("Specify exactly what variables you're studying");
    }
  });

  // Check for unmeasurable outcomes
  MEASUREMENT_PATTERNS.forEach(pattern => {
    maxPossibleScore += pattern.weight;
    if (pattern.pattern.test(text)) {
      detectedIssues.push(pattern.issue);
      problemScore += pattern.weight;
      suggestions.push("Explain how you'll measure this outcome");
    }
  });

  // Check for positive indicators
  let goodIndicators = 0;
  GOOD_PATTERNS.forEach(pattern => {
    if (pattern.test(text)) {
      goodIndicators++;
    }
  });

  // Calculate confidence (higher score = more problems = lower confidence)
  const problemRatio = maxPossibleScore > 0 ? problemScore / maxPossibleScore : 0;
  const baseConfidence = Math.max(0, 100 - (problemRatio * 100));
  const bonusConfidence = Math.min(20, goodIndicators * 5); // Bonus for good indicators
  const confidence = Math.min(100, baseConfidence + bonusConfidence);

  // Determine stage and main problem
  const { currentStage, mainProblem } = determineStageAndProblem(detectedIssues, confidence, text);

  // Determine if refinement is needed
  const needsRefinement = confidence < 70 || detectedIssues.length > 0;

  return {
    needsRefinement,
    currentStage,
    mainProblem,
    confidence: Math.round(confidence),
    detectedIssues,
    suggestions: suggestions.slice(0, 3) // Limit to top 3 suggestions
  };
}

/**
 * Determines the current stage and main problem based on detected issues
 */
function determineStageAndProblem(issues: string[], confidence: number, text: string): {
  currentStage: 'vague' | 'emerging' | 'focused' | 'research-ready';
  mainProblem: string;
} {
  if (confidence >= 85) {
    return {
      currentStage: 'research-ready',
      mainProblem: 'question looks research-ready'
    };
  }

  if (confidence >= 70) {
    return {
      currentStage: 'focused',
      mainProblem: issues[0] || 'minor refinements needed'
    };
  }

  if (confidence >= 40) {
    return {
      currentStage: 'emerging',
      mainProblem: issues[0] || 'needs more specificity'
    };
  }

  // Very low confidence or major issues
  const mainProblem = issues[0] || 'question too vague or broad';

  return {
    currentStage: 'vague',
    mainProblem
  };
}

/**
 * Quick check if a message contains a research question
 */
export function containsResearchQuestion(text: string): boolean {
  const questionIndicators = [
    /\b(research question|hypothesis|study)\b/i,
    /\b(how does|what is the effect|does|can|will)\s+.*\b(affect|impact|influence|cause|relate)\b/i,
    /\b(investigate|examine|analyze|explore)\s+.*\b(relationship|correlation|effect)\b/i,
    /\?$/,
    /\bI want to (study|research|investigate|look at)\b/i
  ];

  return questionIndicators.some(pattern => pattern.test(text));
}

/**
 * Extract potential research questions from a longer text
 */
export function extractResearchQuestions(text: string): string[] {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);

  return sentences.filter(sentence => containsResearchQuestion(sentence));
}

/**
 * Simple helper to check if Socratic coaching should be triggered
 */
export function shouldTriggerSocraticCoaching(analysis: QuestionAnalysis): boolean {
  return analysis.needsRefinement && analysis.confidence >= 30; // Only trigger if we're confident there's a problem
}