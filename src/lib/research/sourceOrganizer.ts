/**
 * Memory-Driven Source Organization System
 *
 * Intelligent source organization and retrieval using AI-powered clustering,
 * methodology detection, and timeline analysis for enhanced research workflow.
 *
 * Location: src/lib/research/sourceOrganizer.ts
 */

import { SourceData } from '@/components/literature/SourceCard';

// Types for source organization
export interface OrganizedSources {
  themes: ThemeCluster[];
  methodologies: MethodologyGroup[];
  timeline: TimelineGroup[];
  metadata: OrganizationMetadata;
}

export interface ThemeCluster {
  id: string;
  name: string;
  description: string;
  sources: SourceData[];
  keywords: string[];
  relevanceScore: number; // 0-100
  color: string; // For UI visualization
  isUserDefined: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MethodologyGroup {
  id: string;
  methodologyType: 'experimental' | 'survey' | 'meta-analysis' | 'case-study' | 'longitudinal' | 'cross-sectional' | 'qualitative' | 'mixed-methods' | 'systematic-review' | 'other';
  name: string;
  description: string;
  sources: SourceData[];
  characteristics: string[];
  strengthsWeaknesses: {
    strengths: string[];
    weaknesses: string[];
  };
}

export interface TimelineGroup {
  id: string;
  period: string; // e.g., "2020-2023", "2015-2019"
  yearRange: {
    start: number;
    end: number;
  };
  sources: SourceData[];
  trends: string[];
  evolutionNotes: string;
  relevanceToPresent: 'high' | 'moderate' | 'low';
}

export interface OrganizationMetadata {
  totalSources: number;
  organizationDate: string;
  clusteringMethod: 'ai-similarity' | 'manual' | 'hybrid';
  confidence: 'high' | 'moderate' | 'low';
  suggestions: OrganizationSuggestion[];
}

export interface OrganizationSuggestion {
  type: 'merge-themes' | 'split-theme' | 'add-methodology' | 'update-timeline';
  description: string;
  action: string;
  confidence: number;
}

// Theme colors for visualization
const THEME_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#84cc16', // Lime
  '#ec4899', // Pink
  '#6b7280'  // Gray
];

/**
 * Main function to organize sources using AI-powered clustering
 */
export async function organizeSources(
  sources: SourceData[],
  researchQuestion: string,
  projectId: string,
  options: {
    useExistingClusters?: boolean;
    manualOverrides?: Partial<OrganizedSources>;
  } = {}
): Promise<OrganizedSources> {
  try {
    console.log(`Starting source organization for ${sources.length} sources`);

    if (sources.length < 2) {
      return generateMinimalOrganization(sources, researchQuestion);
    }

    // 1. Generate embeddings for theme clustering
    const embeddings = await generateSourceEmbeddings(sources);

    // 2. Perform theme-based clustering
    const themes = await performThemeClustering(sources, embeddings, researchQuestion);

    // 3. Detect and group methodologies
    const methodologies = await detectMethodologies(sources);

    // 4. Create timeline organization
    const timeline = await createTimelineOrganization(sources);

    // 5. Generate organization metadata
    const metadata = generateOrganizationMetadata(sources, themes, methodologies, timeline);

    // 6. Apply manual overrides if provided
    const organizedSources: OrganizedSources = {
      themes,
      methodologies,
      timeline,
      metadata
    };

    if (options.manualOverrides) {
      applyManualOverrides(organizedSources, options.manualOverrides);
    }

    // 7. Cache the organization for future use
    await cacheSourceOrganization(projectId, organizedSources);

    return organizedSources;

  } catch (error) {
    console.error('Error organizing sources:', error);
    return generateFallbackOrganization(sources, researchQuestion);
  }
}

/**
 * Generate embeddings for source clustering using AI
 */
