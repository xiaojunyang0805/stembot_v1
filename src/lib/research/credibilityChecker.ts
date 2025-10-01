/**
 * AI-Powered Source Credibility Assessment System
 *
 * Provides comprehensive credibility scoring using automated metadata checks
 * and AI-powered methodology analysis with novice-friendly explanations.
 *
 * Location: src/lib/research/credibilityChecker.ts
 */

import { supabase } from '../supabase';

// Types for credibility assessment
export interface CredibilityMetrics {
  journalQuality: number; // 0-30 points
  recency: number; // 0-20 points
  sampleSize: number; // 0-20 points
  methodology: number; // 0-30 points
  totalScore: number; // 0-100
}

export interface CredibilityAssessment {
  level: 'High' | 'Moderate' | 'Low';
  score: number; // 0-100
  strengths: string[];
  limitations: string[];
  explanation: string; // Novice-friendly explanation
  impactFactor?: number;
  sampleSize?: number;
  publicationYear: number;
  studyType?: string;
  researchField?: string;
  metrics: CredibilityMetrics;
}

export interface SourceMetadata {
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  abstract?: string;
  fullText?: string;
  url?: string;
}

// Journal quality database (expandable)
const JOURNAL_IMPACT_FACTORS: Record<string, number> = {
  // High-impact journals
  'nature': 64.8,
  'science': 63.7,
  'cell': 66.9,
  'new england journal of medicine': 176.1,
  'lancet': 202.7,
  'journal of the american medical association': 120.7,
  'proceedings of the national academy of sciences': 12.8,
  'nature medicine': 87.2,
  'nature biotechnology': 68.2,
  'nature genetics': 38.3,

  // Medium-impact journals
  'plos one': 3.7,
  'scientific reports': 4.6,
  'bmc medicine': 9.3,
  'frontiers in psychology': 4.0,
  'journal of medical internet research': 7.1,
  'bmj open': 3.0,
  'plos medicine': 13.8,
  'journal of clinical medicine': 4.2,

  // Subject-specific high-quality journals
  'psychological science': 8.2,
  'journal of experimental psychology': 4.3,
  'developmental psychology': 4.9,
  'journal of educational psychology': 6.2,
  'computers & education': 11.2,
  'educational technology research and development': 4.3
};

// Study type hierarchy (higher = more credible)
const STUDY_TYPE_SCORES: Record<string, number> = {
  'Meta-analysis/Systematic Review': 30,
  'Randomized Controlled Trial': 28,
  'Cohort Study': 24,
  'Case-Control Study': 20,
  'Cross-sectional Study': 16,
  'Case Study': 12,
  'Survey Study': 14,
  'Experimental Study': 26,
  'Qualitative Study': 18,
  'Review Article': 22,
  'Research Study': 15
};

/**
 * Main function to assess source credibility
 */
export async function assessSourceCredibility(
  source: SourceMetadata,
  researchQuestion?: string
): Promise<CredibilityAssessment> {
  try {
    // Check if assessment already exists in cache
    const cachedAssessment = await getCachedAssessment(source);
    if (cachedAssessment) {
      return cachedAssessment;
    }

    // Extract metadata and calculate metrics
    const journalQuality = calculateJournalQuality(source.journal, source.year);
    const recency = calculateRecencyScore(source.year);
    const sampleSize = await extractAndScoreSampleSize(source);
    const methodology = await analyzeMethodologyWithAI(source, researchQuestion);

    const totalScore = journalQuality + recency + sampleSize + methodology;

    const metrics: CredibilityMetrics = {
      journalQuality,
      recency,
      sampleSize,
      methodology,
      totalScore
    };

    // Generate comprehensive assessment
    const assessment = await generateCredibilityAssessment(source, metrics, researchQuestion);

    // Cache the assessment
    await cacheAssessment(source, assessment);

    return assessment;

  } catch (error) {
    console.error('Error assessing source credibility:', error);
    return generateFallbackAssessment(source);
  }
}

/**
 * Calculate journal quality score (0-30 points)
 */
