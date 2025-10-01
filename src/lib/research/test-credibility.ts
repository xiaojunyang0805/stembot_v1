/**
 * Test File for AI-Powered Credibility Checker
 *
 * Tests the credibility assessment system with sample sources
 * to verify scoring accuracy and explanation quality.
 *
 * Location: src/lib/research/test-credibility.ts
 */

import { assessSourceCredibility, SourceMetadata } from './credibilityChecker';

// Sample sources for testing
const TEST_SOURCES: SourceMetadata[] = [
  // High-quality source (should score 80+)
  {
    title: 'Large-scale randomized controlled trial of cognitive behavioral therapy for depression',
    authors: ['Smith, J.', 'Johnson, K.', 'Williams, L.'],
    journal: 'Nature Medicine',
    year: 2023,
    doi: '10.1038/s41591-023-12345',
    abstract: 'This randomized controlled trial (N=2,847) evaluated the effectiveness of cognitive behavioral therapy versus placebo for major depressive disorder. Participants were randomly assigned to CBT (n=1,423) or waitlist control (n=1,424) groups. Primary outcome was depression severity measured by Hamilton Depression Rating Scale. Results showed significant reduction in depression scores (p<0.001, 95% CI: -3.2 to -1.8). The study used double-blind methodology with rigorous statistical controls.'
  },

  // Moderate-quality source (should score 60-79)
  {
    title: 'Survey of student attitudes toward online learning during COVID-19',
    authors: ['Brown, A.', 'Davis, M.'],
    journal: 'Journal of Educational Psychology',
    year: 2021,
    abstract: 'Cross-sectional survey study examining student perceptions of online learning effectiveness during the COVID-19 pandemic. Sample included 523 undergraduate students from three universities. Data collected via online questionnaire measuring satisfaction, engagement, and learning outcomes. Results indicate moderate satisfaction with online learning (M=3.2, SD=1.1 on 5-point scale).'
  },

  // Lower-quality source (should score <60)
  {
    title: 'Case study of single patient with rare neurological condition',
    authors: ['Wilson, R.'],
    journal: 'Regional Medical Reports',
    year: 2010,
    abstract: 'This case study describes a 45-year-old patient presenting with unusual neurological symptoms. Patient showed improvement following experimental treatment protocol. Further research needed to establish efficacy.'
  },

  // Recent high-impact source
  {
    title: 'Machine learning approaches to educational assessment: A systematic review',
    authors: ['Lee, S.', 'Chen, W.', 'Rodriguez, C.', 'Anderson, P.'],
    journal: 'Science',
    year: 2024,
    doi: '10.1126/science.abcd1234',
    abstract: 'Systematic review and meta-analysis of 127 studies examining machine learning applications in educational assessment. Comprehensive search of multiple databases identified studies published 2015-2023. Random-effects meta-analysis showed moderate effect sizes (d=0.65, 95% CI: 0.52-0.78) for ML-enhanced assessment accuracy. Quality assessment using PRISMA guidelines. Significant heterogeneity observed (I²=67%), addressed through subgroup analysis.'
  }
];

/**
 * Run comprehensive tests on the credibility checker
 */
