/**
 * Test Gap Analysis Engine
 *
 * Test script to verify the AI-powered gap analysis functionality
 * with sample source collections.
 */

import { performGapAnalysis } from './gapAnalysis';
import { SourceData } from '@/components/literature/SourceCard';

// Sample sources for testing gap analysis
const SAMPLE_SOURCES: SourceData[] = [
  {
    id: 'test-source-1',
    title: 'The Impact of Sleep Deprivation on Academic Performance in College Students',
    authors: ['Smith, J.A.', 'Johnson, K.L.', 'Brown, M.P.'],
    journal: 'Journal of Educational Psychology',
    year: 2023,
    doi: '10.1037/edu0000123',
    abstract: 'This study examines the relationship between sleep duration and academic performance in 500 college students aged 18-22. Results show significant negative correlation between sleep deprivation and GPA. Students sleeping less than 6 hours showed 15% lower academic performance.',
    keyFindings: [
      'Sleep deprivation significantly reduces academic performance',
      'Students sleeping <6 hours had 15% lower GPA',
      'Effect most pronounced in STEM courses'
    ],
    relevanceExplanation: 'Directly addresses the relationship between sleep and academic outcomes in the target demographic',
    fullTextUrl: 'https://example.com/sleep-study-2023',
    credibility: {
      level: 'High',
      score: 88,
      strengths: ['Large sample size (n=500)', 'Recent publication', 'Peer-reviewed journal'],
      limitations: ['Single institution study', 'Cross-sectional design'],
      explanation: 'High-quality study with strong methodology and significant findings',
      publicationYear: 2023
    },
    isSaved: false
  },
  {
    id: 'test-source-2',
    title: 'Factors Affecting Sleep Quality in University Students: A Systematic Review',
    authors: ['Wilson, R.T.', 'Davis, L.M.', 'Anderson, P.K.'],
    journal: 'Sleep Medicine Reviews',
    year: 2022,
    doi: '10.1016/j.smrv.2022.101234',
    abstract: 'Systematic review of 45 studies examining factors that influence sleep quality in university students. Key factors include academic stress, technology use, caffeine consumption, and dormitory environment. Meta-analysis reveals consistent patterns across cultures.',
    keyFindings: [
      'Academic stress is primary factor affecting sleep quality',
      'Screen time before bed reduces sleep quality by 23%',
      'Dormitory noise levels significantly impact sleep'
    ],
    relevanceExplanation: 'Comprehensive overview of factors affecting sleep in university students',
    fullTextUrl: 'https://example.com/sleep-review-2022',
    credibility: {
      level: 'High',
      score: 92,
      strengths: ['Systematic review methodology', 'Large sample across multiple studies', 'High-impact journal'],
      limitations: ['Heterogeneity in measurement methods', 'Publication bias possible'],
      explanation: 'Excellent systematic review providing comprehensive evidence',
      publicationYear: 2022
    },
    isSaved: true
  },
  {
    id: 'test-source-3',
    title: 'Sleep Patterns and Cognitive Function in Graduate Students',
    authors: ['Thompson, A.K.', 'Lee, S.Y.'],
    journal: 'Cognitive Science Research',
    year: 2021,
    doi: '10.1016/j.cogres.2021.567',
    abstract: 'Study of 150 graduate students examining relationship between sleep patterns and cognitive performance. Includes memory tests, attention tasks, and problem-solving assessments. Sleep tracking via actigraphy for 30 days.',
    keyFindings: [
      'Irregular sleep schedules impair cognitive flexibility',
      'Memory consolidation strongest with 7-8 hours sleep',
      'Attention deficits appear after 5 consecutive days of <6 hours sleep'
    ],
    relevanceExplanation: 'Focus on cognitive aspects of sleep deprivation in academic context',
    credibility: {
      level: 'Moderate',
      score: 76,
      strengths: ['Objective sleep measurement', 'Cognitive testing battery', 'Longitudinal design'],
      limitations: ['Smaller sample size (n=150)', 'Graduate students only', 'Single institution'],
      explanation: 'Solid methodology but limited generalizability due to sample constraints',
      publicationYear: 2021
    },
    isSaved: false
  },
  {
    id: 'test-source-4',
    title: 'Cultural Differences in Sleep Habits Among International Students',
    authors: ['Zhang, L.', 'Rodriguez, M.', 'Patel, N.'],
    journal: 'Cross-Cultural Psychology Journal',
    year: 2023,
    doi: '10.1177/cross2023456',
    abstract: 'Cross-cultural study of sleep habits in 800 international students from 12 countries. Examines how cultural background influences sleep patterns, bedtime routines, and adaptation to new academic environments.',
    keyFindings: [
      'Significant cultural variations in optimal sleep duration',
      'Asian students report more sleep difficulties during transition',
      'Social sleep norms vary dramatically across cultures'
    ],
    relevanceExplanation: 'Adds important cultural dimension to sleep research in student populations',
    credibility: {
      level: 'High',
      score: 85,
      strengths: ['Large multicultural sample', 'Recent publication', 'Novel cultural perspective'],
      limitations: ['Self-reported sleep data', 'Adjustment period focus only'],
      explanation: 'Important contribution to understanding cultural factors in student sleep',
      publicationYear: 2023
    },
    isSaved: false
  }
];