function calculateJournalQuality(journal: string, year: number): number {
  const normalizedJournal = journal.toLowerCase().trim();

  // Check for exact matches
  if (JOURNAL_IMPACT_FACTORS[normalizedJournal]) {
    const impactFactor = JOURNAL_IMPACT_FACTORS[normalizedJournal];
    // Convert impact factor to 0-30 scale (logarithmic for high values)
    return Math.min(30, Math.log10(impactFactor + 1) * 10);
  }

  // Check for partial matches
  for (const [knownJournal, impactFactor] of Object.entries(JOURNAL_IMPACT_FACTORS)) {
    if (normalizedJournal.includes(knownJournal) || knownJournal.includes(normalizedJournal)) {
      return Math.min(30, Math.log10(impactFactor + 1) * 10);
    }
  }

  // Heuristic scoring for unknown journals
  if (normalizedJournal.includes('nature') || normalizedJournal.includes('science')) return 25;
  if (normalizedJournal.includes('journal')) return 15;
  if (normalizedJournal.includes('proceedings') || normalizedJournal.includes('conference')) return 12;
  if (normalizedJournal.includes('international')) return 10;

  // Default for unknown journals
  return 8;
}

/**
 * Calculate recency score (0-20 points)
 */
function calculateRecencyScore(year: number): number {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  if (age < 0) return 0; // Future publications
  if (age <= 2) return 20; // Very recent
  if (age <= 5) return 16; // Recent
  if (age <= 10) return 12; // Moderately old
  if (age <= 15) return 8; // Old
  if (age <= 20) return 4; // Very old
  return 2; // Ancient
}

/**
 * Extract and score sample size (0-20 points)
 */
async function extractAndScoreSampleSize(source: SourceMetadata): Promise<number> {
  const text = (source.abstract || '') + ' ' + (source.fullText || '');

  // Look for sample size patterns
  const patterns = [
    /n\s*=\s*(\d+)/gi,
    /N\s*=\s*(\d+)/gi,
    /sample\s+(?:of\s+)?(\d+)/gi,
    /(\d+)\s+participants?/gi,
    /(\d+)\s+subjects?/gi,
    /(\d+)\s+patients?/gi,
    /(\d+)\s+individuals?/gi,
    /(\d+)\s+respondents?/gi,
    /total\s+of\s+(\d+)/gi
  ];

  let maxSampleSize = 0;

  for (const pattern of patterns) {
    const matches = Array.from(text.matchAll(pattern));
    for (const match of matches) {
      const size = parseInt(match[1]);
      if (size > maxSampleSize && size < 1000000) { // Reasonable upper bound
        maxSampleSize = size;
      }
    }
  }

  // Score based on sample size (logarithmic scale)
  if (maxSampleSize === 0) return 5; // No sample size found
  if (maxSampleSize < 10) return 6;
  if (maxSampleSize < 30) return 8;
  if (maxSampleSize < 100) return 12;
  if (maxSampleSize < 500) return 16;
  if (maxSampleSize < 1000) return 18;
  return 20; // Large sample
}

/**
 * AI-powered methodology analysis (0-30 points)
 */
async function analyzeMethodologyWithAI(
  source: SourceMetadata,
  researchQuestion?: string
): Promise<number> {
  try {
    const analysisText = (source.abstract || '') + (source.title || '');

    // Detect study type
    const studyType = detectStudyType(analysisText);
    let baseScore = STUDY_TYPE_SCORES[studyType] || 15;

    // AI analysis prompt
    const prompt = `Analyze this research paper for methodological quality. Rate from 0-30 points based on:

Study: "${source.title}"
Abstract: "${source.abstract || 'Not available'}"
Journal: "${source.journal}"
Year: ${source.year}

Evaluate:
1. Study design appropriateness
2. Statistical rigor (mention of p-values, confidence intervals, controls)
3. Potential biases and limitations
4. Reproducibility (method detail)
5. Sample representativeness

Provide a score (0-30) and brief reasoning focusing on methodology strength.`;

    // Call AI for analysis
    const aiResponse = await callMethodologyAnalysisAI(prompt);

    // Extract score from AI response
    const aiScore = extractScoreFromAIResponse(aiResponse);

    // Combine base score with AI assessment (weighted average)
    const finalScore = Math.round((baseScore * 0.6) + (aiScore * 0.4));

    return Math.min(30, Math.max(0, finalScore));

  } catch (error) {
    console.warn('AI methodology analysis failed, using fallback:', error);
    // Fallback to rule-based scoring
    return detectStudyType((source.abstract || '') + (source.title || ''))
      ? STUDY_TYPE_SCORES[detectStudyType((source.abstract || '') + (source.title || ''))] || 15
      : 15;
  }
}

