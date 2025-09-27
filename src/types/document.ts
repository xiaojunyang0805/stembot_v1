export interface DocumentAnalysis {
  id: string
  filename: string
  fileType: string
  size: number
  uploadedAt: string
  processedAt: string
  status: 'processing' | 'completed' | 'failed'

  // Core document intelligence
  content: {
    text: string
    structure: DocumentStructure
    metadata: DocumentMetadata
  }

  // Research paper intelligence
  research?: ResearchPaperAnalysis

  // Experimental data intelligence
  experimental?: ExperimentalDataAnalysis

  // Cross-document analysis
  relationships?: DocumentRelationship[]

  // Vector embeddings for similarity
  embeddings: {
    summary: number[]
    methodology: number[]
    conclusions: number[]
    fullText: number[]
  }
}

export interface DocumentStructure {
  title?: string
  abstract?: string
  introduction?: string
  methodology?: string
  results?: string
  discussion?: string
  conclusion?: string
  references?: string[]
  sections: DocumentSection[]
  figures: DocumentFigure[]
  tables: DocumentTable[]
}

export interface DocumentSection {
  title: string
  content: string
  level: number
  startPage?: number
  endPage?: number
}

export interface DocumentFigure {
  caption: string
  pageNumber: number
  description?: string
  extractedData?: any[]
}

export interface DocumentTable {
  caption: string
  headers: string[]
  rows: string[][]
  pageNumber: number
  analysis?: string
}

export interface DocumentMetadata {
  authors?: string[]
  institution?: string
  publicationDate?: string
  journal?: string
  doi?: string
  keywords?: string[]
  citations?: number
  language: string
  pages: number
}

export interface ResearchPaperAnalysis {
  researchQuestions: string[]
  methodology: {
    type: string
    description: string
    strengths: string[]
    limitations: string[]
  }
  keyFindings: Finding[]
  novelty: {
    score: number
    justification: string
    gaps: string[]
  }
  methodology_critique: {
    score: number
    issues: string[]
    suggestions: string[]
  }
  literatureGaps: string[]
  futureWork: string[]
}

export interface Finding {
  statement: string
  significance: 'high' | 'medium' | 'low'
  evidence: string
  page?: number
}

export interface ExperimentalDataAnalysis {
  dataQuality: {
    score: number
    issues: string[]
    recommendations: string[]
  }
  statisticalSignificance: {
    tests: StatisticalTest[]
    overall: boolean
    confidence: number
  }
  experimentalDesign: {
    type: string
    controls: string[]
    variables: Variable[]
    sampleSize: number
    critique: string[]
  }
  dataPatterns: Pattern[]
  hypotheses: GeneratedHypothesis[]
}

export interface StatisticalTest {
  type: string
  pValue: number
  significant: boolean
  interpretation: string
}

export interface Variable {
  name: string
  type: 'independent' | 'dependent' | 'control'
  description: string
  range?: string
}

export interface Pattern {
  description: string
  confidence: number
  implications: string[]
}

export interface GeneratedHypothesis {
  statement: string
  rationale: string
  testability: number
  significance: 'high' | 'medium' | 'low'
}

export interface DocumentRelationship {
  targetDocumentId: string
  type: 'contradiction' | 'support' | 'methodological_gap' | 'builds_upon' | 'similar_findings'
  similarity: number
  description: string
  specificSections: {
    source: string
    target: string
    relationship: string
  }[]
}

export interface CrossDocumentAnalysis {
  contradictions: DocumentContradiction[]
  methodologicalGaps: MethodologicalGap[]
  relationshipMap: DocumentRelationshipMap
  consensusFindings: ConsensusFinding[]
}

export interface DocumentContradiction {
  documents: string[]
  topic: string
  conflictingClaims: string[]
  possibleReasons: string[]
  resolutionSuggestions: string[]
}

export interface MethodologicalGap {
  description: string
  affectedDocuments: string[]
  impact: 'high' | 'medium' | 'low'
  suggestions: string[]
}

export interface DocumentRelationshipMap {
  nodes: DocumentNode[]
  edges: DocumentEdge[]
}

export interface DocumentNode {
  id: string
  title: string
  type: 'research_paper' | 'experimental_data' | 'review' | 'protocol'
  importance: number
}

export interface DocumentEdge {
  source: string
  target: string
  relationship: string
  weight: number
}

export interface ConsensusFinding {
  statement: string
  supportingDocuments: string[]
  confidence: number
  evidence: string[]
}

export interface MemoryEntry {
  id: string
  documentId: string
  type: 'insight' | 'finding' | 'methodology' | 'gap' | 'relationship'
  content: string
  embeddings: number[]
  metadata: {
    timestamp: string
    relevanceScore: number
    tags: string[]
    section?: string
  }
}

export interface SemanticSearchResult {
  id: string
  content: string
  similarity: number
  documentId: string
  type: string
  metadata: any
}