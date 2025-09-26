/**
 * Literature Review Types
 * Defines interfaces for academic literature management and analysis
 */

export interface LiteratureReview {
  id: string
  projectId: string

  // Review structure
  searchStrategy: SearchStrategy
  sources: LiteratureSource[]
  themes: LiteratureTheme[]
  gaps: ResearchGap[]
  synthesis: LiteratureSynthesis

  // Progress tracking
  totalSources: number
  reviewedSources: number
  qualitySources: number
  createdAt: Date
  updatedAt: Date
}

export interface SearchStrategy {
  keywords: string[]
  databases: string[]
  inclusionCriteria: string[]
  exclusionCriteria: string[]
  searchQueries: SearchQuery[]
  timeframe: {
    startYear: number
    endYear: number
  }
}

export interface SearchQuery {
  query: string
  database: string
  resultsCount: number
  relevantCount: number
  date: Date
}

// Alias for component compatibility
export type LiteratureItem = LiteratureSource;

export interface LiteratureCollection {
  id: string;
  name: string;
  description?: string;
  sources: LiteratureSource[];
  paperIds: string[]; // IDs of papers in this collection
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LiteratureNote {
  id: string;
  sourceId: string;
  content: string;
  type: 'summary' | 'quote' | 'analysis' | 'methodology' | 'finding';
  pageNumber?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  types?: LiteratureSource['type'][];
  databases?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  yearRange?: {
    start: number;
    end: number;
  };
  keywords?: string[];
  authors?: string[];
  tags?: string[];
  sources?: string[];
  paperTypes?: string[];
  minCitations?: number;
  languages?: string[];
}

export interface DatabaseSource {
  id: string;
  name: string;
  description?: string;
  url: string;
  apiKey?: string;
  searchFields: string[];
  resultFormat: 'json' | 'xml' | 'csv';
  isActive: boolean;
  enabled: boolean;
}

export interface LiteratureSource {
  id: string
  type: 'journal' | 'conference' | 'book' | 'thesis' | 'report' | 'preprint'

  // Bibliographic information
  title: string
  authors: string[]
  journal?: string
  conference?: string
  venue?: string
  year: number
  doi?: string
  url?: string

  // Review information
  abstract: string
  keyFindings: string[]
  methodology: string
  relevance: number
  quality: number
  credibilityScore: number

  // Analysis
  themes: string[]
  notes: string
  quotes: LiteratureQuote[]
  reviewed: boolean
  reviewDate?: Date

  // Additional properties needed by components
  tags: string[]
  readStatus: 'unread' | 'reading' | 'read' | 'reviewed'
  citations: number
  relevanceScore: number
  addedAt: Date
  openAccess: boolean
  rating?: number
}

export interface LiteratureQuote {
  id: string
  text: string
  page?: number
  context: string
  theme: string
  importance: number
}

export interface LiteratureTheme {
  id: string
  name: string
  description: string
  sources: string[]
  keyFindings: string[]
  conflicts: string[]
  confidence: number
}

export interface ResearchGap {
  id: string
  title: string
  description: string
  type: 'methodological' | 'empirical' | 'theoretical' | 'practical'
  significance: number
  opportunity: string
  relatedSources: string[]
}

export interface LiteratureSynthesis {
  overview: string
  majorThemes: string[]
  consensus: string[]
  conflicts: string[]
  gaps: string[]
  implications: string[]
  futureDirections: string[]
}

export interface CredibilityAssessment {
  sourceId: string
  criteria: {
    authorCredibility: number
    publicationVenue: number
    methodology: number
    citations: number
    recency: number
  }
  overallScore: number
  concerns: string[]
  strengths: string[]
}

// Database table interfaces
export interface LiteratureSourceTable {
  id: string
  project_id: string
  type: string
  title: string
  authors: string[]
  metadata: Record<string, any>
  abstract: string
  relevance_score: number
  quality_score: number
  reviewed: boolean
  created_at: string
  updated_at: string
}