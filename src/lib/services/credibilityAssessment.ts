/**
 * Credibility Assessment Service
 *
 * AI-powered credibility assessment for research sources using GPT-4o-mini
 * Generates plain-language explanations for novice researchers
 *
 * Location: src/lib/services/credibilityAssessment.ts
 */

import { CredibilityAssessment, SourceData } from '@/components/literature/SourceCard';

// Base criteria for credibility assessment
interface AssessmentCriteria {
  impactFactor?: number;
  sampleSize?: number;
  publicationYear: number;
  studyType?: string;
  journal: string;
  peerReviewed?: boolean;
}

/**
 * Generate AI-powered credibility assessment for a research source
 */
export async function generateCredibilityAssessment(
  source: Partial<SourceData>,
  researchQuestion: string
): Promise<CredibilityAssessment> {
  try {
    // First, generate basic assessment based on criteria
    const basicAssessment = assessBasicCredibility({
      impactFactor: source.credibility?.impactFactor,
      sampleSize: source.credibility?.sampleSize,
      publicationYear: source.year || new Date().getFullYear(),
      studyType: source.credibility?.studyType,
      journal: source.journal || '',
      peerReviewed: true // Assume peer-reviewed for now
    });

    // Generate AI-powered plain-language explanation
    const aiExplanation = await generatePlainLanguageExplanation(
      source,
      researchQuestion,
      basicAssessment
    );

    return {
      level: basicAssessment.level,
      score: basicAssessment.score,
      strengths: basicAssessment.strengths,
      limitations: basicAssessment.limitations,
      explanation: aiExplanation,
      impactFactor: source.credibility?.impactFactor,
      sampleSize: source.credibility?.sampleSize,
      publicationYear: source.year || new Date().getFullYear(),
      studyType: source.credibility?.studyType
    };

  } catch (error) {
    console.error('Error generating credibility assessment:', error);

    // Fallback to basic assessment without AI explanation
    return generateFallbackAssessment(source);
  }
}

/**
 * Basic credibility assessment based on quantitative criteria
 */
function assessBasicCredibility(criteria: AssessmentCriteria): {
  level: 'High' | 'Moderate' | 'Low';
  score: number;
  strengths: string[];
  limitations: string[];
} {
  let score = 50; // Base score
  const strengths: string[] = [];
  const limitations: string[] = [];

  // Age assessment
  const currentYear = new Date().getFullYear();
  const age = currentYear - criteria.publicationYear;

  if (age <= 3) {
    score += 20;
    strengths.push('Recent publication (within 3 years)');
  } else if (age <= 7) {
    score += 10;
    strengths.push('Relatively recent research');
  } else if (age <= 15) {
    score -= 5;
    limitations.push('Somewhat dated research (over 7 years old)');
  } else {
    score -= 15;
    limitations.push('Older research (over 15 years old) - findings may be outdated');
  }

  // Impact factor assessment
  if (criteria.impactFactor) {
    if (criteria.impactFactor >= 10) {
      score += 20;
      strengths.push(`Extremely high impact journal (IF: ${criteria.impactFactor.toFixed(1)})`);
    } else if (criteria.impactFactor >= 5) {
      score += 15;
      strengths.push(`High impact journal (IF: ${criteria.impactFactor.toFixed(1)})`);
    } else if (criteria.impactFactor >= 2) {
      score += 10;
      strengths.push(`Moderate impact journal (IF: ${criteria.impactFactor.toFixed(1)})`);
    } else if (criteria.impactFactor >= 1) {
      score += 5;
      strengths.push(`Published in peer-reviewed journal`);
    } else {
      score -= 5;
      limitations.push('Lower impact journal - exercise caution');
    }
  }

  // Sample size assessment
  if (criteria.sampleSize) {
    if (criteria.sampleSize >= 1000) {
      score += 15;
      strengths.push(`Large sample size (n=${criteria.sampleSize}) increases reliability`);
    } else if (criteria.sampleSize >= 100) {
      score += 10;
      strengths.push(`Good sample size (n=${criteria.sampleSize})`);
    } else if (criteria.sampleSize >= 30) {
      score += 5;
      strengths.push(`Adequate sample size (n=${criteria.sampleSize})`);
    } else {
      score -= 10;
      limitations.push(`Small sample size (n=${criteria.sampleSize}) limits generalizability`);
    }
  }

  // Study type assessment
  if (criteria.studyType) {
    const studyType = criteria.studyType.toLowerCase();
    if (studyType.includes('meta-analysis') || studyType.includes('systematic review')) {
      score += 20;
      strengths.push('Meta-analysis or systematic review - highest level of evidence');
    } else if (studyType.includes('randomized') || studyType.includes('controlled trial')) {
      score += 15;
      strengths.push('Randomized controlled trial - strong experimental design');
    } else if (studyType.includes('cohort') || studyType.includes('longitudinal')) {
      score += 10;
      strengths.push('Cohort/longitudinal study - good for tracking changes over time');
    } else if (studyType.includes('cross-sectional')) {
      score += 5;
      limitations.push('Cross-sectional design - cannot establish causation');
    } else if (studyType.includes('case study') || studyType.includes('case report')) {
      score -= 5;
      limitations.push('Case study - limited generalizability');
    }
  }

  // Peer review assessment
  if (criteria.peerReviewed) {
    score += 10;
    strengths.push('Peer-reviewed publication');
  } else {
    score -= 15;
    limitations.push('Not peer-reviewed - findings not independently verified');
  }

  // Normalize score to 0-100 range
  score = Math.max(0, Math.min(100, score));

  // Determine quality level
  let level: 'High' | 'Moderate' | 'Low';
  if (score >= 80) {
    level = 'High';
  } else if (score >= 60) {
    level = 'Moderate';
  } else {
    level = 'Low';
  }

  return { level, score, strengths, limitations };
}