/**
 * Test the gap analysis engine with sample sources
 */
export async function testGapAnalysis(): Promise<void> {
  console.log('🧪 Testing Gap Analysis Engine\n');

  const researchQuestion = "How does sleep deprivation affect academic performance in university students?";
  const projectId = 'test-project-gap-analysis';

  console.log(`📋 Research Question: ${researchQuestion}`);
  console.log(`📊 Testing with ${SAMPLE_SOURCES.length} sample sources\n`);

  try {
    console.log('🔄 Running gap analysis...');
    const startTime = Date.now();

    const result = await performGapAnalysis(SAMPLE_SOURCES, researchQuestion, projectId);

    const duration = Date.now() - startTime;
    console.log(`✅ Analysis completed in ${duration}ms\n`);

    // Display results
    console.log('📊 OVERALL ASSESSMENT:');
    console.log(`   ${result.overallAssessment}\n`);

    console.log(`🎯 CONFIDENCE LEVEL: ${result.confidenceLevel}`);
    console.log(`📚 SOURCES ANALYZED: ${result.sourcesCovered}\n`);

    console.log(`🔍 IDENTIFIED GAPS (${result.identifiedGaps.length}):`);
    result.identifiedGaps.forEach((gap, index) => {
      console.log(`   ${index + 1}. ${gap.title} (Score: ${gap.overallScore})`);
      console.log(`      Type: ${gap.gapType}`);
      console.log(`      Why it matters: ${gap.whyMatters}`);
      console.log(`      Approach: ${gap.proposedApproach}\n`);
    });

    console.log(`💡 RESEARCH OPPORTUNITIES (${result.researchOpportunities.length}):`);
    result.researchOpportunities.forEach((opportunity, index) => {
      console.log(`   ${index + 1}. ${opportunity.suggestedQuestion}`);
      console.log(`      Rationale: ${opportunity.rationale}`);
      console.log(`      Approach: ${opportunity.approach}`);
      console.log(`      Expected outcome: ${opportunity.expectedOutcome}\n`);
    });

    console.log(`🔧 METHODOLOGICAL GAPS (${result.methodologicalGaps.length}):`);
    result.methodologicalGaps.forEach((gap, index) => {
      console.log(`   ${index + 1}. ${gap.missingMethod}`);
      console.log(`      Why needed: ${gap.whyNeeded}`);
      console.log(`      Implementation: ${gap.implementationSuggestion}\n`);
    });

    console.log(`📝 RECOMMENDATIONS (${result.recommendations.length}):`);
    result.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });

    console.log('\n🏁 Gap Analysis Test Complete!');

  } catch (error) {
    console.error('❌ Gap Analysis Test Failed:', error);
    throw error;
  }
}

/**
 * Test with insufficient sources (should trigger fallback)
 */
export async function testInsufficientSources(): Promise<void> {
  console.log('\n🧪 Testing Insufficient Sources Scenario\n');

  const researchQuestion = "How does sleep affect learning?";
  const projectId = 'test-project-insufficient';
  const insufficientSources = SAMPLE_SOURCES.slice(0, 2); // Only 2 sources

  console.log(`📋 Research Question: ${researchQuestion}`);
  console.log(`📊 Testing with ${insufficientSources.length} sources (below minimum of 3)\n`);

  try {
    const result = await performGapAnalysis(insufficientSources, researchQuestion, projectId);

    console.log('📊 RESULT:');
    console.log(`   ${result.overallAssessment}\n`);

    console.log(`🎯 CONFIDENCE LEVEL: ${result.confidenceLevel}`);
    console.log(`📚 SOURCES ANALYZED: ${result.sourcesCovered}\n`);

    console.log('✅ Insufficient sources test passed - proper fallback triggered');

  } catch (error) {
    console.error('❌ Insufficient sources test failed:', error);
    throw error;
  }
}

// Export for use in development
export default testGapAnalysis;