/**
 * Academic Writing Types
 * Defines interfaces for academic writing support and document management
 */

export interface WritingProgress {
  id: string
  projectId: string

  // Document structure
  outline: DocumentOutline
  sections: WritingSection[]
  citations: Citation[]
  references: Reference[]

  // Progress tracking
  totalWords: number
  targetWords: number
  sectionsCompleted: number
  totalSections: number
  lastModified: Date

  // Writing process
  drafts: WritingDraft[]
  reviews: PeerReview[]
  revisions: RevisionHistory[]

  createdAt: Date
  updatedAt: Date
}

export interface DocumentOutline {
  id: string
  title: string
  abstract: string
  structure: OutlineSection[]
  argumentFlow: string[]
  keyMessages: string[]
}

export interface OutlineSection {
  id: string
  title: string
  level: number
  purpose: string
  keyPoints: string[]
  estimatedWords: number
  subsections: OutlineSection[]
  dependencies: string[]
}

export interface WritingSection {
  id: string
  outlineId: string
  title: string
  content: string
  wordCount: number
  estimatedWords: number
  status: SectionStatus
  feedback: SectionFeedback[]
  lastModified: Date
}

export interface SectionFeedback {
  id: string
  type: 'structure' | 'clarity' | 'argument' | 'evidence' | 'citation' | 'grammar'
  comment: string
  severity: 'info' | 'suggestion' | 'warning' | 'error'
  location: {
    start: number
    end: number
  }
  resolved: boolean
}

export interface WritingDraft {
  id: string
  version: number
  title: string
  content: string
  wordCount: number
  created: Date
  notes: string
  majorChanges: string[]
}

export interface Citation {
  id: string
  referenceId: string
  location: CitationLocation
  type: 'direct' | 'indirect' | 'summary' | 'paraphrase'
  context: string
  page?: number
}

export interface CitationLocation {
  sectionId: string
  position: number
  sentence: string
}

export interface Reference {
  id: string
  type: 'journal' | 'book' | 'conference' | 'thesis' | 'report' | 'website' | 'other'

  // Common fields
  title: string
  authors: Author[]
  year: number

  // Journal specific
  journal?: string
  volume?: number
  issue?: number
  pages?: string
  doi?: string

  // Book specific
  publisher?: string
  edition?: string
  isbn?: string

  // Conference specific
  conference?: string
  location?: string

  // Web specific
  url?: string
  accessDate?: Date

  // Metadata
  imported: boolean
  verified: boolean
  notes: string
}

export interface Author {
  firstName: string
  lastName: string
  middleName?: string
  suffix?: string
  affiliation?: string
}

export interface PeerReview {
  id: string
  reviewer: string
  date: Date
  overall: OverallAssessment
  sections: SectionReview[]
  suggestions: ReviewSuggestion[]
  decision: ReviewDecision
}

export interface OverallAssessment {
  clarity: number
  organization: number
  argument: number
  evidence: number
  writing: number
  contribution: number
  overall: number
  comments: string
}

export interface SectionReview {
  sectionId: string
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  score: number
}

export interface ReviewSuggestion {
  type: 'major' | 'minor' | 'editorial'
  description: string
  location?: string
  priority: number
  addressed: boolean
}

export interface RevisionHistory {
  id: string
  version: number
  date: Date
  changes: RevisionChange[]
  summary: string
  reviewer?: string
}

export interface RevisionChange {
  type: 'addition' | 'deletion' | 'modification' | 'restructure'
  section: string
  description: string
  rationale: string
  wordChange: number
}

export interface AcademicStyle {
  citationStyle: 'APA' | 'MLA' | 'Chicago' | 'IEEE' | 'Harvard' | 'Vancouver'
  documentType: 'thesis' | 'dissertation' | 'journal' | 'conference' | 'report'
  requirements: StyleRequirements
  guidelines: StyleGuideline[]
}

export interface StyleRequirements {
  wordLimit?: number
  pageLimit?: number
  sectionRequirements: string[]
  formatRequirements: string[]
  citationRequirements: string[]
}

