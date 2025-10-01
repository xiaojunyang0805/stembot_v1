/**
 * Literature Context Retrieval for Chat Integration
 *
 * Provides literature source context to AI chat, enabling citation-aware responses
 * that reference the project's research sources.
 *
 * Location: src/lib/chat/literatureContext.ts
 */

import { getLiteratureStateForProject, CitationEntry } from '@/lib/research/crossPhaseIntegration';
import { getProjectSources, convertDatabaseSourceToSourceData } from '@/lib/database/sources';

export interface LiteratureContextResult {
  hasSources: boolean;
  sourceCount: number;
  contextPrompt: string;
  citations: CitationEntry[];
  relevantSources: Array<{
    title: string;
    authors: string[];
    year: number;
    keyFindings: string[];
    citation: string;
  }>;
}

/**
 * Retrieve literature context for a given project and query
 */
export async function getLiteratureContextForChat(
  projectId: string,
  userQuery: string
): Promise<LiteratureContextResult> {
  try {
    // Get literature state from cross-phase integration
    const literatureState = await getLiteratureStateForProject(projectId);

    if (!literatureState || literatureState.sources.length === 0) {
      return {
        hasSources: false,
        sourceCount: 0,
        contextPrompt: '',
        citations: [],
        relevantSources: []
      };
    }

    // Extract query keywords for relevance matching
    const queryKeywords = extractKeywords(userQuery);

    // Find relevant sources based on query
    const relevantSources = findRelevantSources(
      literatureState.citationDatabase,
      literatureState.sources,
      queryKeywords
    );

    // Build context prompt for AI
    const contextPrompt = buildLiteraturePrompt(
      literatureState.sources.length,
      relevantSources,
      literatureState.gapAnalysis
    );

    return {
      hasSources: true,
      sourceCount: literatureState.sources.length,
      contextPrompt,
      citations: literatureState.citationDatabase,
      relevantSources: relevantSources.map(rs => ({
        title: rs.source.title,
        authors: rs.source.authors,
        year: rs.source.year,
        keyFindings: rs.source.keyFindings || [],
        citation: rs.citation.inTextCitation
      }))
    };

  } catch (error) {
    console.warn('Error retrieving literature context:', error);
    return {
      hasSources: false,
      sourceCount: 0,
      contextPrompt: '',
      citations: [],
      relevantSources: []
    };
  }
}

/**
 * Extract keywords from user query
 */
function extractKeywords(query: string): string[] {
  // Convert to lowercase and remove common stop words
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'about', 'what', 'when', 'where',
    'who', 'why', 'how', 'can', 'could', 'should', 'would', 'do',
    'does', 'did', 'my', 'your', 'their', 'our', 'this', 'these',
    'those', 'tell', 'me', 'show', 'explain', 'help'
  ]);

  const words = query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Return unique keywords
  return [...new Set(words)];
}

/**
 * Find relevant sources based on query keywords
 */
function findRelevantSources(
  citations: CitationEntry[],
  sources: any[],
  keywords: string[]
): Array<{ citation: CitationEntry; source: any; relevance: number }> {
  const matches: Array<{ citation: CitationEntry; source: any; relevance: number }> = [];

  for (const citation of citations) {
    const source = sources.find(s => s.id === citation.sourceId);
    if (!source) continue;

    // Calculate relevance score
    let relevance = 0;

    // Check title
    const titleLower = source.title.toLowerCase();
    for (const keyword of keywords) {
      if (titleLower.includes(keyword)) {
        relevance += 3;
      }
    }

    // Check abstract
    const abstractLower = (source.abstract || '').toLowerCase();
    for (const keyword of keywords) {
      if (abstractLower.includes(keyword)) {
        relevance += 2;
      }
    }

    // Check key findings
    const findingsText = (source.keyFindings || []).join(' ').toLowerCase();
    for (const keyword of keywords) {
      if (findingsText.includes(keyword)) {
        relevance += 2;
      }
    }

    // Check topics
    const topicsText = citation.topics.join(' ').toLowerCase();
    for (const keyword of keywords) {
      if (topicsText.includes(keyword)) {
        relevance += 1;
      }
    }

    if (relevance > 0) {
      matches.push({ citation, source, relevance });
    }
  }

  // Sort by relevance and return top 5
  return matches
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5);
}