/**
 * Detect study type from text
 */
function detectStudyType(text: string): string {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('meta-analysis') || lowerText.includes('systematic review')) {
    return 'Meta-analysis/Systematic Review';
  }
  if (lowerText.includes('randomized') && (lowerText.includes('controlled') || lowerText.includes('trial'))) {
    return 'Randomized Controlled Trial';
  }
  if (lowerText.includes('cohort') || lowerText.includes('longitudinal')) {
    return 'Cohort Study';
  }
  if (lowerText.includes('case-control')) {
    return 'Case-Control Study';
  }
  if (lowerText.includes('cross-sectional')) {
    return 'Cross-sectional Study';
  }
  if (lowerText.includes('case study') || lowerText.includes('case report')) {
    return 'Case Study';
  }
  if (lowerText.includes('survey') || lowerText.includes('questionnaire')) {
    return 'Survey Study';
  }
  if (lowerText.includes('experimental') || lowerText.includes('experiment')) {
    return 'Experimental Study';
  }
  if (lowerText.includes('qualitative') || lowerText.includes('interview') || lowerText.includes('focus group')) {
    return 'Qualitative Study';
  }
  if (lowerText.includes('review') && !lowerText.includes('systematic')) {
    return 'Review Article';
  }

  return 'Research Study';
}

/**
 * Call AI for methodology analysis
 */
async function callMethodologyAnalysisAI(prompt: string): Promise<string> {
  try {
    const response = await fetch('/api/ai/enhanced-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a research methodology expert. Analyze papers for methodological quality and provide numerical scores with reasoning.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        projectContext: {
          analysisType: 'methodology_assessment',
          requiresScore: true
        }
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.message?.content || '';
    }

    throw new Error('AI analysis request failed');
  } catch (error) {
    console.warn('AI methodology analysis failed:', error);
    return '';
  }
}

/**
 * Extract numerical score from AI response
 */
function extractScoreFromAIResponse(response: string): number {
  // Look for score patterns
  const patterns = [
    /score[:\s]+(\d+)/i,
    /(\d+)[\/\s]*(?:out of\s+)?30/i,
    /rating[:\s]+(\d+)/i,
    /(\d+)\s*points?/i
  ];

  for (const pattern of patterns) {
    const match = response.match(pattern);
    if (match) {
      const score = parseInt(match[1]);
      if (score >= 0 && score <= 30) {
        return score;
      }
    }
  }

  // Fallback: look for general quality indicators
  const lowQualityTerms = ['weak', 'poor', 'limited', 'insufficient', 'problematic'];
  const highQualityTerms = ['strong', 'robust', 'comprehensive', 'rigorous', 'excellent'];

  const lowerResponse = response.toLowerCase();
  const lowCount = lowQualityTerms.filter(term => lowerResponse.includes(term)).length;
  const highCount = highQualityTerms.filter(term => lowerResponse.includes(term)).length;

  if (highCount > lowCount) return 22; // Good quality
  if (lowCount > highCount) return 12; // Poor quality
  return 17; // Average quality
}

/**
 * Generate comprehensive credibility assessment
 */