async function generateSourceEmbeddings(sources: SourceData[]): Promise<number[][]> {
  try {
    const embeddings: number[][] = [];

    for (const source of sources) {
      // Create text representation of the source
      const sourceText = `${source.title} ${source.abstract || ''} ${source.keyFindings?.join(' ') || ''}`;

      const response = await fetch('/api/ai/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceText,
          model: 'text-embedding-ada-002'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        embeddings.push(data.embedding);
      } else {
        // Fallback: generate simple numerical representation
        embeddings.push(generateFallbackEmbedding(sourceText));
      }
    }

    return embeddings;
  } catch (error) {
    console.warn('Error generating embeddings, using fallback:', error);
    return sources.map(source =>
      generateFallbackEmbedding(`${source.title} ${source.abstract || ''}`)
    );
  }
}

/**
 * Perform theme-based clustering using similarity analysis
 */
async function performThemeClustering(
  sources: SourceData[],
  embeddings: number[][],
  researchQuestion: string
): Promise<ThemeCluster[]> {
  try {
    // Use AI to identify optimal number of clusters and generate themes
    const clusterAnalysis = await analyzeOptimalClustering(sources, embeddings, researchQuestion);

    const clusters: ThemeCluster[] = [];
    let colorIndex = 0;

    for (const cluster of clusterAnalysis.clusters) {
      const theme: ThemeCluster = {
        id: `theme-${Date.now()}-${colorIndex}`,
        name: cluster.name,
        description: cluster.description,
        sources: cluster.sourceIndices.map(index => sources[index]),
        keywords: cluster.keywords,
        relevanceScore: cluster.relevanceScore,
        color: THEME_COLORS[colorIndex % THEME_COLORS.length],
        isUserDefined: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      clusters.push(theme);
      colorIndex++;
    }

    return clusters;

  } catch (error) {
    console.warn('Error in theme clustering, using fallback:', error);
    return generateFallbackThemes(sources);
  }
}

/**
 * Analyze optimal clustering using AI
 */
async function analyzeOptimalClustering(
  sources: SourceData[],
  embeddings: number[][],
  researchQuestion: string
): Promise<{
  clusters: {
    name: string;
    description: string;
    sourceIndices: number[];
    keywords: string[];
    relevanceScore: number;
  }[];
}> {
  try {
    // Calculate similarity matrix
    const similarityMatrix = calculateSimilarityMatrix(embeddings);

    // Use AI to generate optimal clusters
    const sourceTitles = sources.map((source, index) => `${index}: ${source.title}`).join('\n');

    const response = await fetch('/api/ai/enhanced-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          role: 'user',
          content: `Analyze these research sources and organize them into 2-4 thematic clusters based on their content similarity and relevance to the research question: "${researchQuestion}"

Sources:
${sourceTitles}

For each cluster, provide:
1. A clear, descriptive name (2-4 words)
2. A brief description of the theme
3. List of source indices that belong to this cluster
4. 3-5 keywords that represent the theme
5. Relevance score (0-100) to the research question

Return your analysis in this JSON format:
{
  "clusters": [
    {
      "name": "Theme Name",
      "description": "Brief description",
      "sourceIndices": [0, 1, 2],
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "relevanceScore": 85
    }
  ]
}

Focus on creating meaningful, distinct themes that help organize the literature effectively.`
        },
        projectId: 'source-organization'
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const aiResponse = data.message?.content || '';

      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    throw new Error('Failed to get AI clustering analysis');

  } catch (error) {
    console.warn('Error in AI clustering analysis, using similarity-based fallback:', error);
    return generateSimilarityBasedClusters(sources, embeddings);
  }
}

/**
 * Calculate similarity matrix for embeddings
 */
function calculateSimilarityMatrix(embeddings: number[][]): number[][] {
  const n = embeddings.length;
  const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1.0;
      } else {
        const similarity = cosineSimilarity(embeddings[i], embeddings[j]);
        matrix[i][j] = similarity;
        matrix[j][i] = similarity;
      }
    }
  }

  return matrix;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Detect and group sources by methodology
 */