export interface StyleGuideline {
  aspect: string
  requirement: string
  examples: string[]
  violations: string[]
}

export interface WritingAssistance {
  grammarCheck: GrammarSuggestion[]
  styleCheck: StyleSuggestion[]
  clarityCheck: ClaritySuggestion[]
  argumentCheck: ArgumentSuggestion[]
  citationCheck: CitationSuggestion[]
}

export interface GrammarSuggestion {
  location: {
    start: number
    end: number
  }
  issue: string
  suggestion: string
  confidence: number
  rule: string
}

export interface StyleSuggestion {
  location: {
    start: number
    end: number
  }
  issue: string
  suggestion: string
  type: 'wordiness' | 'passive-voice' | 'clarity' | 'formality'
  severity: number
}

export interface ClaritySuggestion {
  location: {
    start: number
    end: number
  }
  issue: string
  suggestion: string
  type: 'unclear-reference' | 'complex-sentence' | 'jargon' | 'ambiguity'
}

export interface ArgumentSuggestion {
  location: {
    start: number
    end: number
  }
  issue: string
  suggestion: string
  type: 'weak-evidence' | 'logical-gap' | 'unsupported-claim' | 'contradiction'
  severity: number
}

export interface CitationSuggestion {
  location: {
    start: number
    end: number
  }
  issue: string
  suggestion: string
  type: 'missing-citation' | 'incorrect-format' | 'invalid-source' | 'over-citation'
}

export type SectionStatus =
  | 'not-started'
  | 'outline'
  | 'draft'
  | 'review'
  | 'revision'
  | 'completed'

export type ReviewDecision =
  | 'accept'
  | 'minor-revisions'
  | 'major-revisions'
  | 'reject'

// Database table interfaces
export interface WritingTable {
  id: string
  project_id: string
  outline: Record<string, any>
  sections: Record<string, any>[]
  total_words: number
  target_words: number
  created_at: string
  updated_at: string
}

export interface DocumentTable {
  id: string
  writing_id: string
  type: 'draft' | 'final' | 'submission'
  content: string
  word_count: number
  version: number
  created_at: string
}

// Additional interfaces for component compatibility
export interface WritingProject {
  id: string;
  title: string;
  description: string;
  content?: string;
  type: 'research-paper' | 'thesis' | 'dissertation' | 'article' | 'proposal';
  status: 'planning' | 'writing' | 'reviewing' | 'completed';
  targetWords: number;
  currentWords: number;
  deadline?: Date;
  outline: DocumentOutline;
  sections: WritingSection[];
  progress: WritingProgress;
  analytics: WritingAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

export interface WritingSuggestion {
  id: string;
  type: 'grammar' | 'style' | 'structure' | 'clarity' | 'flow' | 'citation';
  severity: 'info' | 'warning' | 'error';
  message: string;
  suggestion: string;
  location: {
    start: number;
    end: number;
    line?: number;
    column?: number;
  };
  autofix?: string;
  confidence: number;
  category: string;
}

export interface WritingAnalytics {
  id: string;
  projectId: string;
  totalWords: number;
  totalSessions: number;
  averageWordsPerSession: number;
  writingVelocity: number; // words per hour
  productiveHours: string[];
  dailyProgress: DailyProgress[];
  readabilityScore: number;
  grammarScore: number;
  styleConsistency: number;
  citationAccuracy: number;
  overallQuality: number;
  trends: WritingTrend[];
  generatedAt: Date;

  // Additional properties for component compatibility
  wordCount?: number;
  citationCount?: number;
  completionPercentage?: number;
  timeSpent?: number;
  sessionsCount?: number;
  targetWordCount?: number;
}

export interface DailyProgress {
  date: Date;
  wordsWritten: number;
  timeSpent: number; // minutes
  sessionsCount: number;
  sectionsCompleted: number;
  quality: number;
}

export interface WritingTrend {
  metric: string;
  values: number[];
  dates: Date[];
  direction: 'improving' | 'declining' | 'stable';
  significance: number;
}