async function generateCredibilityAssessment(
  source: SourceMetadata,
  metrics: CredibilityMetrics,
  researchQuestion?: string
): Promise<CredibilityAssessment> {
  const { totalScore } = metrics;

  // Determine credibility level
  let level: 'High' | 'Moderate' | 'Low';
  if (totalScore >= 80) level = 'High';
  else if (totalScore >= 60) level = 'Moderate';
  else level = 'Low';

  // Generate strengths and limitations
  const strengths: string[] = [];
  const limitations: string[] = [];

  // Journal quality assessment
  if (metrics.journalQuality >= 20) {
    strengths.push('Published in a reputable, peer-reviewed journal');
  } else if (metrics.journalQuality >= 10) {
    strengths.push('Published in an academic journal with peer review');
  } else {
    limitations.push('Published in a journal with unknown or limited reputation');
  }

  // Recency assessment
  const age = new Date().getFullYear() - source.year;
  if (metrics.recency >= 16) {
    strengths.push('Recent research with up-to-date findings');
  } else if (age > 10) {
    limitations.push(`Older study (${age} years) - findings may be outdated`);
  }

  // Sample size assessment
  if (metrics.sampleSize >= 16) {
    strengths.push('Large sample size increases reliability of results');
  } else if (metrics.sampleSize <= 8) {
    limitations.push('Small sample size means results might not apply to larger groups');
  }

  // Methodology assessment
  const studyType = detectStudyType((source.abstract || '') + source.title);
  if (metrics.methodology >= 25) {
    strengths.push(`Strong research design (${studyType}) with rigorous methodology`);
  } else if (metrics.methodology >= 15) {
    strengths.push(`Appropriate research design (${studyType}) for the research question`);
  } else {
    limitations.push('Research method has limitations that may affect result reliability');
  }

  // Additional assessments based on content
  if (source.abstract) {
    if (source.abstract.toLowerCase().includes('randomized')) {
      strengths.push('Uses randomization to reduce bias');
    }
    if (source.abstract.toLowerCase().includes('control') || source.abstract.toLowerCase().includes('comparison')) {
      strengths.push('Includes control group for comparison');
    }
    if (source.abstract.toLowerCase().includes('double-blind') || source.abstract.toLowerCase().includes('blinded')) {
      strengths.push('Uses blinding to prevent researcher bias');
    }
  }

  // Generate novice-friendly explanation
  const explanation = generateNoviceFriendlyExplanation(level, totalScore, source, studyType);

  return {
    level,
    score: totalScore,
    strengths,
    limitations,
    explanation,
    impactFactor: JOURNAL_IMPACT_FACTORS[source.journal.toLowerCase()],
    publicationYear: source.year,
    studyType,
    researchField: detectResearchField(source),
    metrics
  };
}

/**
 * Generate novice-friendly explanation
 */
function generateNoviceFriendlyExplanation(
  level: 'High' | 'Moderate' | 'Low',
  score: number,
  source: SourceMetadata,
  studyType: string
): string {
  const age = new Date().getFullYear() - source.year;

  let explanation = '';

  switch (level) {
    case 'High':
      explanation = `This is a highly credible source (${score}/100). It's published in a reputable journal and uses strong research methods. `;
      explanation += `The study type (${studyType}) is well-suited for answering research questions reliably. `;
      if (age <= 5) {
        explanation += 'The research is recent, so the findings are current and relevant. ';
      }
      explanation += 'You can trust these findings and use them confidently in your research.';
      break;

    case 'Moderate':
      explanation = `This source has moderate credibility (${score}/100). While it comes from an academic source, `;
      explanation += `there are some factors to consider. The research method (${studyType}) is appropriate but may have limitations. `;
      if (age > 10) {
        explanation += `The study is ${age} years old, so some findings might be less relevant today. `;
      }
      explanation += 'The results are useful but should be considered alongside other sources for a complete picture.';
      break;

    case 'Low':
      explanation = `This source has lower credibility (${score}/100) and should be used with caution. `;
      if (source.journal.toLowerCase().includes('unknown') || score < 40) {
        explanation += 'The publication source is unclear or not well-established. ';
      }
      explanation += `The research method (${studyType}) may have significant limitations that affect how reliable the results are. `;
      if (age > 15) {
        explanation += `The study is quite old (${age} years), which may limit its relevance. `;
      }
      explanation += 'While this source may provide some insights, look for additional, higher-quality sources to support your research.';
      break;
  }

  return explanation;
}

/**
 * Detect research field from source metadata
 */
function detectResearchField(source: SourceMetadata): string {
  const text = (source.title + ' ' + source.journal + ' ' + (source.abstract || '')).toLowerCase();

  // Medical/Health
  if (text.includes('medical') || text.includes('health') || text.includes('clinical') ||
      text.includes('patient') || text.includes('medicine') || text.includes('therapy')) {
    return 'Medicine/Health';
  }

  // Psychology
  if (text.includes('psychology') || text.includes('psychological') || text.includes('behavior') ||
      text.includes('cognitive') || text.includes('mental')) {
    return 'Psychology';
  }

  // Education
  if (text.includes('education') || text.includes('learning') || text.includes('teaching') ||
      text.includes('student') || text.includes('academic') || text.includes('school')) {
    return 'Education';
  }

  // Technology/Computer Science
  if (text.includes('computer') || text.includes('software') || text.includes('algorithm') ||
      text.includes('technology') || text.includes('digital') || text.includes('ai')) {
    return 'Technology/Computer Science';
  }

  // Biology/Life Sciences
  if (text.includes('biology') || text.includes('genetic') || text.includes('molecular') ||
      text.includes('cell') || text.includes('organism') || text.includes('evolution')) {
    return 'Biology/Life Sciences';
  }

  return 'General';
}

