/**
 * AI-Powered Literature Gap Analysis Engine
 *
 * Analyzes collected sources to identify research gaps and opportunities,
 * providing novice-friendly explanations and feasible research directions.
 *
 * Location: src/lib/research/gapAnalysis.ts
 */

import { supabase } from '../supabase';
import { SourceData } from '@/components/literature/SourceCard';

// Types for gap analysis
export interface GapAnalysisResult {
  overallAssessment: string;
  identifiedGaps: GapOpportunity[];
  researchOpportunities: ResearchOpportunity[];
  methodologicalGaps: MethodologicalGap[];
  recommendations: string[];
  confidenceLevel: 'High' | 'Moderate' | 'Low';
  sourcesCovered: number;
  analysisDate: string;
  generatedAt: string;
}

export interface GapOpportunity {
  id: string;
  gapType: 'population' | 'methodology' | 'temporal' | 'context' | 'variable_interaction';
  title: string;
  description: string;
  whyMatters: string;
  currentLimitation: string;
  proposedApproach: string;
  noveltyScore: number; // 0-100
  feasibilityScore: number; // 0-100
  contributionScore: number; // 0-100
  overallScore: number; // 0-100
  estimatedScope: 'Small' | 'Medium' | 'Large';
  timeRequirement: string;
  resourcesNeeded: string[];
  ethicsConsiderations: string;
  relatedSources: string[];
}

export interface ResearchOpportunity {
  suggestedQuestion: string;
  rationale: string;
  approach: string;
  expectedOutcome: string;
  feasibilityAssessment: string;
  relatedGaps: string[];
}