async function detectMethodologies(sources: SourceData[]): Promise<MethodologyGroup[]> {
  const methodologyMap = new Map<string, SourceData[]>();

  for (const source of sources) {
    const methodology = await detectSourceMethodology(source);

    if (!methodologyMap.has(methodology.type)) {
      methodologyMap.set(methodology.type, []);
    }
    methodologyMap.get(methodology.type)!.push(source);
  }

  const methodologyGroups: MethodologyGroup[] = [];

  for (const [methodType, groupSources] of methodologyMap) {
    const methodInfo = getMethodologyInfo(methodType as any);

    methodologyGroups.push({
      id: `methodology-${methodType}`,
      methodologyType: methodType as any,
      name: methodInfo.name,
      description: methodInfo.description,
      sources: groupSources,
      characteristics: methodInfo.characteristics,
      strengthsWeaknesses: methodInfo.strengthsWeaknesses
    });
  }

  return methodologyGroups;
}

/**
 * Detect methodology type for a single source
 */
async function detectSourceMethodology(source: SourceData): Promise<{
  type: string;
  confidence: number;
}> {
  const text = `${source.title} ${source.abstract || ''} ${source.keyFindings?.join(' ') || ''}`.toLowerCase();

  // Rule-based detection for common methodology types
  const methodologyPatterns = {
    'experimental': ['experiment', 'randomized', 'controlled trial', 'intervention', 'treatment group'],
    'survey': ['survey', 'questionnaire', 'poll', 'self-report', 'likert scale'],
    'meta-analysis': ['meta-analysis', 'systematic review', 'pooled analysis', 'effect size'],
    'case-study': ['case study', 'case report', 'single case', 'case series'],
    'longitudinal': ['longitudinal', 'follow-up', 'cohort', 'over time', 'repeated measures'],
    'cross-sectional': ['cross-sectional', 'snapshot', 'point in time', 'prevalence study'],
    'qualitative': ['qualitative', 'interview', 'focus group', 'ethnographic', 'thematic analysis'],
    'mixed-methods': ['mixed methods', 'mixed-method', 'qualitative and quantitative'],
    'systematic-review': ['systematic review', 'literature review', 'scoping review']
  };

  let bestMatch = 'other';
  let bestScore = 0;

  for (const [methodology, patterns] of Object.entries(methodologyPatterns)) {
    let score = 0;
    for (const pattern of patterns) {
      if (text.includes(pattern)) {
        score += pattern.split(' ').length; // Longer patterns get higher scores
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = methodology;
    }
  }

  return {
    type: bestMatch,
    confidence: Math.min(bestScore * 10, 100) // Convert to percentage
  };
}

/**
 * Get methodology information and characteristics
 */
function getMethodologyInfo(methodologyType: string): {
  name: string;
  description: string;
  characteristics: string[];
  strengthsWeaknesses: { strengths: string[]; weaknesses: string[] };
} {
  const methodologyData: Record<string, any> = {
    'experimental': {
      name: 'Experimental Studies',
      description: 'Controlled experiments with randomization to test causal relationships',
      characteristics: ['Random assignment', 'Control groups', 'Manipulated variables', 'Causal inference'],
      strengthsWeaknesses: {
        strengths: ['Strong causal inference', 'High internal validity', 'Replicable results'],
        weaknesses: ['May lack external validity', 'Ethical constraints', 'Artificial settings']
      }
    },
    'survey': {
      name: 'Survey Research',
      description: 'Data collection through questionnaires and structured interviews',
      characteristics: ['Self-reported data', 'Large sample sizes', 'Standardized questions', 'Statistical analysis'],
      strengthsWeaknesses: {
        strengths: ['Large sample sizes', 'Cost-effective', 'Standardized data collection'],
        weaknesses: ['Response bias', 'Self-report limitations', 'Limited depth']
      }
    },
    'meta-analysis': {
      name: 'Meta-Analysis',
      description: 'Statistical synthesis of results from multiple independent studies',
      characteristics: ['Quantitative synthesis', 'Effect size calculation', 'Heterogeneity analysis', 'Publication bias assessment'],
      strengthsWeaknesses: {
        strengths: ['High statistical power', 'Comprehensive evidence', 'Objective synthesis'],
        weaknesses: ['Quality depends on included studies', 'Publication bias', 'Heterogeneity issues']
      }
    },
    'case-study': {
      name: 'Case Studies',
      description: 'In-depth analysis of individual cases or small groups',
      characteristics: ['Detailed examination', 'Contextual factors', 'Unique phenomena', 'Rich description'],
      strengthsWeaknesses: {
        strengths: ['Rich detailed data', 'Explores unique phenomena', 'Generates hypotheses'],
        weaknesses: ['Limited generalizability', 'Potential bias', 'No statistical inference']
      }
    },
    'other': {
      name: 'Other Methodologies',
      description: 'Various other research approaches and methodologies',
      characteristics: ['Diverse approaches', 'Context-specific methods'],
      strengthsWeaknesses: {
        strengths: ['Methodological diversity', 'Context-appropriate'],
        weaknesses: ['Varied quality standards', 'Difficult to compare']
      }
    }
  };

  return methodologyData[methodologyType] || methodologyData['other'];
}

/**
 * Create timeline organization with trend analysis
 */
async function createTimelineOrganization(sources: SourceData[]): Promise<TimelineGroup[]> {
  // Group sources by time periods
  const timeGroups = new Map<string, SourceData[]>();

  for (const source of sources) {
    const period = getTimePeriod(source.year || new Date().getFullYear());

    if (!timeGroups.has(period.label)) {
      timeGroups.set(period.label, []);
    }
    timeGroups.get(period.label)!.push(source);
  }

  const timelineGroups: TimelineGroup[] = [];

  for (const [periodLabel, groupSources] of timeGroups) {
    const period = parseTimePeriod(periodLabel);
    const trends = await analyzeTrends(groupSources, period);

    timelineGroups.push({
      id: `timeline-${periodLabel}`,
      period: periodLabel,
      yearRange: period,
      sources: groupSources,
      trends: trends.trends,
      evolutionNotes: trends.evolutionNotes,
      relevanceToPresent: trends.relevanceToPresent
    });
  }

  // Sort by year range
  timelineGroups.sort((a, b) => a.yearRange.start - b.yearRange.start);

  return timelineGroups;
}

/**
 * Determine time period for a given year
 */
function getTimePeriod(year: number): { label: string; start: number; end: number } {
  const currentYear = new Date().getFullYear();

  if (year >= currentYear - 2) {
    return { label: `${currentYear - 2}-${currentYear}`, start: currentYear - 2, end: currentYear };
  } else if (year >= currentYear - 5) {
    return { label: `${currentYear - 5}-${currentYear - 3}`, start: currentYear - 5, end: currentYear - 3 };
  } else if (year >= currentYear - 10) {
    return { label: `${currentYear - 10}-${currentYear - 6}`, start: currentYear - 10, end: currentYear - 6 };
  } else {
    return { label: `Before ${currentYear - 10}`, start: 1900, end: currentYear - 11 };
  }
}

/**
 * Parse time period label to get year range
 */
function parseTimePeriod(periodLabel: string): { start: number; end: number } {
  if (periodLabel.includes('Before')) {
    const year = parseInt(periodLabel.match(/\d+/)?.[0] || '2000');
    return { start: 1900, end: year };
  }

  const years = periodLabel.match(/\d+/g);
  if (years && years.length >= 2) {
    return { start: parseInt(years[0]), end: parseInt(years[1]) };
  }

  return { start: 2000, end: new Date().getFullYear() };
}

/**
 * Analyze trends within a time period
 */
async function analyzeTrends(
  sources: SourceData[],
  period: { start: number; end: number }
): Promise<{
  trends: string[];
  evolutionNotes: string;
  relevanceToPresent: 'high' | 'moderate' | 'low';
}> {
  const currentYear = new Date().getFullYear();
  const periodAge = currentYear - period.end;

  // Determine relevance based on recency
  let relevanceToPresent: 'high' | 'moderate' | 'low' = 'high';
  if (periodAge > 5) relevanceToPresent = 'moderate';
  if (periodAge > 10) relevanceToPresent = 'low';

  // Extract common themes and trends
  const allFindings = sources.flatMap(s => s.keyFindings || []);
  const commonTerms = extractCommonTerms(allFindings);

  const trends = [
    `${sources.length} studies published in this period`,
    ...commonTerms.slice(0, 3).map(term => `Focus on ${term}`),
    `Average ${Math.round(sources.reduce((sum, s) => sum + (s.year || period.start), 0) / sources.length)} publication year`
  ];

  const evolutionNotes = `This period showed ${sources.length > 5 ? 'significant' : 'moderate'} research activity with emphasis on ${commonTerms[0] || 'various topics'}.`;

  return {
    trends,
    evolutionNotes,
    relevanceToPresent
  };
}

/**
 * Extract common terms from a list of findings
 */
function extractCommonTerms(findings: string[]): string[] {
  const termCounts = new Map<string, number>();

  findings.forEach(finding => {
    const words = finding.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !isStopWord(word));

    words.forEach(word => {
      termCounts.set(word, (termCounts.get(word) || 0) + 1);
    });
  });

  return Array.from(termCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([term]) => term);
}