/**
 * Cache assessment in Supabase
 */
async function cacheAssessment(source: SourceMetadata, assessment: CredibilityAssessment): Promise<void> {
  try {
    const cacheKey = generateSourceHash(source);

    await supabase
      .from('credibility_assessments')
      .upsert({
        source_hash: cacheKey,
        title: source.title,
        journal: source.journal,
        year: source.year,
        assessment_data: assessment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
  } catch (error) {
    console.warn('Failed to cache credibility assessment:', error);
  }
}

/**
 * Get cached assessment from Supabase
 */
async function getCachedAssessment(source: SourceMetadata): Promise<CredibilityAssessment | null> {
  try {
    const cacheKey = generateSourceHash(source);

    const { data, error } = await supabase
      .from('credibility_assessments')
      .select('assessment_data')
      .eq('source_hash', cacheKey)
      .single();

    if (error || !data) return null;

    return data.assessment_data as CredibilityAssessment;
  } catch (error) {
    console.warn('Failed to retrieve cached assessment:', error);
    return null;
  }
}

/**
 * Generate unique hash for source
 */
function generateSourceHash(source: SourceMetadata): string {
  const hashInput = `${source.title}-${source.journal}-${source.year}-${source.authors.join(',')}`;
  return btoa(hashInput).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
}

/**
 * Generate fallback assessment when main analysis fails
 */
function generateFallbackAssessment(source: SourceMetadata): CredibilityAssessment {
  const currentYear = new Date().getFullYear();
  const age = currentYear - source.year;

  let score = 50; // Start with moderate score
  let level: 'High' | 'Moderate' | 'Low' = 'Moderate';

  const strengths = ['Academic publication'];
  const limitations = ['Detailed assessment unavailable'];

  // Adjust based on available information
  if (source.journal.toLowerCase().includes('nature') || source.journal.toLowerCase().includes('science')) {
    score += 20;
    strengths.push('Published in prestigious journal');
  }

  if (age <= 5) {
    score += 10;
    strengths.push('Recent publication');
  } else if (age > 15) {
    score -= 15;
    limitations.push('Older publication');
  }

  if (score >= 80) level = 'High';
  else if (score < 50) level = 'Low';

  return {
    level,
    score: Math.max(20, Math.min(90, score)),
    strengths,
    limitations,
    explanation: `This source has ${level.toLowerCase()} credibility based on available information. A more detailed assessment requires additional analysis of the research methodology and content.`,
    publicationYear: source.year,
    studyType: detectStudyType((source.abstract || '') + source.title),
    researchField: detectResearchField(source),
    metrics: {
      journalQuality: Math.min(30, score * 0.3),
      recency: Math.min(20, age <= 5 ? 20 : 10),
      sampleSize: 10,
      methodology: Math.min(30, score * 0.3),
      totalScore: score
    }
  };
}

/**
 * Quick credibility check for batch processing
 */
export async function quickCredibilityCheck(sources: SourceMetadata[]): Promise<Map<string, CredibilityAssessment>> {
  const results = new Map<string, CredibilityAssessment>();

  // Process sources in parallel
  const assessmentPromises = sources.map(async (source) => {
    try {
      const assessment = await assessSourceCredibility(source);
      return { source, assessment };
    } catch (error) {
      console.warn(`Failed to assess ${source.title}:`, error);
      return { source, assessment: generateFallbackAssessment(source) };
    }
  });

  const assessments = await Promise.all(assessmentPromises);

  assessments.forEach(({ source, assessment }) => {
    results.set(source.title, assessment);
  });

  return results;
}

/**
 * Export for testing and external use
 */
export {
  calculateJournalQuality,
  calculateRecencyScore,
  detectStudyType,
  generateNoviceFriendlyExplanation
};