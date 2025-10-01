/**
 * Credibility Assessment Service
 *
 * AI-powered credibility assessment for research sources using advanced
 * methodology analysis and novice-friendly explanations
 *
 * Location: src/lib/services/credibilityAssessment.ts
 */

import { CredibilityAssessment, SourceData } from '@/components/literature/SourceCard';
import { assessSourceCredibility, SourceMetadata } from '../research/credibilityChecker';

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
 * Generate comprehensive AI-powered credibility assessment for a research source
 */
export async function generateCredibilityAssessment(
  source: Partial<SourceData>,
  researchQuestion: string
): Promise<CredibilityAssessment> {
  try {
    // Convert SourceData to SourceMetadata format for the new AI checker
    const sourceMetadata: SourceMetadata = {
      title: source.title || 'Unknown Title',
      authors: source.authors || ['Unknown Author'],
      journal: source.journal || 'Unknown Journal',
      year: source.year || new Date().getFullYear(),
      doi: source.doi,
      abstract: source.abstract,
      url: source.fullTextUrl
    };

    // Use the new AI-powered credibility checker
    const comprehensiveAssessment = await assessSourceCredibility(sourceMetadata, researchQuestion);

    return comprehensiveAssessment;
  } catch (error) {
    console.error('Error in comprehensive credibility assessment:', error);

    // Fallback to basic assessment
    const basicAssessment = assessBasicCredibility({
      impactFactor: source.credibility?.impactFactor,
      sampleSize: source.credibility?.sampleSize,
      publicationYear: source.year || new Date().getFullYear(),
      studyType: source.credibility?.studyType,
      journal: source.journal || '',
      peerReviewed: true
    });

    // Generate simple explanation for fallback
    const fallbackExplanation = `This source has ${basicAssessment.level.toLowerCase()} credibility based on basic assessment. For a more detailed analysis, please try again.`;

    return {
      level: basicAssessment.level,
      score: basicAssessment.score,
      strengths: basicAssessment.strengths,
      limitations: basicAssessment.limitations,
      explanation: fallbackExplanation,
      impactFactor: source.credibility?.impactFactor,
      sampleSize: source.credibility?.sampleSize,
      publicationYear: source.year || new Date().getFullYear(),
      studyType: source.credibility?.studyType
    };
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
 * @param researchField - The research field to generate topic-appropriate demo sources
 */
export function createSampleSources(researchField?: string): SourceData[] {
  // Determine topic based on research field
  const field = researchField?.toLowerCase() || '';

  // Generate topic-specific sources based on research field
  if (field.includes('chemistry') || field.includes('chemical')) {
    return createChemistrySources();
  } else if (field.includes('biology') || field.includes('life sciences')) {
    return createBiologySources();
  } else if (field.includes('psychology') || field.includes('cognitive')) {
    return createPsychologySources();
  }

  // Default: Return antibiotic resistance sources (original demo sources)
  return createAntibioticResistanceSources();
}

/**
 * Create chemistry-specific demo sources
 */
function createChemistrySources(): SourceData[] {
  return [
    {
      id: 'source-1',
      title: 'Buffer Capacity and pH Stability in Biological Systems Under Temperature Variation',
      authors: ['Chen, L.', 'Rodriguez, M.', 'Williams, P.J.'],
      journal: 'Journal of the American Chemical Society',
      year: 2024,
      doi: '10.1021/jacs.2024.12345',
      abstract: 'This comprehensive study examines how different buffer compositions maintain pH stability under varying temperature conditions, with applications to biological research and industrial processes.',
      keyFindings: [
        'Phosphate buffers show superior stability at physiological temperatures',
        'HEPES maintains pH more effectively than Tris above 30°C',
        'Buffer capacity decreases linearly with temperature increase'
      ],
      relevanceExplanation: 'This study directly addresses buffer performance under thermal stress, providing quantitative data on pH stability mechanisms.',
      fullTextUrl: 'https://example.com/jacs-2024',
      credibility: {
        level: 'High',
        score: 94,
        strengths: [
          'Published in top-tier chemistry journal (JACS)',
          'Very recent publication (2024)',
          'Comprehensive experimental design with multiple buffer systems',
          'Rigorous statistical analysis'
        ],
        limitations: [
          'Limited to aqueous solutions at standard pressure',
          'Does not examine extreme pH ranges'
        ],
        explanation: 'This is a high-quality source because it\'s published in JACS, one of the most prestigious chemistry journals. The research is current (2024) and uses rigorous experimental methods. The findings are highly reliable and directly applicable to buffer chemistry research.',
        impactFactor: 16.4,
        sampleSize: 150,
        publicationYear: 2024,
        studyType: 'Experimental study'
      },
      isSaved: false
    },
    {
      id: 'source-2',
      title: 'Thermodynamic Properties of Common Laboratory Buffer Solutions',
      authors: ['Martinez, S.A.', 'Kim, H.J.'],
      journal: 'Analytical Chemistry',
      year: 2023,
      doi: '10.1021/acs.analchem.2023.0678',
      keyFindings: [
        'Temperature coefficients vary significantly among buffer types',
        'Good\'s buffers outperform traditional buffers in thermal stability',
        'Ionic strength affects buffer performance more than previously thought'
      ],
      relevanceExplanation: 'This source provides thermodynamic data essential for understanding buffer behavior under varying conditions.',
      fullTextUrl: 'https://example.com/anal-chem-2023',
      credibility: {
        level: 'Moderate',
        score: 76,
        strengths: [
          'Peer-reviewed in respected chemistry journal',
          'Recent publication (2023)',
          'Good experimental controls'
        ],
        limitations: [
          'Moderate impact journal (IF: 6.8)',
          'Limited to standard laboratory conditions',
          'Smaller dataset than comprehensive studies'
        ],
        explanation: 'This source has moderate credibility because it\'s published in a respected chemistry journal and uses sound methodology. However, it has a narrower scope than top-tier studies. It\'s excellent as supporting evidence but should be paired with higher-impact sources.',
        impactFactor: 6.8,
        sampleSize: 45,
        publicationYear: 2023,
        studyType: 'Comparative analysis'
      },
      isSaved: true
    },
    {
      id: 'source-3',
      title: 'pH Maintenance in Cell Culture Media: A Practical Guide',
      authors: ['Thompson, R.K.'],
      journal: 'Lab Techniques Quarterly',
      year: 2021,
      doi: '10.5432/ltq.2021.0234',
      keyFindings: [
        'HEPES preferred over bicarbonate for CO2-independent systems',
        'Buffer concentration affects cell viability',
        'Temperature control more critical than buffer choice'
      ],
      relevanceExplanation: 'While this practical guide provides useful context, it lacks the rigorous experimental validation of primary research articles.',
      credibility: {
        level: 'Low',
        score: 52,
        strengths: [
          'Practical applications well-explained',
          'Accessible writing style'
        ],
        limitations: [
          'Review article rather than original research',
          'Older publication (2021)',
          'Lower-tier journal (IF: 1.8)',
          'Single author - no peer collaboration',
          'Limited experimental data'
        ],
        explanation: 'This source has lower credibility because it\'s a practical guide rather than rigorous research. Published in 2021 in a lower-impact journal, it summarizes existing knowledge but doesn\'t contribute new experimental data. Use it for background understanding, but rely on primary research for your main arguments.',
        impactFactor: 1.8,
        sampleSize: undefined,
        publicationYear: 2021,
        studyType: 'Review article'
      },
      isSaved: false
    }
  ];
}

/**
 * Create biology-specific demo sources
 */
function createBiologySources(): SourceData[] {
  return [
    {
      id: 'source-1',
      title: 'Oxidative Stress Responses in Bacterial Species: Growth and Survival Mechanisms',
      authors: ['Johnson, M.E.', 'Chen, Y.', 'Williams, A.R.'],
      journal: 'Nature Microbiology',
      year: 2024,
      doi: '10.1038/s41564-024-01567-8',
      abstract: 'This study examines how different bacterial species respond to oxidative stress through various antioxidant mechanisms and growth adaptations.',
      keyFindings: [
        'E. coli shows rapid catalase induction under H2O2 exposure',
        'Gram-positive bacteria exhibit greater oxidative stress tolerance',
        'Growth rate recovery correlates with antioxidant enzyme expression'
      ],
      relevanceExplanation: 'This study directly addresses bacterial responses to oxidative stress, providing mechanistic insights into survival strategies.',
      fullTextUrl: 'https://example.com/nature-micro-2024',
      credibility: {
        level: 'High',
        score: 95,
        strengths: [
          'Published in top-tier journal (Nature Microbiology)',
          'Very recent publication (2024)',
          'Large-scale comparative study (15 bacterial species)',
          'Comprehensive molecular analysis'
        ],
        limitations: [
          'Laboratory conditions may not reflect natural environments',
          'Limited to aerobic bacteria'
        ],
        explanation: 'This is a high-quality source because it\'s published in Nature Microbiology, one of the most prestigious microbiology journals. The research is current (2024) and examines multiple bacterial species with rigorous methods. The findings are highly reliable and directly applicable to your research.',
        impactFactor: 17.7,
        sampleSize: 15,
        publicationYear: 2024,
        studyType: 'Comparative experimental study'
      },
      isSaved: false
    },
    {
      id: 'source-2',
      title: 'Bacterial Growth Kinetics Under Environmental Stressors',
      authors: ['Garcia, R.S.', 'Patel, N.K.'],
      journal: 'Microbiology Research',
      year: 2023,
      doi: '10.1099/mic.2023.004321',
      keyFindings: [
        'Temperature and pH interact with oxidative stress effects',
        'Growth rate reductions range from 30-70% depending on species',
        'Stress adaptation occurs within 2-3 generations'
      ],
      relevanceExplanation: 'This source provides quantitative data on growth rate changes under stress, useful for comparative analysis.',
      fullTextUrl: 'https://example.com/microbiology-research-2023',
      credibility: {
        level: 'Moderate',
        score: 73,
        strengths: [
          'Peer-reviewed publication',
          'Recent research (2023)',
          'Good experimental controls',
          'Multiple environmental factors tested'
        ],
        limitations: [
          'Moderate impact journal (IF: 3.5)',
          'Limited to 6 bacterial species',
          'Short-term study (48 hours)'
        ],
        explanation: 'This source has moderate credibility with sound methodology and recent publication. However, it\'s in a moderate-impact journal and has a smaller scope than comprehensive studies. Use it as supporting evidence alongside higher-impact sources.',
        impactFactor: 3.5,
        sampleSize: 6,
        publicationYear: 2023,
        studyType: 'Experimental study'
      },
      isSaved: true
    },
    {
      id: 'source-3',
      title: 'Bacterial Antioxidant Systems: A Case Study in E. coli',
      authors: ['Anderson, T.L.'],
      journal: 'Case Studies in Microbiology',
      year: 2021,
      doi: '10.5678/csm.2021.0892',
      keyFindings: [
        'SodA and SodB enzymes show differential expression patterns',
        'Catalase activity increases 5-fold under oxidative stress',
        'Biofilm formation enhances stress resistance'
      ],
      relevanceExplanation: 'While this case study provides detailed mechanistic insights for E. coli, findings may not generalize to other bacterial species.',
      credibility: {
        level: 'Low',
        score: 48,
        strengths: [
          'Detailed molecular analysis',
          'Clear methodology description'
        ],
        limitations: [
          'Case study design - limited to single species',
          'Older publication (2021)',
          'Lower-tier journal (IF: 1.4)',
          'Single-author study',
          'Small sample size (n=3 strains)'
        ],
        explanation: 'This source has lower credibility because it\'s a case study limited to one bacterial species. Published in 2021 in a lower-impact journal, it provides useful mechanistic details but lacks generalizability. Use it for background information only, not as primary evidence.',
        impactFactor: 1.4,
        sampleSize: 3,
        publicationYear: 2021,
        studyType: 'Case study'
      },
      isSaved: false
    }
  ];
}

/**
 * Create psychology-specific demo sources
 */
function createPsychologySources(): SourceData[] {
  return [
    {
      id: 'source-1',
      title: 'Sleep Deprivation Effects on Memory Consolidation in College Students',
      authors: ['Martinez, A.C.', 'Wong, S.Y.', 'Brown, K.L.'],
      journal: 'Nature Neuroscience',
      year: 2024,
      doi: '10.1038/s41593-024-01789-3',
      abstract: 'This longitudinal study examines how sleep patterns affect memory consolidation and academic performance in undergraduate students.',
      keyFindings: [
        'Sleep deprivation (<6 hours) reduces memory consolidation by 40%',
        'REM sleep shows strongest correlation with declarative memory',
        'Weekend sleep recovery does not fully compensate for weekday deficits'
      ],
      relevanceExplanation: 'This study directly addresses sleep-memory relationships in the college student population, providing strong evidence for sleep\'s role in learning.',
      fullTextUrl: 'https://example.com/nature-neuro-2024',
      credibility: {
        level: 'High',
        score: 93,
        strengths: [
          'Published in top-tier journal (Nature Neuroscience)',
          'Very recent publication (2024)',
          'Large sample size (n=450 students)',
          'Longitudinal design (6 months)'
        ],
        limitations: [
          'Limited to undergraduate students (generalizability)',
          'Self-reported sleep data may have bias'
        ],
        explanation: 'This is a high-quality source because it\'s published in Nature Neuroscience, one of the most respected journals in cognitive science. The study uses a large sample and longitudinal design, making the findings highly reliable for research on sleep and memory.',
        impactFactor: 25.8,
        sampleSize: 450,
        publicationYear: 2024,
        studyType: 'Longitudinal study'
      },
      isSaved: false
    },
    {
      id: 'source-2',
      title: 'Cognitive Performance and Sleep Quality in University Students',
      authors: ['Lee, J.H.', 'Thompson, R.M.'],
      journal: 'Journal of Cognitive Psychology',
      year: 2023,
      doi: '10.1080/20445911.2023.2234567',
      keyFindings: [
        'Sleep quality predicts GPA more strongly than sleep duration',
        'Napping improves short-term memory performance',
        'Chronotype affects optimal study timing'
      ],
      relevanceExplanation: 'This source provides evidence linking sleep quality to academic outcomes, supporting the importance of sleep for student success.',
      fullTextUrl: 'https://example.com/jcognpsy-2023',
      credibility: {
        level: 'Moderate',
        score: 74,
        strengths: [
          'Peer-reviewed publication',
          'Recent research (2023)',
          'Good sample size (n=280)',
          'Multiple cognitive measures used'
        ],
        limitations: [
          'Moderate impact journal (IF: 2.9)',
          'Cross-sectional design (cannot establish causation)',
          'Limited to one university'
        ],
        explanation: 'This source has moderate credibility with sound methodology and a decent sample size. However, the cross-sectional design limits causal conclusions. Use it as supporting evidence alongside experimental or longitudinal studies.',
        impactFactor: 2.9,
        sampleSize: 280,
        publicationYear: 2023,
        studyType: 'Cross-sectional study'
      },
      isSaved: true
    },
    {
      id: 'source-3',
      title: 'Sleep Patterns in College: A Survey of Student Habits',
      authors: ['Davis, M.K.'],
      journal: 'Student Life Quarterly',
      year: 2020,
      doi: '10.1234/slq.2020.0456',
      keyFindings: [
        'Average sleep duration: 6.2 hours on weeknights',
        'Majority of students report insufficient sleep',
        'Technology use before bed is common'
      ],
      relevanceExplanation: 'While this survey provides descriptive data on sleep habits, it lacks experimental controls and causal analysis.',
      credibility: {
        level: 'Low',
        score: 45,
        strengths: [
          'Large survey sample (n=1200)',
          'Descriptive statistics well-presented'
        ],
        limitations: [
          'Survey methodology - self-report bias',
          'Older publication (2020)',
          'Lower-tier journal (IF: 0.8)',
          'No experimental component or causal analysis',
          'Limited to one institution'
        ],
        explanation: 'This source has lower credibility because it\'s a descriptive survey from 2020 without experimental controls. While it provides useful background on student sleep habits, it cannot establish cause-and-effect relationships. Use it only for context, not as primary evidence.',
        impactFactor: 0.8,
        sampleSize: 1200,
        publicationYear: 2020,
        studyType: 'Survey'
      },
      isSaved: false
    }
  ];
}

/**
 * Create antibiotic resistance demo sources (original default)
 */
function createAntibioticResistanceSources(): SourceData[] {
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