/**
 * Check if word is a stop word
 */
function isStopWord(word: string): boolean {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'between', 'among', 'within', 'without', 'throughout'
  ]);
  return stopWords.has(word);
}

/**
 * Generate fallback embedding for sources without AI
 */
function generateFallbackEmbedding(text: string): number[] {
  // Simple hash-based embedding (fallback only)
  const embedding = new Array(384).fill(0); // Standard embedding size

  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    const index = char % embedding.length;
    embedding[index] += Math.sin(char) * 0.1;
  }

  // Normalize
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => norm === 0 ? 0 : val / norm);
}

/**
 * Generate fallback themes when AI clustering fails
 */
function generateFallbackThemes(sources: SourceData[]): ThemeCluster[] {
  const themes: ThemeCluster[] = [];

  // Simple keyword-based grouping
  const keywordGroups = new Map<string, SourceData[]>();

  sources.forEach(source => {
    const keywords = extractKeywordsFromSource(source);
    const primaryKeyword = keywords[0] || 'general';

    if (!keywordGroups.has(primaryKeyword)) {
      keywordGroups.set(primaryKeyword, []);
    }
    keywordGroups.get(primaryKeyword)!.push(source);
  });

  let colorIndex = 0;
  for (const [keyword, groupSources] of keywordGroups) {
    themes.push({
      id: `fallback-theme-${colorIndex}`,
      name: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Research`,
      description: `Sources focused on ${keyword} and related topics`,
      sources: groupSources,
      keywords: [keyword],
      relevanceScore: 70,
      color: THEME_COLORS[colorIndex % THEME_COLORS.length],
      isUserDefined: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    colorIndex++;
  }

  return themes.length > 0 ? themes : [{
    id: 'fallback-general',
    name: 'General Research',
    description: 'All collected sources',
    sources: sources,
    keywords: ['research'],
    relevanceScore: 60,
    color: THEME_COLORS[0],
    isUserDefined: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }];
}

/**
 * Extract keywords from source for fallback clustering
 */
function extractKeywordsFromSource(source: SourceData): string[] {
  const text = `${source.title} ${source.abstract || ''}`.toLowerCase();
  const words = text.split(/\s+/).filter(word => word.length > 4 && !isStopWord(word));

  // Count word frequency
  const wordCounts = new Map<string, number>();
  words.forEach(word => {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  });

  return Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);
}

/**
 * Generate similarity-based clusters as fallback
 */
function generateSimilarityBasedClusters(
  sources: SourceData[],
  embeddings: number[][]
): {
  clusters: {
    name: string;
    description: string;
    sourceIndices: number[];
    keywords: string[];
    relevanceScore: number;
  }[];
} {
  // Simple clustering based on similarity threshold
  const clusters: any[] = [];
  const used = new Set<number>();
  const similarityThreshold = 0.3;

  for (let i = 0; i < sources.length; i++) {
    if (used.has(i)) continue;

    const cluster = {
      sourceIndices: [i],
      name: `Research Cluster ${clusters.length + 1}`,
      description: `Related research topics`,
      keywords: extractKeywordsFromSource(sources[i]),
      relevanceScore: 75
    };

    // Find similar sources
    for (let j = i + 1; j < sources.length; j++) {
      if (used.has(j)) continue;

      const similarity = cosineSimilarity(embeddings[i], embeddings[j]);
      if (similarity > similarityThreshold) {
        cluster.sourceIndices.push(j);
        used.add(j);
      }
    }

    used.add(i);
    clusters.push(cluster);
  }

  return { clusters };
}

/**
 * Generate organization metadata
 */
function generateOrganizationMetadata(
  sources: SourceData[],
  themes: ThemeCluster[],
  methodologies: MethodologyGroup[],
  timeline: TimelineGroup[]
): OrganizationMetadata {
  const suggestions: OrganizationSuggestion[] = [];

  // Generate suggestions based on organization
  if (themes.length > 6) {
    suggestions.push({
      type: 'merge-themes',
      description: 'Consider merging similar themes for better organization',
      action: 'Review themes with low source counts and similar keywords',
      confidence: 75
    });
  }

  if (themes.some(theme => theme.sources.length > sources.length * 0.6)) {
    suggestions.push({
      type: 'split-theme',
      description: 'Large theme detected that could be split',
      action: 'Consider breaking down the largest theme into sub-themes',
      confidence: 80
    });
  }

  return {
    totalSources: sources.length,
    organizationDate: new Date().toISOString(),
    clusteringMethod: 'ai-similarity',
    confidence: sources.length >= 5 ? 'high' : sources.length >= 3 ? 'moderate' : 'low',
    suggestions
  };
}

/**
 * Apply manual overrides to organization
 */
function applyManualOverrides(
  organization: OrganizedSources,
  overrides: Partial<OrganizedSources>
): void {
  if (overrides.themes) {
    organization.themes = overrides.themes;
  }
  if (overrides.methodologies) {
    organization.methodologies = overrides.methodologies;
  }
  if (overrides.timeline) {
    organization.timeline = overrides.timeline;
  }
}

/**
 * Cache source organization for future use
 */
async function cacheSourceOrganization(
  projectId: string,
  organization: OrganizedSources
): Promise<void> {
  try {
    // This would typically save to database
    console.log(`Caching source organization for project ${projectId}`);
    // await supabase.from('source_organizations').upsert({
    //   project_id: projectId,
    //   organization_data: organization,
    //   created_at: new Date().toISOString()
    // });
  } catch (error) {
    console.warn('Failed to cache source organization:', error);
  }
}

/**
 * Generate minimal organization for very few sources
 */
function generateMinimalOrganization(
  sources: SourceData[],
  researchQuestion: string
): OrganizedSources {
  return {
    themes: [{
      id: 'minimal-theme',
      name: 'Research Collection',
      description: 'Your collected research sources',
      sources: sources,
      keywords: ['research'],
      relevanceScore: 80,
      color: THEME_COLORS[0],
      isUserDefined: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }],
    methodologies: sources.length > 0 ? [{
      id: 'minimal-methodology',
      methodologyType: 'other',
      name: 'Various Methodologies',
      description: 'Mixed research approaches',
      sources: sources,
      characteristics: ['Diverse approaches'],
      strengthsWeaknesses: {
        strengths: ['Methodological diversity'],
        weaknesses: ['Need more sources for detailed analysis']
      }
    }] : [],
    timeline: sources.length > 0 ? [{
      id: 'minimal-timeline',
      period: 'Current Collection',
      yearRange: {
        start: Math.min(...sources.map(s => s.year || new Date().getFullYear())),
        end: Math.max(...sources.map(s => s.year || new Date().getFullYear()))
      },
      sources: sources,
      trends: ['Limited data for trend analysis'],
      evolutionNotes: 'Add more sources to analyze temporal trends',
      relevanceToPresent: 'high'
    }] : [],
    metadata: {
      totalSources: sources.length,
      organizationDate: new Date().toISOString(),
      clusteringMethod: 'manual',
      confidence: 'low',
      suggestions: [{
        type: 'add-methodology',
        description: 'Add more sources to enable detailed organization',
        action: 'Collect additional relevant sources for your research',
        confidence: 90
      }]
    }
  };
}

/**
 * Generate fallback organization when main process fails
 */
function generateFallbackOrganization(
  sources: SourceData[],
  researchQuestion: string
): OrganizedSources {
  return {
    themes: generateFallbackThemes(sources),
    methodologies: [{
      id: 'fallback-methodology',
      methodologyType: 'other',
      name: 'Mixed Methodologies',
      description: 'Various research approaches',
      sources: sources,
      characteristics: ['Diverse methodological approaches'],
      strengthsWeaknesses: {
        strengths: ['Methodological diversity'],
        weaknesses: ['Organization analysis failed - manual review recommended']
      }
    }],
    timeline: [{
      id: 'fallback-timeline',
      period: 'Research Collection',
      yearRange: {
        start: Math.min(...sources.map(s => s.year || 2020)),
        end: Math.max(...sources.map(s => s.year || new Date().getFullYear()))
      },
      sources: sources,
      trends: ['Analysis unavailable'],
      evolutionNotes: 'Timeline analysis failed - manual review needed',
      relevanceToPresent: 'moderate'
    }],
    metadata: {
      totalSources: sources.length,
      organizationDate: new Date().toISOString(),
      clusteringMethod: 'manual',
      confidence: 'low',
      suggestions: [{
        type: 'add-methodology',
        description: 'Organization failed - consider manual categorization',
        action: 'Review and manually organize sources',
        confidence: 60
      }]
    }
  };
}

/**
 * Re-organize sources with manual input
 */
export async function reorganizeSources(
  currentOrganization: OrganizedSources,
  changes: {
    moveSource?: { sourceId: string; fromTheme: string; toTheme: string };
    createTheme?: { name: string; description: string; sourceIds: string[] };
    mergeThemes?: { themeIds: string[]; newName: string };
    deleteTheme?: { themeId: string };
  }
): Promise<OrganizedSources> {
  const updated = JSON.parse(JSON.stringify(currentOrganization)); // Deep copy

  if (changes.moveSource) {
    // Implementation for moving sources between themes
    // This would update the themes array
  }

  if (changes.createTheme) {
    // Implementation for creating new themes
    // This would add to the themes array
  }

  // Update metadata
  updated.metadata.organizationDate = new Date().toISOString();
  updated.metadata.clusteringMethod = 'hybrid';

  return updated;
}

/**
 * Search and filter organized sources
 */
export function searchOrganizedSources(
  organization: OrganizedSources,
  query: string,
  filters: {
    themes?: string[];
    methodologies?: string[];
    timeRanges?: string[];
    minYear?: number;
    maxYear?: number;
  } = {}
): SourceData[] {
  let results: SourceData[] = [];

  // Collect sources from specified themes
  if (filters.themes && filters.themes.length > 0) {
    organization.themes
      .filter(theme => filters.themes!.includes(theme.id))
      .forEach(theme => results.push(...theme.sources));
  } else {
    organization.themes.forEach(theme => results.push(...theme.sources));
  }

  // Apply methodology filter
  if (filters.methodologies && filters.methodologies.length > 0) {
    const methodologySources = new Set<string>();
    organization.methodologies
      .filter(method => filters.methodologies!.includes(method.id))
      .forEach(method => method.sources.forEach(source => methodologySources.add(source.id)));

    results = results.filter(source => methodologySources.has(source.id));
  }

  // Apply year filters
  if (filters.minYear !== undefined) {
    results = results.filter(source => (source.year || 0) >= filters.minYear!);
  }
  if (filters.maxYear !== undefined) {
    results = results.filter(source => (source.year || 9999) <= filters.maxYear!);
  }

  // Apply text search
  if (query.trim()) {
    const queryLower = query.toLowerCase();
    results = results.filter(source =>
      source.title.toLowerCase().includes(queryLower) ||
      source.authors.some(author => author.toLowerCase().includes(queryLower)) ||
      (source.abstract && source.abstract.toLowerCase().includes(queryLower)) ||
      (source.keyFindings && source.keyFindings.some(finding =>
        finding.toLowerCase().includes(queryLower)
      ))
    );
  }

  // Remove duplicates
  const uniqueResults = Array.from(
    new Map(results.map(source => [source.id, source])).values()
  );

  return uniqueResults;
}

// Export utility functions for external use
export {
  generateSourceEmbeddings,
  calculateSimilarityMatrix,
  cosineSimilarity
};