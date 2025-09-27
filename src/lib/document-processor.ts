import { Pinecone } from '@pinecone-database/pinecone'
import { nanoid } from 'nanoid'
import sharp from 'sharp'
import { createWorker } from 'tesseract.js'

// Lazy import pdf-parse to avoid build issues
// import pdfParse from 'pdf-parse'
import {
  DocumentAnalysis,
  DocumentStructure,
  ResearchPaperAnalysis,
  ExperimentalDataAnalysis,
  DocumentRelationship,
  CrossDocumentAnalysis,
  MemoryEntry,
  SemanticSearchResult
} from '@/types/document'

import { ollama } from './ollama'

// PDF processing is handled by pdf-parse library for server-side use

export class DocumentProcessor {
  private pinecone: Pinecone | null = null
  private index: any = null

  constructor() {
    this.initializePinecone()
  }

  private async initializePinecone() {
    try {
      this.pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY || ''
      })
      this.index = this.pinecone.index(process.env.PINECONE_INDEX_NAME || 'stembot-documents')
    } catch (error) {
      console.warn('Pinecone not available:', error)
    }
  }

  async processDocument(file: File): Promise<DocumentAnalysis> {
    const id = nanoid()
    const analysis: DocumentAnalysis = {
      id,
      filename: file.name,
      fileType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      processedAt: '',
      status: 'processing',
      content: {
        text: '',
        structure: {
          sections: [],
          figures: [],
          tables: []
        },
        metadata: {
          language: 'en',
          pages: 0
        }
      },
      embeddings: {
        summary: [],
        methodology: [],
        conclusions: [],
        fullText: []
      }
    }

    try {
      // Extract text based on file type
      const text = await this.extractText(file)
      analysis.content.text = text

      // Analyze document structure
      analysis.content.structure = await this.analyzeDocumentStructure(text)

      // Determine document type and perform specialized analysis
      const documentType = await this.classifyDocument(text)

      if (documentType === 'research_paper') {
        analysis.research = await this.analyzeResearchPaper(text, analysis.content.structure)
      } else if (documentType === 'experimental_data') {
        analysis.experimental = await this.analyzeExperimentalData(text, analysis.content.structure)
      }

      // Generate embeddings
      analysis.embeddings = await this.generateEmbeddings(text, analysis.content.structure)

      // Store in Pinecone for cross-document analysis
      await this.storeInVectorDB(analysis)

      // Find relationships with existing documents
      analysis.relationships = await this.findDocumentRelationships(analysis)

      analysis.status = 'completed'
      analysis.processedAt = new Date().toISOString()

    } catch (error) {
      console.error('Document processing error:', error)
      analysis.status = 'failed'
    }

    return analysis
  }

  private async extractText(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer())

    if (file.type === 'application/pdf') {
      return this.extractPDFText(buffer)
    } else if (file.type.startsWith('image/')) {
      return this.extractImageText(buffer)
    } else if (file.type === 'text/plain') {
      return buffer.toString('utf-8')
    } else {
      throw new Error(`Unsupported file type: ${file.type}`)
    }
  }

  private async extractPDFText(buffer: Buffer): Promise<string> {
    try {
      // Dynamically import pdf-parse to avoid build issues
      const pdfParse = (await import('pdf-parse')).default
      const data = await pdfParse(buffer)
      return data.text
    } catch (error) {
      console.error('PDF extraction error:', error)
      throw new Error('Failed to extract text from PDF')
    }
  }

  private async extractImageText(buffer: Buffer): Promise<string> {
    try {
      // Preprocess image for better OCR
      const processedImage = await sharp(buffer)
        .resize(2000, null, { withoutEnlargement: true })
        .grayscale()
        .normalize()
        .sharpen()
        .toBuffer()

      const worker = await createWorker('eng')
      const { data: { text } } = await worker.recognize(processedImage)
      await worker.terminate()

      return text
    } catch (error) {
      console.error('OCR error:', error)
      throw new Error('Failed to extract text from image')
    }
  }

  private async analyzeDocumentStructure(text: string): Promise<DocumentStructure> {
    try {
      const prompt = `Analyze this document and extract its structure. Return a JSON object with the following format:
{
  "title": "document title",
  "abstract": "abstract text if present",
  "sections": [
    {
      "title": "section title",
      "content": "section content",
      "level": 1
    }
  ],
  "references": ["list of references if present"]
}

Document text:
${text.slice(0, 8000)}...`

      const response = await ollama.generate(prompt, 'llama3.2:3b', { format: 'json' })

      if (response.response) {
        try {
          return JSON.parse(response.response)
        } catch {
          // Fallback to basic structure analysis
          return this.basicStructureAnalysis(text)
        }
      }
    } catch (error) {
      console.error('Structure analysis error:', error)
    }

    return this.basicStructureAnalysis(text)
  }

  private basicStructureAnalysis(text: string): DocumentStructure {
    const lines = text.split('\n').filter(line => line.trim())
    const structure: DocumentStructure = {
      sections: [],
      figures: [],
      tables: []
    }

    // Basic title extraction (first non-empty line)
    if (lines.length > 0) {
      structure.title = lines[0].trim()
    }

    // Simple section detection
    const sectionPattern = /^(?:\d+\.?\s+|[A-Z][A-Z\s]+$|Introduction|Methods?|Results?|Discussion|Conclusion)/i

    lines.forEach((line, index) => {
      if (sectionPattern.test(line.trim()) && line.length < 100) {
        structure.sections.push({
          title: line.trim(),
          content: '',
          level: 1
        })
      }
    })

    return structure
  }

  private async classifyDocument(text: string): Promise<string> {
    try {
      const prompt = `Classify this document type. Return only one of these categories:
- research_paper
- experimental_data
- review
- protocol
- report
- other

Document text (first 2000 characters):
${text.slice(0, 2000)}`

      const response = await ollama.generate(prompt, 'llama3.2:3b')
      const classification = response.response?.trim().toLowerCase()

      if (['research_paper', 'experimental_data', 'review', 'protocol', 'report'].includes(classification || '')) {
        return classification || 'other'
      }
    } catch (error) {
      console.error('Classification error:', error)
    }

    return 'other'
  }

  private async analyzeResearchPaper(text: string, structure: DocumentStructure): Promise<ResearchPaperAnalysis> {
    try {
      const prompt = `Analyze this research paper and provide detailed insights. Return JSON with this structure:
{
  "researchQuestions": ["question1", "question2"],
  "methodology": {
    "type": "experimental/theoretical/survey/etc",
    "description": "detailed description",
    "strengths": ["strength1", "strength2"],
    "limitations": ["limitation1", "limitation2"]
  },
  "keyFindings": [
    {
      "statement": "finding statement",
      "significance": "high/medium/low",
      "evidence": "supporting evidence"
    }
  ],
  "novelty": {
    "score": 8,
    "justification": "explanation of novelty",
    "gaps": ["gap1", "gap2"]
  },
  "methodology_critique": {
    "score": 7,
    "issues": ["issue1", "issue2"],
    "suggestions": ["suggestion1", "suggestion2"]
  },
  "literatureGaps": ["gap1", "gap2"],
  "futureWork": ["direction1", "direction2"]
}

Research paper text:
${text.slice(0, 12000)}...`

      const response = await ollama.generate(prompt, 'llama3.2:3b', { format: 'json' })

      if (response.response) {
        try {
          return JSON.parse(response.response)
        } catch (error) {
          console.error('JSON parse error:', error)
        }
      }
    } catch (error) {
      console.error('Research analysis error:', error)
    }

    // Fallback analysis
    return {
      researchQuestions: ['Analysis could not be completed - please check Ollama connection'],
      methodology: {
        type: 'unknown',
        description: 'Unable to analyze methodology',
        strengths: [],
        limitations: []
      },
      keyFindings: [],
      novelty: {
        score: 0,
        justification: 'Analysis incomplete',
        gaps: []
      },
      methodology_critique: {
        score: 0,
        issues: [],
        suggestions: []
      },
      literatureGaps: [],
      futureWork: []
    }
  }

  private async analyzeExperimentalData(text: string, structure: DocumentStructure): Promise<ExperimentalDataAnalysis> {
    try {
      const prompt = `Analyze this experimental data document and provide insights. Return JSON with this structure:
{
  "dataQuality": {
    "score": 8,
    "issues": ["issue1", "issue2"],
    "recommendations": ["rec1", "rec2"]
  },
  "statisticalSignificance": {
    "tests": [
      {
        "type": "t-test",
        "pValue": 0.03,
        "significant": true,
        "interpretation": "significant difference found"
      }
    ],
    "overall": true,
    "confidence": 95
  },
  "experimentalDesign": {
    "type": "controlled experiment",
    "controls": ["control1", "control2"],
    "variables": [
      {
        "name": "temperature",
        "type": "independent",
        "description": "experimental temperature",
        "range": "20-80°C"
      }
    ],
    "sampleSize": 100,
    "critique": ["critique1", "critique2"]
  },
  "dataPatterns": [
    {
      "description": "pattern description",
      "confidence": 85,
      "implications": ["implication1", "implication2"]
    }
  ],
  "hypotheses": [
    {
      "statement": "hypothesis statement",
      "rationale": "reasoning",
      "testability": 8,
      "significance": "high"
    }
  ]
}

Experimental data text:
${text.slice(0, 12000)}...`

      const response = await ollama.generate(prompt, 'llama3.2:3b', { format: 'json' })

      if (response.response) {
        try {
          return JSON.parse(response.response)
        } catch (error) {
          console.error('JSON parse error:', error)
        }
      }
    } catch (error) {
      console.error('Experimental analysis error:', error)
    }

    // Fallback analysis
    return {
      dataQuality: {
        score: 0,
        issues: ['Analysis could not be completed'],
        recommendations: ['Check Ollama connection and try again']
      },
      statisticalSignificance: {
        tests: [],
        overall: false,
        confidence: 0
      },
      experimentalDesign: {
        type: 'unknown',
        controls: [],
        variables: [],
        sampleSize: 0,
        critique: []
      },
      dataPatterns: [],
      hypotheses: []
    }
  }

  private async generateEmbeddings(text: string, structure: DocumentStructure): Promise<any> {
    // For now, return empty arrays - in production you'd use a real embedding model
    // This could be integrated with Ollama's embedding capabilities or OpenAI embeddings
    try {
      const summaryText = structure.abstract || text.slice(0, 1000)
      const methodologyText = structure.methodology || ''
      const conclusionText = structure.conclusion || ''

      // Placeholder embeddings - in production, use actual embedding model
      return {
        summary: new Array(384).fill(0).map(() => Math.random()),
        methodology: new Array(384).fill(0).map(() => Math.random()),
        conclusions: new Array(384).fill(0).map(() => Math.random()),
        fullText: new Array(384).fill(0).map(() => Math.random())
      }
    } catch (error) {
      console.error('Embedding generation error:', error)
      return {
        summary: [],
        methodology: [],
        conclusions: [],
        fullText: []
      }
    }
  }

  private async storeInVectorDB(analysis: DocumentAnalysis): Promise<void> {
    if (!this.index) {
return
}

    try {
      const vectors = [
        {
          id: `${analysis.id}-summary`,
          values: analysis.embeddings.summary,
          metadata: {
            documentId: analysis.id,
            type: 'summary',
            filename: analysis.filename,
            title: analysis.content.structure.title || analysis.filename
          }
        },
        {
          id: `${analysis.id}-methodology`,
          values: analysis.embeddings.methodology,
          metadata: {
            documentId: analysis.id,
            type: 'methodology',
            filename: analysis.filename,
            title: analysis.content.structure.title || analysis.filename
          }
        },
        {
          id: `${analysis.id}-full`,
          values: analysis.embeddings.fullText,
          metadata: {
            documentId: analysis.id,
            type: 'full_text',
            filename: analysis.filename,
            title: analysis.content.structure.title || analysis.filename
          }
        }
      ]

      await this.index.upsert(vectors)
    } catch (error) {
      console.error('Vector storage error:', error)
    }
  }

  private async findDocumentRelationships(analysis: DocumentAnalysis): Promise<DocumentRelationship[]> {
    if (!this.index) {
return []
}

    try {
      // Search for similar documents using embeddings
      const searchResults = await this.index.query({
        vector: analysis.embeddings.summary,
        topK: 10,
        includeMetadata: true,
        filter: {
          documentId: { $ne: analysis.id }
        }
      })

      const relationships: DocumentRelationship[] = []

      for (const match of (searchResults.matches || []) as any[]) {
        if (match.score > 0.7) { // High similarity threshold
          const relationshipType = await this.determineRelationshipType(
            analysis.content.text,
            match.metadata?.title || '',
            match.score
          )

          relationships.push({
            targetDocumentId: match.metadata?.documentId as string,
            type: relationshipType,
            similarity: match.score,
            description: `${Math.round(match.score * 100)}% similarity with related content`,
            specificSections: []
          })
        }
      }

      return relationships
    } catch (error) {
      console.error('Relationship finding error:', error)
      return []
    }
  }

  private async determineRelationshipType(
    sourceText: string,
    targetTitle: string,
    similarity: number
  ): Promise<DocumentRelationship['type']> {
    try {
      const prompt = `Analyze the relationship between these two documents:

Source document (excerpt): ${sourceText.slice(0, 2000)}
Target document title: ${targetTitle}
Similarity score: ${similarity}

Return only one of these relationship types:
- contradiction
- support
- methodological_gap
- builds_upon
- similar_findings`

      const response = await ollama.generate(prompt, 'llama3.2:3b')
      const relationship = response.response?.trim().toLowerCase()

      if (['contradiction', 'support', 'methodological_gap', 'builds_upon', 'similar_findings'].includes(relationship || '')) {
        return relationship as DocumentRelationship['type']
      }
    } catch (error) {
      console.error('Relationship type determination error:', error)
    }

    return 'similar_findings'
  }

  async performCrossDocumentAnalysis(documentIds: string[]): Promise<CrossDocumentAnalysis> {
    // This would fetch documents and perform comprehensive cross-analysis
    // For now, return a basic structure
    return {
      contradictions: [],
      methodologicalGaps: [],
      relationshipMap: {
        nodes: [],
        edges: []
      },
      consensusFindings: []
    }
  }

  async semanticSearch(query: string, topK: number = 10): Promise<SemanticSearchResult[]> {
    if (!this.index) {
return []
}

    try {
      // Generate query embedding (placeholder)
      const queryEmbedding = new Array(384).fill(0).map(() => Math.random())

      const searchResults = await this.index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true
      })

      return (searchResults.matches || []).map((match: any) => ({
        id: match.id,
        content: match.metadata?.title || 'No content available',
        similarity: match.score,
        documentId: match.metadata?.documentId,
        type: match.metadata?.type,
        metadata: match.metadata
      }))
    } catch (error) {
      console.error('Semantic search error:', error)
      return []
    }
  }
}