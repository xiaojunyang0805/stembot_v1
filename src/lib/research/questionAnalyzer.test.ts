// Simple tests for question analyzer
import { analyzeQuestionQuality, containsResearchQuestion, shouldTriggerSocraticCoaching } from './questionAnalyzer';

// Test sample questions
const testQuestions = [
  {
    text: "I want to study AI",
    expected: { needsRefinement: true, stage: 'vague' }
  },
  {
    text: "How does sleep affect memory in college students?",
    expected: { needsRefinement: false, stage: 'focused' }
  },
  {
    text: "What is the effect of caffeine on performance?",
    expected: { needsRefinement: true, stage: 'emerging' }
  },
  {
    text: "Does mindfulness meditation, measured by standardized stress scales, reduce anxiety levels in college students compared to a control group?",
    expected: { needsRefinement: false, stage: 'research-ready' }
  }
];

// Function to run tests (for console testing)
export function runQuestionAnalyzerTests() {
  console.log('🧪 Testing Question Analyzer...\n');

  testQuestions.forEach((test, index) => {
    console.log(`Test ${index + 1}: "${test.text}"`);

    const analysis = analyzeQuestionQuality(test.text);
    console.log(`📊 Stage: ${analysis.currentStage} (Expected: ${test.expected.stage})`);
    console.log(`🎯 Confidence: ${analysis.confidence}%`);
    console.log(`⚠️ Issues: ${analysis.detectedIssues.join(', ') || 'None'}`);
    console.log(`💡 Suggestions: ${analysis.suggestions.join('; ') || 'None'}`);
    console.log(`🤖 Trigger Socratic? ${shouldTriggerSocraticCoaching(analysis)}`);
    console.log('---\n');
  });
}

// Additional tests for edge cases
export function testEdgeCases() {
  const edgeCases = [
    "What's your favorite color?", // Not a research question
    "How are you today?", // Not a research question
    "I'm working on my thesis", // Mentions research but no question
    "", // Empty string
    "Research question: How does X affect Y in population Z when measured by method M?" // Very good question
  ];

  console.log('🔬 Testing Edge Cases...\n');

  edgeCases.forEach((text, index) => {
    console.log(`Edge Case ${index + 1}: "${text}"`);
    console.log(`🔍 Contains research question: ${containsResearchQuestion(text)}`);

    if (containsResearchQuestion(text)) {
      const analysis = analyzeQuestionQuality(text);
      console.log(`📊 Analysis: ${analysis.currentStage}, ${analysis.confidence}% confidence`);
    }
    console.log('---\n');
  });
}