/**
 * Generate plain-language explanation using AI
 */
async function generatePlainLanguageExplanation(
  source: Partial<SourceData>,
  researchQuestion: string,
  basicAssessment: { level: string; strengths: string[]; limitations: string[] }
): Promise<string> {
  try {
    const response = await fetch('/api/ai/search-strategy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Explain this research paper's credibility for a novice researcher in simple language:

Title: ${source.title}
Journal: ${source.journal}
Year: ${source.year}
Research Question Context: ${researchQuestion}

Quality Level: ${basicAssessment.level}
Strengths: ${basicAssessment.strengths.join('; ')}
Limitations: ${basicAssessment.limitations.join('; ')}

Provide a 2-3 sentence explanation that:
1. Uses simple, non-technical language
2. Explains why this source is ${basicAssessment.level.toLowerCase()} quality
3. Helps a student understand if they should trust these findings
4. Avoids academic jargon

Focus on practical implications for student research.`,
        projectId: 'credibility-assessment'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate AI explanation');
    }

    const data = await response.json();

    // Extract explanation from API response
    if (data.success && data.explanation) {
      return data.explanation;
    } else {
      throw new Error('Invalid AI response format');
    }

  } catch (error) {
    console.warn('AI explanation generation failed, using fallback:', error);
    return generateFallbackExplanation(basicAssessment);
  }
}

/**
 * Generate fallback explanation when AI is unavailable
 */
function generateFallbackExplanation(assessment: { level: string; strengths: string[]; limitations: string[] }): string {
  const level = assessment.level.toLowerCase();

  if (level === 'high') {
    return `This source has high credibility because it meets multiple quality standards. You can trust these findings for your research, though always consider multiple sources to build a complete picture.`;
  } else if (level === 'moderate') {
    return `This source has moderate credibility with some good qualities but also some limitations. Use it as supporting evidence in your research, but look for additional high-quality sources to strengthen your arguments.`;
  } else {
    return `This source has lower credibility due to several limitations. While it may contain useful information, be cautious about relying on it heavily. Seek out higher-quality sources to support your main arguments.`;
  }
}

/**
 * Generate fallback assessment when AI processing fails
 */
function generateFallbackAssessment(source: Partial<SourceData>): CredibilityAssessment {
  const currentYear = new Date().getFullYear();
  const year = source.year || currentYear;
  const age = currentYear - year;

  // Simple heuristic-based assessment
  let level: 'High' | 'Moderate' | 'Low' = 'Moderate';
  const strengths: string[] = [];
  const limitations: string[] = [];

  if (age <= 5) {
    strengths.push('Recent publication');
  } else if (age > 10) {
    limitations.push('Older research findings');
    level = 'Low';
  }

  if (source.journal && source.journal.toLowerCase().includes('nature') ||
      source.journal && source.journal.toLowerCase().includes('science')) {
    strengths.push('Published in high-impact journal');
    level = 'High';
  }

  return {
    level,
    score: level === 'High' ? 85 : level === 'Moderate' ? 70 : 50,
    strengths: strengths.length > 0 ? strengths : ['Peer-reviewed publication'],
    limitations: limitations.length > 0 ? limitations : ['Standard research limitations apply'],
    explanation: generateFallbackExplanation({ level, strengths, limitations }),
    publicationYear: year
  };
}

/**
 * Create sample source data for testing
 */
export function createSampleSources(): SourceData[] {
  return [
    {
      id: 'source-1',
      title: 'The Role of Antibiotic Resistance Genes in Environmental Bacteria',
      authors: ['Smith, J.A.', 'Johnson, K.L.', 'Brown, M.P.'],
      journal: 'Nature Microbiology',
      year: 2023,
      doi: '10.1038/s41564-023-01234-5',
      abstract: 'This comprehensive study examines the prevalence and transfer mechanisms of antibiotic resistance genes in environmental bacterial populations, providing new insights into the global spread of antimicrobial resistance.',
      keyFindings: [
        'Environmental bacteria serve as significant reservoirs for resistance genes',
        'Horizontal gene transfer occurs more frequently in polluted environments',
        'Climate change may accelerate resistance gene spread'
      ],
      relevanceExplanation: 'This study directly addresses how bacterial resistance develops in natural environments, which is fundamental to understanding the broader resistance crisis affecting medical treatments.',
      fullTextUrl: 'https://example.com/nature-microbiology-2023',
      credibility: {
        level: 'High',
        score: 92,
        strengths: [
          'Published in top-tier journal (Nature Microbiology)',
          'Recent publication (2023)',
          'Large sample size (n=2,500 bacterial isolates)',
          'Comprehensive methodology with controls'
        ],
        limitations: [
          'Limited to specific geographic regions',
          'Short-term study period (6 months)'
        ],
        explanation: 'This is a high-quality source because it\'s published in Nature Microbiology, one of the most respected journals in the field. The research is very recent (2023) and uses a large sample size, making the findings reliable. While the study is limited to certain regions, the methodology is solid and the results are trustworthy for your research.',
        impactFactor: 15.2,
        sampleSize: 2500,
        publicationYear: 2023,
        studyType: 'Cross-sectional study'
      },
      isSaved: false
    },
    {
      id: 'source-2',
      title: 'Antibiotic Prescribing Patterns in Primary Care: A 10-Year Analysis',
      authors: ['Wilson, R.T.', 'Davis, L.M.'],
      journal: 'Journal of Primary Care Medicine',
      year: 2022,
      doi: '10.1234/jpcm.2022.0456',
      keyFindings: [
        'Overprescribing of broad-spectrum antibiotics increased by 15%',
        'Pediatric prescriptions show concerning trends',
        'Regional variations in prescribing practices identified'
      ],
      relevanceExplanation: 'This source helps understand how medical prescribing practices contribute to resistance development, showing the human behavior side of the resistance problem.',
      fullTextUrl: 'https://example.com/jpcm-2022',
      credibility: {
        level: 'Moderate',
        score: 72,
        strengths: [
          'Long-term data analysis (10 years)',
          'Large dataset (50,000+ prescriptions)',
          'Peer-reviewed publication'
        ],
        limitations: [
          'Lower impact journal',
          'Limited to one healthcare system',
          'No intervention or experimental component'
        ],
        explanation: 'This source has moderate credibility because it analyzes data over a long period (10 years) and includes many prescriptions, which makes the patterns reliable. However, it\'s published in a lower-impact journal and only looks at one healthcare system, so the findings might not apply everywhere. It\'s useful supporting evidence but pair it with higher-quality sources.',
        impactFactor: 2.8,
        sampleSize: 50000,
        publicationYear: 2022,
        studyType: 'Retrospective analysis'
      },
      isSaved: true
    },
    {
      id: 'source-3',
      title: 'Bacterial Resistance Mechanisms: A Case Study Approach',
      authors: ['Thompson, A.K.'],
      journal: 'Case Studies in Microbiology',
      year: 2019,
      doi: '10.5678/csm.2019.0789',
      keyFindings: [
        'Three distinct resistance mechanisms identified',
        'Rapid development observed in laboratory conditions',
        'Potential for new therapeutic targets discovered'
      ],
      relevanceExplanation: 'While this case study provides detailed insights into specific resistance mechanisms, it represents a limited scope that may not generalize to broader bacterial populations.',
      credibility: {
        level: 'Low',
        score: 45,
        strengths: [
          'Detailed mechanistic analysis',
          'Well-documented methodology'
        ],
        limitations: [
          'Case study design - limited generalizability',
          'Older publication (2019)',
          'Small sample size (n=3 bacterial strains)',
          'Lower-tier journal',
          'Single-author study'
        ],
        explanation: 'This source has lower credibility because it\'s a case study with only 3 bacterial strains, which means the findings might not apply to other bacteria. It\'s also from 2019, so some information might be outdated. While the analysis is detailed, case studies are the weakest type of evidence. Use this only as background information and find stronger sources for your main arguments.',
        impactFactor: 1.2,
        sampleSize: 3,
        publicationYear: 2019,
        studyType: 'Case study'
      },
      isSaved: false
    }
  ];
}