export interface MethodologicalGap {
  missingMethod: string;
  currentApproaches: string[];
  whyNeeded: string;
  implementationSuggestion: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface SourceSynthesis {
  themes: string[];
  populations: PopulationCoverage[];
  methodologies: MethodologyPattern[];
  temporalCoverage: TemporalPattern;
  contexts: ContextPattern[];
  variables: VariablePattern[];
}

export interface PopulationCoverage {
  demographic: string;
  sourceCount: number;
  ageRanges: string[];
  characteristics: string[];
  coverage: 'Extensive' | 'Moderate' | 'Limited' | 'Missing';
}

export interface MethodologyPattern {
  approach: string;
  frequency: number;
  advantages: string[];
  limitations: string[];
  sourceIds: string[];
}

export interface TemporalPattern {
  yearRange: { min: number; max: number };
  distribution: { [year: string]: number };
  gaps: string[];
  outdatedAreas: string[];
}

export interface ContextPattern {
  setting: string;
  frequency: number;
  description: string;
  sourceIds: string[];
}

export interface VariablePattern {
  variable: string;
  interactions: string[];
  unexploredCombinations: string[];
  sourceIds: string[];
}

/**
 * Main function to perform comprehensive gap analysis
 */
export async function performGapAnalysis(
  sources: SourceData[],
  researchQuestion: string,
  projectId: string
): Promise<GapAnalysisResult> {
  try {
    console.log(`Starting gap analysis for ${sources.length} sources`);

    // Validate minimum sources requirement
    if (sources.length < 3) {
      return generateInsufficientSourcesResponse(sources.length, researchQuestion);
    }

    // 1. Synthesize sources to extract patterns
    const synthesis = await synthesizeSources(sources);

    // 2. Use AI to identify gaps
    const gapOpportunities = await identifyGapsWithAI(synthesis, sources, researchQuestion);

    // 3. Rank opportunities by feasibility and impact
    const rankedOpportunities = await rankOpportunities(gapOpportunities, researchQuestion);

    // 4. Generate research opportunities
    const researchOpportunities = await generateResearchOpportunities(rankedOpportunities, researchQuestion);

    // 5. Identify methodological gaps
    const methodologicalGaps = await identifyMethodologicalGaps(synthesis, researchQuestion);

    // 6. Generate overall assessment and recommendations
    const overallAssessment = await generateOverallAssessment(
      synthesis,
      rankedOpportunities,
      researchOpportunities,
      sources.length
    );

    const recommendations = await generateRecommendations(
      rankedOpportunities,
      researchOpportunities,
      methodologicalGaps,
      researchQuestion
    );

    // Cache the analysis results
    await cacheGapAnalysis(projectId, {
      overallAssessment,
      identifiedGaps: rankedOpportunities,
      researchOpportunities,
      methodologicalGaps,
      recommendations,
      confidenceLevel: determineConfidenceLevel(sources.length, synthesis),
      sourcesCovered: sources.length,
      analysisDate: new Date().toISOString(),
      generatedAt: new Date().toISOString()
    });

    return {
      overallAssessment,
      identifiedGaps: rankedOpportunities,
      researchOpportunities,
      methodologicalGaps,
      recommendations,
      confidenceLevel: determineConfidenceLevel(sources.length, synthesis),
      sourcesCovered: sources.length,
      analysisDate: new Date().toISOString(),
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error performing gap analysis:', error);
    return generateFallbackGapAnalysis(sources, researchQuestion);
  }
}

/**
 * Synthesize sources to extract patterns and themes
 */
async function synthesizeSources(sources: SourceData[]): Promise<SourceSynthesis> {
  // Extract themes from abstracts and key findings
  const themes = extractThemes(sources);

  // Analyze population coverage
  const populations = analyzePopulationCoverage(sources);

  // Identify methodological patterns
  const methodologies = analyzeMethodologies(sources);

  // Examine temporal coverage
  const temporalCoverage = analyzeTemporalCoverage(sources);

  // Extract context patterns
  const contexts = analyzeContexts(sources);

  // Identify variable patterns
  const variables = analyzeVariables(sources);

  return {
    themes,
    populations,
    methodologies,
    temporalCoverage,
    contexts,
    variables
  };
}

/**
 * Extract key themes from source abstracts and findings
 */
function extractThemes(sources: SourceData[]): string[] {
  const allText = sources.map(s =>
    `${s.title} ${s.abstract || ''} ${s.keyFindings.join(' ')}`
  ).join(' ').toLowerCase();

  // Common research themes and keywords
  const themePatterns = [
    { pattern: /online learning|e-learning|digital education/g, theme: 'Online Learning' },
    { pattern: /motivation|engagement|intrinsic|extrinsic/g, theme: 'Student Motivation' },
    { pattern: /anxiety|stress|mental health|wellbeing/g, theme: 'Mental Health' },
    { pattern: /social media|facebook|instagram|twitter/g, theme: 'Social Media' },
    { pattern: /sleep|circadian|insomnia|sleep patterns/g, theme: 'Sleep and Health' },
    { pattern: /cognitive|memory|attention|processing/g, theme: 'Cognitive Function' },
    { pattern: /intervention|treatment|therapy|program/g, theme: 'Interventions' },
    { pattern: /gender|sex differences|male|female/g, theme: 'Gender Differences' },
    { pattern: /academic performance|grades|achievement/g, theme: 'Academic Performance' },
    { pattern: /technology|digital|mobile|app/g, theme: 'Technology Use' },
    { pattern: /adolescent|teenager|young adult|college/g, theme: 'Young Adults' },
    { pattern: /longitudinal|follow-up|over time/g, theme: 'Longitudinal Research' },
    { pattern: /cross-cultural|cultural|ethnic|diversity/g, theme: 'Cultural Factors' },
    { pattern: /pandemic|covid|coronavirus/g, theme: 'Pandemic Impact' },
    { pattern: /exercise|physical activity|fitness/g, theme: 'Physical Activity' }
  ];

  const foundThemes: string[] = [];
  themePatterns.forEach(({ pattern, theme }) => {
    if (pattern.test(allText)) {
      foundThemes.push(theme);
    }
  });

  return foundThemes.length > 0 ? foundThemes : ['General Research'];
}

/**
 * Analyze population coverage across sources
 */
function analyzePopulationCoverage(sources: SourceData[]): PopulationCoverage[] {
  const populations: PopulationCoverage[] = [];

  // Extract age-related information
  const agePatterns = [
    { pattern: /adolescent|teenager|teen|13-18|14-17|15-19/gi, demo: 'Adolescents (13-18)' },
    { pattern: /college|university|undergraduate|18-22|19-23|student/gi, demo: 'College Students (18-22)' },
    { pattern: /young adult|18-25|19-26|20-29/gi, demo: 'Young Adults (18-25)' },
    { pattern: /adult|25\+|26\+|30\+|middle-aged/gi, demo: 'Adults (25+)' },
    { pattern: /elderly|senior|older adult|65\+|60\+/gi, demo: 'Older Adults (60+)' },
    { pattern: /children|child|pediatric|under 18|minors/gi, demo: 'Children (Under 18)' }
  ];

  const allText = sources.map(s => `${s.title} ${s.abstract || ''}`).join(' ');

  agePatterns.forEach(({ pattern, demo }) => {
    const matches = allText.match(pattern);
    if (matches) {
      const sourceCount = sources.filter(s =>
        pattern.test(`${s.title} ${s.abstract || ''}`)
      ).length;

      populations.push({
        demographic: demo,
        sourceCount,
        ageRanges: [demo.match(/\((.*?)\)/)?.[1] || 'Various'],
        characteristics: extractCharacteristics(sources, pattern),
        coverage: sourceCount >= 3 ? 'Extensive' : sourceCount >= 2 ? 'Moderate' : 'Limited'
      });
    }
  });

  return populations.length > 0 ? populations : [{
    demographic: 'General Population',
    sourceCount: sources.length,
    ageRanges: ['Not specified'],
    characteristics: ['Mixed demographics'],
    coverage: 'Moderate'
  }];
}

/**
 * Extract characteristics for a demographic
 */
function extractCharacteristics(sources: SourceData[], pattern: RegExp): string[] {
  const characteristics: string[] = [];
  const relevantSources = sources.filter(s => pattern.test(`${s.title} ${s.abstract || ''}`));

  relevantSources.forEach(source => {
    if (source.abstract) {
      if (/gender|sex|male|female/i.test(source.abstract)) characteristics.push('Gender-specific');
      if (/ethnicity|race|cultural|diverse/i.test(source.abstract)) characteristics.push('Diverse backgrounds');
      if (/clinical|patient|disorder/i.test(source.abstract)) characteristics.push('Clinical populations');
      if (/healthy|normal|typical/i.test(source.abstract)) characteristics.push('Healthy populations');
    }
  });

  return [...new Set(characteristics)];
}

/**
 * Analyze methodological patterns
 */
function analyzeMethodologies(sources: SourceData[]): MethodologyPattern[] {
  const methodPatterns = [
    {
      pattern: /randomized|controlled trial|rct/gi,
      approach: 'Randomized Controlled Trial',
      advantages: ['High internal validity', 'Causal inference'],
      limitations: ['Artificial settings', 'Limited external validity']
    },
    {
      pattern: /survey|questionnaire|self-report/gi,
      approach: 'Survey/Questionnaire',
      advantages: ['Large sample sizes', 'Cost-effective'],
      limitations: ['Self-report bias', 'Limited depth']
    },
    {
      pattern: /interview|qualitative|focus group/gi,
      approach: 'Qualitative Methods',
      advantages: ['Rich data', 'Contextual understanding'],
      limitations: ['Small samples', 'Subjective interpretation']
    },
    {
      pattern: /longitudinal|follow-up|over time/gi,
      approach: 'Longitudinal Study',
      advantages: ['Tracks changes', 'Developmental insights'],
      limitations: ['Attrition', 'Time-intensive']
    },
    {
      pattern: /cross-sectional|single time point/gi,
      approach: 'Cross-sectional Study',
      advantages: ['Quick data collection', 'Snapshot view'],
      limitations: ['No causality', 'Temporal limitations']
    },
    {
      pattern: /experimental|experiment|manipulation/gi,
      approach: 'Experimental Design',
      advantages: ['Controlled conditions', 'Causal relationships'],
      limitations: ['Artificial environment', 'Ethical constraints']
    }
  ];

  const methodologies: MethodologyPattern[] = [];
  const allText = sources.map(s => `${s.title} ${s.abstract || ''} ${s.credibility.studyType || ''}`).join(' ');

  methodPatterns.forEach(({ pattern, approach, advantages, limitations }) => {
    const frequency = (allText.match(pattern) || []).length;
    if (frequency > 0) {
      const sourceIds = sources
        .filter(s => pattern.test(`${s.title} ${s.abstract || ''} ${s.credibility.studyType || ''}`))
        .map(s => s.id);

      methodologies.push({
        approach,
        frequency,
        advantages,
        limitations,
        sourceIds
      });
    }
  });

  return methodologies;
}

/**
 * Analyze temporal coverage patterns
 */
function analyzeTemporalCoverage(sources: SourceData[]): TemporalPattern {
  const years = sources.map(s => s.year).filter(year => year);
  const yearCounts: { [year: string]: number } = {};

  years.forEach(year => {
    yearCounts[year.toString()] = (yearCounts[year.toString()] || 0) + 1;
  });

  const currentYear = new Date().getFullYear();
  const gaps: string[] = [];
  const outdatedAreas: string[] = [];

  // Identify temporal gaps
  if (years.every(year => year > 2015)) {
    gaps.push('No research from before 2015 - missing historical context');
  }
  if (years.every(year => year < 2020)) {
    gaps.push('No recent research (post-2020) - may not reflect current trends');
  }
  if (years.every(year => currentYear - year > 5)) {
    outdatedAreas.push('All research is over 5 years old - findings may be outdated');
  }

  return {
    yearRange: { min: Math.min(...years), max: Math.max(...years) },
    distribution: yearCounts,
    gaps,
    outdatedAreas
  };
}

/**
 * Analyze context patterns where research was conducted
 */
function analyzeContexts(sources: SourceData[]): ContextPattern[] {
  const contextPatterns = [
    { pattern: /school|classroom|academic|educational/gi, setting: 'Educational Settings' },
    { pattern: /hospital|clinic|medical|healthcare/gi, setting: 'Healthcare Settings' },
    { pattern: /online|virtual|remote|digital/gi, setting: 'Online/Virtual Environments' },
    { pattern: /workplace|work|occupational|job/gi, setting: 'Workplace Settings' },
    { pattern: /community|home|natural|everyday/gi, setting: 'Community/Home Settings' },
    { pattern: /laboratory|lab|controlled|experimental/gi, setting: 'Laboratory Settings' }
  ];

  const contexts: ContextPattern[] = [];
  const allText = sources.map(s => `${s.title} ${s.abstract || ''}`).join(' ');

  contextPatterns.forEach(({ pattern, setting }) => {
    const matches = allText.match(pattern);
    if (matches) {
      const frequency = matches.length;
      const sourceIds = sources
        .filter(s => pattern.test(`${s.title} ${s.abstract || ''}`))
        .map(s => s.id);

      contexts.push({
        setting,
        frequency,
        description: `Research conducted in ${setting.toLowerCase()}`,
        sourceIds
      });
    }
  });

  return contexts;
}

/**
 * Analyze variable patterns and interactions
 */
function analyzeVariables(sources: SourceData[]): VariablePattern[] {
  const variables: VariablePattern[] = [];

  // Common research variables
  const variablePatterns = [
    'sleep', 'stress', 'anxiety', 'motivation', 'performance', 'engagement',
    'technology use', 'social media', 'exercise', 'diet', 'mood', 'attention'
  ];

  const allText = sources.map(s => `${s.title} ${s.abstract || ''}`).join(' ').toLowerCase();

  variablePatterns.forEach(variable => {
    if (allText.includes(variable)) {
      const interactions: string[] = [];
      const unexploredCombinations: string[] = [];

      // Check for interactions with other variables
      variablePatterns.forEach(otherVar => {
        if (otherVar !== variable && allText.includes(otherVar)) {
          const combinedPattern = new RegExp(`${variable}.*${otherVar}|${otherVar}.*${variable}`, 'i');
          if (combinedPattern.test(allText)) {
            interactions.push(otherVar);
          } else {
            unexploredCombinations.push(otherVar);
          }
        }
      });

      const sourceIds = sources
        .filter(s => `${s.title} ${s.abstract || ''}`.toLowerCase().includes(variable))
        .map(s => s.id);

      variables.push({
        variable,
        interactions,
        unexploredCombinations: unexploredCombinations.slice(0, 3), // Limit to most relevant
        sourceIds
      });
    }
  });

  return variables;
}

/**
 * Use AI to identify research gaps
 */
async function identifyGapsWithAI(
  synthesis: SourceSynthesis,
  sources: SourceData[],
  researchQuestion: string
): Promise<GapOpportunity[]> {
  try {
    const prompt = `Analyze the following literature synthesis and identify specific research gaps for a student researcher.

Research Question: "${researchQuestion}"

Literature Synthesis:
- Themes: ${synthesis.themes.join(', ')}
- Population Coverage: ${synthesis.populations.map(p => `${p.demographic} (${p.coverage})`).join(', ')}
- Methodologies: ${synthesis.methodologies.map(m => `${m.approach} (${m.frequency} studies)`).join(', ')}
- Time Range: ${synthesis.temporalCoverage.yearRange.min}-${synthesis.temporalCoverage.yearRange.max}
- Contexts: ${synthesis.contexts.map(c => c.setting).join(', ')}

Based on this synthesis, identify 3-5 specific research gaps that:
1. Are feasible for a student project (6 months, limited resources)
2. Would contribute meaningfully to the field
3. Connect directly to the research question

For each gap, provide:
- Clear title and description
- Why this gap matters (impact/significance)
- Current limitation in the literature
- Specific approach to address it
- Feasibility assessment for students

Format as JSON with clear, novice-friendly language.`;

    const response = await fetch('/api/ai/enhanced-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a research methodology expert specializing in identifying literature gaps for student researchers. Provide practical, feasible research opportunities with clear explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        projectContext: {
          analysisType: 'gap_identification',
          requiresStructuredOutput: true
        }
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const aiGaps = parseAIGapResponse(data.message?.content || '');

      // Score and enhance AI-identified gaps
      return aiGaps.map((gap, index) => ({
        id: `ai-gap-${index}`,
        gapType: gap.gapType || 'methodology',
        title: gap.title || `Research Gap ${index + 1}`,
        description: gap.description || 'Identified research opportunity',
        whyMatters: gap.whyMatters || 'This gap represents an opportunity to contribute new knowledge',
        currentLimitation: gap.currentLimitation || 'Current research has not addressed this area',
        proposedApproach: gap.proposedApproach || 'Further investigation needed',
        estimatedScope: gap.estimatedScope || 'Medium',
        timeRequirement: gap.timeRequirement || '3-6 months',
        resourcesNeeded: gap.resourcesNeeded || ['Basic research tools', 'Data collection methods'],
        ethicsConsiderations: gap.ethicsConsiderations || 'Standard ethical review required',
        noveltyScore: calculateNoveltyScore(gap, synthesis),
        feasibilityScore: calculateFeasibilityScore(gap),
        contributionScore: calculateContributionScore(gap, researchQuestion),
        overallScore: 0, // Will be calculated in ranking
        relatedSources: findRelatedSources(gap, sources)
      }));
    }

    throw new Error('AI gap analysis request failed');
  } catch (error) {
    console.warn('AI gap identification failed, using rule-based approach:', error);
    return generateRuleBasedGaps(synthesis, sources, researchQuestion);
  }
}

/**
 * Parse AI response for gap opportunities
 */
function parseAIGapResponse(aiResponse: string): Partial<GapOpportunity>[] {
  try {
    // Try to extract JSON from the response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback: parse structured text response
    return parseStructuredGapText(aiResponse);
  } catch (error) {
    console.warn('Error parsing AI gap response:', error);
    return [];
  }
}

/**
 * Parse structured text response when JSON parsing fails
 */
function parseStructuredGapText(text: string): Partial<GapOpportunity>[] {
  const gaps: Partial<GapOpportunity>[] = [];
  const gapBlocks = text.split(/Gap \d+:|^\d+\./gm).filter(block => block.trim());

  gapBlocks.forEach((block, index) => {
    const lines = block.trim().split('\n').filter(line => line.trim());

    let title = '';
    let description = '';
    let whyMatters = '';
    let currentLimitation = '';
    let proposedApproach = '';

    lines.forEach(line => {
      const lower = line.toLowerCase();
      if (lower.includes('title:') || lower.includes('gap:')) {
        title = line.replace(/^[^:]*:/, '').trim();
      } else if (lower.includes('description:')) {
        description = line.replace(/^[^:]*:/, '').trim();
      } else if (lower.includes('why') && lower.includes('matter')) {
        whyMatters = line.replace(/^[^:]*:/, '').trim();
      } else if (lower.includes('limitation:') || lower.includes('current:')) {
        currentLimitation = line.replace(/^[^:]*:/, '').trim();
      } else if (lower.includes('approach:') || lower.includes('solution:')) {
        proposedApproach = line.replace(/^[^:]*:/, '').trim();
      }
    });

    if (title || description) {
      gaps.push({
        title: title || `Research Gap ${index + 1}`,
        description: description || 'Identified opportunity for research',
        whyMatters: whyMatters || 'This gap represents an opportunity to contribute new knowledge',
        currentLimitation: currentLimitation || 'Current research has not addressed this area',
        proposedApproach: proposedApproach || 'Further investigation needed',
        gapType: 'methodology',
        estimatedScope: 'Medium',
        timeRequirement: '3-6 months',
        resourcesNeeded: ['Basic research tools', 'Data collection methods'],
        ethicsConsiderations: 'Standard ethical review required'
      });
    }
  });

  return gaps;
}

/**
 * Generate rule-based gaps when AI fails
 */
function generateRuleBasedGaps(
  synthesis: SourceSynthesis,
  sources: SourceData[],
  researchQuestion: string
): GapOpportunity[] {
  const gaps: GapOpportunity[] = [];

  // Population gaps
  const limitedPopulations = synthesis.populations.filter(p => p.coverage === 'Limited');
  limitedPopulations.forEach((pop, index) => {
    gaps.push({
      id: `pop-gap-${index}`,
      gapType: 'population',
      title: `Understudied Population: ${pop.demographic}`,
      description: `Only ${pop.sourceCount} studies include ${pop.demographic}, representing a significant gap in population coverage.`,
      whyMatters: `Understanding ${pop.demographic} is crucial for developing targeted interventions and generalizable findings.`,
      currentLimitation: `Current research primarily focuses on other demographics, limiting applicability to ${pop.demographic}.`,
      proposedApproach: `Conduct a focused study specifically examining ${pop.demographic} to fill this knowledge gap.`,
      noveltyScore: 80,
      feasibilityScore: 70,
      contributionScore: 75,
      overallScore: 75,
      estimatedScope: 'Medium',
      timeRequirement: '4-6 months',
      resourcesNeeded: ['Participant recruitment', 'Age-appropriate measures'],
      ethicsConsiderations: 'Special considerations for vulnerable populations may apply',
      relatedSources: []
    });
  });

  // Methodological gaps
  const commonMethods = synthesis.methodologies.map(m => m.approach);
  const missingMethods = [
    'Randomized Controlled Trial',
    'Longitudinal Study',
    'Qualitative Methods',
    'Mixed Methods'
  ].filter(method => !commonMethods.includes(method));

  missingMethods.forEach((method, index) => {
    gaps.push({
      id: `method-gap-${index}`,
      gapType: 'methodology',
      title: `Methodological Gap: ${method}`,
      description: `No studies in your collection use ${method}, which could provide valuable insights.`,
      whyMatters: `${method} offers unique advantages for understanding the research question from a different perspective.`,
      currentLimitation: `Current research relies on ${commonMethods.join(', ')}, limiting methodological diversity.`,
      proposedApproach: `Design a study using ${method} to complement existing research approaches.`,
      noveltyScore: 60,
      feasibilityScore: method === 'Qualitative Methods' ? 80 : 50,
      contributionScore: 70,
      overallScore: 65,
      estimatedScope: method === 'Longitudinal Study' ? 'Large' : 'Medium',
      timeRequirement: method === 'Longitudinal Study' ? '6+ months' : '3-4 months',
      resourcesNeeded: ['Methodological training', 'Appropriate tools'],
      ethicsConsiderations: 'Method-specific ethical considerations apply',
      relatedSources: []
    });
  });

  // Temporal gaps
  if (synthesis.temporalCoverage.gaps.length > 0) {
    gaps.push({
      id: 'temporal-gap-1',
      gapType: 'temporal',
      title: 'Temporal Research Gap',
      description: synthesis.temporalCoverage.gaps[0],
      whyMatters: 'Research context and findings may have evolved over time, requiring updated investigation.',
      currentLimitation: 'Current literature collection has temporal limitations affecting generalizability.',
      proposedApproach: 'Conduct current research to update and validate previous findings in contemporary context.',
      noveltyScore: 50,
      feasibilityScore: 90,
      contributionScore: 60,
      overallScore: 65,
      estimatedScope: 'Small',
      timeRequirement: '2-3 months',
      resourcesNeeded: ['Current data collection', 'Comparative analysis'],
      ethicsConsiderations: 'Standard ethical review sufficient',
      relatedSources: []
    });
  }

  return gaps.slice(0, 5); // Limit to top 5 gaps
}

/**
 * Calculate scoring for opportunities
 */
function calculateNoveltyScore(gap: Partial<GapOpportunity>, synthesis: SourceSynthesis): number {
  // Higher score for less studied areas
  if (gap.gapType === 'population') {
    const relatedPop = synthesis.populations.find(p =>
      gap.title?.toLowerCase().includes(p.demographic.toLowerCase())
    );
    return relatedPop?.coverage === 'Missing' ? 90 : relatedPop?.coverage === 'Limited' ? 75 : 50;
  }

  if (gap.gapType === 'methodology') {
    const methodExists = synthesis.methodologies.some(m =>
      gap.title?.toLowerCase().includes(m.approach.toLowerCase())
    );
    return methodExists ? 40 : 85;
  }

  return 60; // Default moderate novelty
}

function calculateFeasibilityScore(gap: Partial<GapOpportunity>): number {
  // Score based on estimated complexity and resources
  if (gap.estimatedScope === 'Small') return 90;
  if (gap.estimatedScope === 'Medium') return 70;
  if (gap.estimatedScope === 'Large') return 40;

  // Default based on gap type
  if (gap.gapType === 'population') return 75;
  if (gap.gapType === 'methodology') return 60;
  if (gap.gapType === 'temporal') return 85;

  return 65;
}

function calculateContributionScore(gap: Partial<GapOpportunity>, researchQuestion: string): number {
  // Score based on relevance to research question
  const questionWords = researchQuestion.toLowerCase().split(' ');
  const gapText = `${gap.title} ${gap.description}`.toLowerCase();

  const relevantWords = questionWords.filter(word =>
    word.length > 3 && gapText.includes(word)
  );

  const relevanceRatio = relevantWords.length / Math.max(questionWords.length, 1);
  return Math.round(relevanceRatio * 100);
}

/**
 * Find sources related to a gap
 */
function findRelatedSources(gap: Partial<GapOpportunity>, sources: SourceData[]): string[] {
  if (!gap.title && !gap.description) return [];

  const gapText = `${gap.title} ${gap.description}`.toLowerCase();

  return sources
    .filter(source => {
      const sourceText = `${source.title} ${source.abstract || ''}`.toLowerCase();
      return gapText.split(' ').some(word =>
        word.length > 3 && sourceText.includes(word)
      );
    })
    .map(source => source.id)
    .slice(0, 3); // Limit to most relevant
}

/**
 * Rank opportunities by overall score
 */
async function rankOpportunities(
  opportunities: GapOpportunity[],
  researchQuestion: string
): Promise<GapOpportunity[]> {
  return opportunities
    .map(opp => ({
      ...opp,
      overallScore: Math.round(
        (opp.noveltyScore * 0.3) +
        (opp.feasibilityScore * 0.4) +
        (opp.contributionScore * 0.3)
      )
    }))
    .sort((a, b) => b.overallScore - a.overallScore);
}

/**
 * Generate specific research opportunities
 */
async function generateResearchOpportunities(
  gaps: GapOpportunity[],
  researchQuestion: string
): Promise<ResearchOpportunity[]> {
  const opportunities: ResearchOpportunity[] = [];

  // Generate opportunities for top 3 gaps
  const topGaps = gaps.slice(0, 3);

  for (const gap of topGaps) {
    opportunities.push({
      suggestedQuestion: generateResearchQuestion(gap, researchQuestion),
      rationale: `This addresses the identified gap: ${gap.title}. ${gap.whyMatters}`,
      approach: gap.proposedApproach,
      expectedOutcome: generateExpectedOutcome(gap),
      feasibilityAssessment: `${gap.estimatedScope} scope project requiring ${gap.timeRequirement}. Feasibility score: ${gap.feasibilityScore}/100.`,
      relatedGaps: [gap.id]
    });
  }

  return opportunities;
}

/**
 * Generate a specific research question for a gap
 */
function generateResearchQuestion(gap: GapOpportunity, originalQuestion: string): string {
  const baseQuestion = originalQuestion.replace(/[?.]$/, '');

  switch (gap.gapType) {
    case 'population':
      const population = gap.title.replace('Understudied Population: ', '');
      return `How does ${baseQuestion.toLowerCase()} specifically affect ${population}?`;

    case 'methodology':
      const method = gap.title.replace('Methodological Gap: ', '');
      return `What insights about ${baseQuestion.toLowerCase()} can be gained through ${method.toLowerCase()}?`;

    case 'temporal':
      return `How has ${baseQuestion.toLowerCase()} changed in recent years (post-2020)?`;

    case 'context':
      return `How does ${baseQuestion.toLowerCase()} manifest in different settings or contexts?`;

    case 'variable_interaction':
      return `What factors interact with ${baseQuestion.toLowerCase()} to influence outcomes?`;

    default:
      return `How can we better understand ${baseQuestion.toLowerCase()} by addressing current research limitations?`;
  }
}

/**
 * Generate expected outcome for a gap
 */
function generateExpectedOutcome(gap: GapOpportunity): string {
  const baseOutcome = 'This research would contribute new knowledge to the field';

  switch (gap.gapType) {
    case 'population':
      return `${baseOutcome} by providing insights specific to an understudied population, improving generalizability of findings.`;

    case 'methodology':
      return `${baseOutcome} by applying a novel methodological approach, offering new perspectives on existing questions.`;

    case 'temporal':
      return `${baseOutcome} by updating understanding with current data, ensuring findings remain relevant.`;

    case 'context':
      return `${baseOutcome} by examining how context influences outcomes, improving real-world applicability.`;

    default:
      return `${baseOutcome} by filling an important gap in current understanding.`;
  }
}

/**
 * Identify methodological gaps
 */
async function identifyMethodologicalGaps(
  synthesis: SourceSynthesis,
  researchQuestion: string
): Promise<MethodologicalGap[]> {
  const gaps: MethodologicalGap[] = [];
  const usedMethods = synthesis.methodologies.map(m => m.approach);

  const allMethods = [
    {
      method: 'Randomized Controlled Trial',
      needed: 'To establish causal relationships and test interventions',
      implementation: 'Design an experimental study with random assignment to conditions',
      difficulty: 'Advanced' as const
    },
    {
      method: 'Longitudinal Study',
      needed: 'To track changes over time and understand development',
      implementation: 'Follow participants across multiple time points',
      difficulty: 'Advanced' as const
    },
    {
      method: 'Qualitative Interviews',
      needed: 'To understand lived experiences and perspectives in depth',
      implementation: 'Conduct semi-structured interviews with thematic analysis',
      difficulty: 'Intermediate' as const
    },
    {
      method: 'Mixed Methods Approach',
      needed: 'To combine quantitative breadth with qualitative depth',
      implementation: 'Integrate quantitative surveys with qualitative interviews',
      difficulty: 'Advanced' as const
    },
    {
      method: 'Cross-Cultural Comparison',
      needed: 'To understand how cultural factors influence outcomes',
      implementation: 'Compare findings across different cultural groups',
      difficulty: 'Intermediate' as const
    }
  ];

  allMethods.forEach(({ method, needed, implementation, difficulty }) => {
    if (!usedMethods.includes(method)) {
      gaps.push({
        missingMethod: method,
        currentApproaches: usedMethods,
        whyNeeded: needed,
        implementationSuggestion: implementation,
        difficultyLevel: difficulty
      });
    }
  });

  return gaps.slice(0, 3); // Return top 3 methodological gaps
}

/**
 * Generate overall assessment
 */
async function generateOverallAssessment(
  synthesis: SourceSynthesis,
  gaps: GapOpportunity[],
  opportunities: ResearchOpportunity[],
  sourceCount: number
): Promise<string> {
  const topGap = gaps[0];
  const coverage = synthesis.populations.map(p => p.coverage);
  const methodDiversity = synthesis.methodologies.length;

  let assessment = `Based on analysis of ${sourceCount} sources, `;

  if (sourceCount >= 8) {
    assessment += 'your literature collection provides a solid foundation for gap analysis. ';
  } else if (sourceCount >= 5) {
    assessment += 'your literature collection provides a good starting point for identifying research opportunities. ';
  } else {
    assessment += 'your literature collection shows initial patterns, though additional sources would strengthen the analysis. ';
  }

  if (topGap) {
    assessment += `The most promising research opportunity is ${topGap.title.toLowerCase()}, which scored ${topGap.overallScore}/100 for overall potential. `;
  }

  if (methodDiversity >= 3) {
    assessment += 'The studies show good methodological diversity, ';
  } else {
    assessment += 'The studies show limited methodological diversity, ';
  }

  if (coverage.includes('Missing') || coverage.includes('Limited')) {
    assessment += 'with notable gaps in population coverage that present clear research opportunities.';
  } else {
    assessment += 'with comprehensive population coverage across most relevant groups.';
  }

  return assessment;
}

/**
 * Generate recommendations
 */
async function generateRecommendations(
  gaps: GapOpportunity[],
  opportunities: ResearchOpportunity[],
  methodGaps: MethodologicalGap[],
  researchQuestion: string
): Promise<string[]> {
  const recommendations: string[] = [];

  // Top opportunity recommendation
  if (gaps.length > 0) {
    const topGap = gaps[0];
    recommendations.push(
      `Focus on ${topGap.title.toLowerCase()} - this represents your highest-impact opportunity (${topGap.overallScore}/100 score) and is feasible for a student project.`
    );
  }

  // Methodological recommendation
  const easyMethod = methodGaps.find(g => g.difficultyLevel === 'Beginner' || g.difficultyLevel === 'Intermediate');
  if (easyMethod) {
    recommendations.push(
      `Consider using ${easyMethod.missingMethod.toLowerCase()} as your research approach - ${easyMethod.whyNeeded.toLowerCase()}.`
    );
  }

  // Population recommendation
  if (gaps.some(g => g.gapType === 'population')) {
    const popGap = gaps.find(g => g.gapType === 'population');
    if (popGap) {
      recommendations.push(
        `Target the understudied population identified in your analysis to maximize the novelty and contribution of your research.`
      );
    }
  }

  // Timeline recommendation
  const feasibleGaps = gaps.filter(g => g.feasibilityScore >= 70);
  if (feasibleGaps.length > 0) {
    recommendations.push(
      `${feasibleGaps.length} of the identified gaps are highly feasible for student research - prioritize these for immediate action.`
    );
  }

  // Collection expansion recommendation
  if (gaps.length < 3) {
    recommendations.push(
      'Consider expanding your literature collection to identify additional research opportunities and strengthen your gap analysis.'
    );
  }

  return recommendations.slice(0, 5); // Limit to 5 key recommendations
}

/**
 * Determine confidence level based on source count and analysis quality
 */
function determineConfidenceLevel(sourceCount: number, synthesis: SourceSynthesis): 'High' | 'Moderate' | 'Low' {
  if (sourceCount >= 10 && synthesis.methodologies.length >= 3) return 'High';
  if (sourceCount >= 5 && synthesis.methodologies.length >= 2) return 'Moderate';
  return 'Low';
}

/**
 * Cache gap analysis results
 */
async function cacheGapAnalysis(projectId: string, analysis: GapAnalysisResult): Promise<void> {
  try {
    await supabase
      .from('gap_analyses')
      .upsert({
        project_id: projectId,
        analysis_data: analysis,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
  } catch (error) {
    console.warn('Failed to cache gap analysis:', error);
  }
}

/**
 * Generate response when insufficient sources
 */
function generateInsufficientSourcesResponse(sourceCount: number, researchQuestion: string): GapAnalysisResult {
  return {
    overallAssessment: `Your collection has ${sourceCount} sources. Gap analysis requires at least 3 sources to identify meaningful patterns and opportunities. Add more sources to unlock comprehensive gap analysis.`,
    identifiedGaps: [],
    researchOpportunities: [{
      suggestedQuestion: researchQuestion,
      rationale: 'Expand your literature collection to identify specific research opportunities',
      approach: 'Collect additional relevant sources through database searches and citation tracking',
      expectedOutcome: 'A more comprehensive understanding of research gaps and opportunities',
      feasibilityAssessment: 'High feasibility - literature collection is the essential first step',
      relatedGaps: []
    }],
    methodologicalGaps: [],
    recommendations: [
      'Add at least 2 more relevant sources to enable gap analysis',
      'Focus on recent publications (last 5 years) for current perspectives',
      'Include diverse methodological approaches for comprehensive coverage',
      'Consider both high-quality journal articles and relevant reports'
    ],
    confidenceLevel: 'Low',
    sourcesCovered: sourceCount,
    analysisDate: new Date().toISOString(),
    generatedAt: new Date().toISOString()
  };
}

/**
 * Generate fallback analysis when main process fails
 */
function generateFallbackGapAnalysis(sources: SourceData[], researchQuestion: string): GapAnalysisResult {
  const sourceCount = sources.length;

  return {
    overallAssessment: `Analysis of ${sourceCount} sources completed using basic pattern recognition. For more detailed insights, try refreshing the analysis.`,
    identifiedGaps: [{
      id: 'fallback-gap-1',
      gapType: 'methodology',
      title: 'Methodological Diversification Needed',
      description: 'Current literature may benefit from additional methodological approaches',
      whyMatters: 'Different research methods can reveal new insights and validate findings',
      currentLimitation: 'Limited methodological diversity in current collection',
      proposedApproach: 'Consider alternative research methods to complement existing studies',
      noveltyScore: 60,
      feasibilityScore: 75,
      contributionScore: 65,
      overallScore: 67,
      estimatedScope: 'Medium',
      timeRequirement: '3-6 months',
      resourcesNeeded: ['Research design planning', 'Data collection tools'],
      ethicsConsiderations: 'Standard ethical review required',
      relatedSources: sources.slice(0, 3).map(s => s.id)
    }],
    researchOpportunities: [{
      suggestedQuestion: `How can we extend current understanding of ${researchQuestion.toLowerCase()}?`,
      rationale: 'Building on existing research while addressing identified limitations',
      approach: 'Systematic investigation using complementary methods',
      expectedOutcome: 'Enhanced understanding of the research area',
      feasibilityAssessment: 'Moderate feasibility for student research project',
      relatedGaps: ['fallback-gap-1']
    }],
    methodologicalGaps: [{
      missingMethod: 'Additional Research Approaches',
      currentApproaches: ['Current methods from literature'],
      whyNeeded: 'To provide comprehensive understanding of the research question',
      implementationSuggestion: 'Explore alternative methodological frameworks',
      difficultyLevel: 'Intermediate'
    }],
    recommendations: [
      'Review current literature for methodological patterns',
      'Consider how your research can complement existing studies',
      'Focus on feasible approaches for student research',
      'Consult with advisors for research design guidance'
    ],
    confidenceLevel: 'Low',
    sourcesCovered: sourceCount,
    analysisDate: new Date().toISOString(),
    generatedAt: new Date().toISOString()
  };
}

/**
 * Export functions for testing and external use
 */
export {
  synthesizeSources,
  identifyGapsWithAI,
  rankOpportunities,
  generateResearchOpportunities,
  extractThemes,
  analyzePopulationCoverage,
  analyzeMethodologies
};