/**
 * Build literature context prompt for AI
 */
function buildLiteraturePrompt(
  totalSources: number,
  relevantSources: Array<{ citation: CitationEntry; source: any; relevance: number }>,
  gapAnalysis?: any
): string {
  if (relevantSources.length === 0) {
    return `\n\n📚 LITERATURE CONTEXT:
The student has collected ${totalSources} research sources for this project. While none directly match this specific query, you can reference their literature review when discussing research methodology and theoretical frameworks.`;
  }

  let prompt = `\n\n📚 LITERATURE CONTEXT:
The student has collected ${totalSources} research sources. Here are the most relevant to this query:

`;

  // Add relevant sources with findings
  relevantSources.forEach((rs, index) => {
    prompt += `${index + 1}. ${rs.citation.inTextCitation}
   Title: "${rs.source.title}"
   Key Findings:
`;
    const findings = rs.source.keyFindings || [];
    findings.slice(0, 3).forEach((finding: string) => {
      prompt += `   - ${finding}\n`;
    });

    if (rs.source.abstract && rs.source.abstract.length > 0) {
      const shortAbstract = rs.source.abstract.substring(0, 200);
      prompt += `   Summary: ${shortAbstract}${rs.source.abstract.length > 200 ? '...' : ''}\n`;
    }
    prompt += '\n';
  });

  // Add gap analysis context if available
  if (gapAnalysis && gapAnalysis.identifiedGaps && gapAnalysis.identifiedGaps.length > 0) {
    prompt += `\n🔍 IDENTIFIED RESEARCH GAPS:\n`;
    gapAnalysis.identifiedGaps.slice(0, 3).forEach((gap: any) => {
      prompt += `- ${gap.title}: ${gap.description}\n`;
    });
  }

  prompt += `\n💡 CITATION GUIDANCE:
When referencing these sources in your response:
- Use in-text citations like "${relevantSources[0].citation.inTextCitation}"
- Connect findings to the student's current research question
- Suggest how they can build on or address limitations in these sources
- Reference methodology approaches used in the literature
- Help bridge literature findings to their own research design

Remember to:
✅ Cite sources naturally when relevant
✅ Connect literature to their specific question
✅ Suggest how to use these sources in their research
✅ Identify patterns or contradictions across sources
`;

  return prompt;
}

/**
 * Format literature context for display in UI
 */
export function formatLiteratureSummaryForUI(context: LiteratureContextResult): string {
  if (!context.hasSources) {
    return '';
  }

  if (context.relevantSources.length === 0) {
    return `📚 ${context.sourceCount} sources available in literature review`;
  }

  return `📚 Referencing ${context.relevantSources.length} of ${context.sourceCount} sources from your literature review`;
}

/**
 * Extract citations from AI response
 */
export function extractCitationsFromResponse(
  response: string,
  availableCitations: CitationEntry[]
): string[] {
  const citedSources: string[] = [];

  for (const citation of availableCitations) {
    // Check for citation key or in-text citation
    if (
      response.includes(citation.citationKey) ||
      response.includes(citation.inTextCitation)
    ) {
      citedSources.push(citation.sourceId);
    }
  }

  return [...new Set(citedSources)];
}

/**
 * Check if query is literature-related
 */
export function isLiteratureQuery(query: string): boolean {
  const literatureKeywords = [
    'source', 'sources', 'literature', 'paper', 'papers', 'study', 'studies',
    'research', 'article', 'articles', 'finding', 'findings', 'citation',
    'citations', 'reference', 'references', 'author', 'authors', 'what do',
    'according to', 'based on', 'my sources say', 'literature review'
  ];

  const queryLower = query.toLowerCase();
  return literatureKeywords.some(keyword => queryLower.includes(keyword));
}