export async function runCredibilityTests(): Promise<void> {
  console.log('🧪 Testing AI-Powered Credibility Checker\n');

  for (let i = 0; i < TEST_SOURCES.length; i++) {
    const source = TEST_SOURCES[i];
    console.log(`\n📊 Test ${i + 1}: ${source.title.substring(0, 60)}...`);
    console.log(`📅 Year: ${source.year} | 📚 Journal: ${source.journal}`);

    try {
      const assessment = await assessSourceCredibility(source, 'educational technology and learning outcomes');

      console.log(`\n✅ Assessment Results:`);
      console.log(`   Level: ${assessment.level} (Score: ${assessment.score}/100)`);
      console.log(`   Study Type: ${assessment.studyType || 'Not detected'}`);
      console.log(`   Research Field: ${assessment.researchField || 'General'}`);

      if (assessment.metrics) {
        console.log(`\n📈 Detailed Metrics:`);
        console.log(`   Journal Quality: ${assessment.metrics.journalQuality}/30`);
        console.log(`   Recency: ${assessment.metrics.recency}/20`);
        console.log(`   Sample Size: ${assessment.metrics.sampleSize}/20`);
        console.log(`   Methodology: ${assessment.metrics.methodology}/30`);
      }

      console.log(`\n💪 Strengths (${assessment.strengths.length}):`);
      assessment.strengths.forEach((strength, idx) => {
        console.log(`   ${idx + 1}. ${strength}`);
      });

      console.log(`\n⚠️  Limitations (${assessment.limitations.length}):`);
      assessment.limitations.forEach((limitation, idx) => {
        console.log(`   ${idx + 1}. ${limitation}`);
      });

      console.log(`\n📝 Explanation:`);
      console.log(`   ${assessment.explanation}`);

      // Validate scoring expectations
      console.log(`\n🎯 Validation:`);
      if (i === 0 && assessment.score >= 80) {
        console.log(`   ✅ High-quality source correctly scored as High (${assessment.score})`);
      } else if (i === 1 && assessment.score >= 60 && assessment.score < 80) {
        console.log(`   ✅ Moderate-quality source correctly scored as Moderate (${assessment.score})`);
      } else if (i === 2 && assessment.score < 60) {
        console.log(`   ✅ Lower-quality source correctly scored as Low (${assessment.score})`);
      } else if (i === 3 && assessment.score >= 80) {
        console.log(`   ✅ Recent high-impact source correctly scored as High (${assessment.score})`);
      } else {
        console.log(`   ⚠️ Scoring may need adjustment for this source type`);
      }

    } catch (error) {
      console.error(`   ❌ Error assessing source: ${error}`);
    }

    console.log('\n' + '='.repeat(80));
  }

  console.log('\n🏁 Credibility Tests Complete!\n');
}

/**
 * Test specific scoring components
 */
export async function testScoringComponents(): Promise<void> {
  console.log('🔬 Testing Individual Scoring Components\n');

  // Test journal quality scoring
  const { calculateJournalQuality } = await import('./credibilityChecker');

  console.log('📚 Journal Quality Scoring:');
  console.log(`   Nature: ${calculateJournalQuality('Nature', 2023)}/30`);
  console.log(`   Science: ${calculateJournalQuality('Science', 2023)}/30`);
  console.log(`   PLoS ONE: ${calculateJournalQuality('PLoS ONE', 2023)}/30`);
  console.log(`   Unknown Journal: ${calculateJournalQuality('Unknown Journal', 2023)}/30`);

  // Test recency scoring
  const { calculateRecencyScore } = await import('./credibilityChecker');

  console.log('\n📅 Recency Scoring:');
  console.log(`   2024: ${calculateRecencyScore(2024)}/20`);
  console.log(`   2020: ${calculateRecencyScore(2020)}/20`);
  console.log(`   2010: ${calculateRecencyScore(2010)}/20`);
  console.log(`   2000: ${calculateRecencyScore(2000)}/20`);

  // Test study type detection
  const { detectStudyType } = await import('./credibilityChecker');

  console.log('\n🔬 Study Type Detection:');
  console.log(`   RCT text: "${detectStudyType('randomized controlled trial')}"`);
  console.log(`   Meta-analysis text: "${detectStudyType('systematic review and meta-analysis')}"`);
  console.log(`   Survey text: "${detectStudyType('cross-sectional survey study')}"`);
  console.log(`   Case study text: "${detectStudyType('case study of patient')}"`);

  console.log('\n🏁 Component Tests Complete!\n');
}

/**
 * Test explanation quality
 */
export async function testExplanationQuality(): Promise<void> {
  console.log('📝 Testing Explanation Quality\n');

  const { generateNoviceFriendlyExplanation } = await import('./credibilityChecker');

  console.log('High Credibility Explanation:');
  console.log(generateNoviceFriendlyExplanation('High', 85, TEST_SOURCES[0], 'Randomized Controlled Trial'));

  console.log('\nModerate Credibility Explanation:');
  console.log(generateNoviceFriendlyExplanation('Moderate', 65, TEST_SOURCES[1], 'Survey Study'));

  console.log('\nLow Credibility Explanation:');
  console.log(generateNoviceFriendlyExplanation('Low', 45, TEST_SOURCES[2], 'Case Study'));

  console.log('\n🏁 Explanation Tests Complete!\n');
}

// Export test runner for use in development
export default runCredibilityTests;