/**
 * Debug script for integration test failures
 */

const { checkCriticalIssues } = require('../src/lib/research/criticalChecker');

// Test 1: Success scenario
console.log('=== Test 1: Success Scenario ===');
const successMethodology = {
  projectId: 'test-project-1',
  methodType: 'experimental',
  methodName: 'Randomized Controlled Trial',
  reasoning: 'Testing the effect of study techniques on test scores',
  independentVariables: [
    { name: 'Study Technique', description: 'Flashcards vs. Note-taking' }
  ],
  dependentVariables: [
    { name: 'Test Score', description: 'Score on standardized test (0-100)' }
  ],
  controlVariables: [
    { name: 'Study Time', description: 'All participants study for 30 minutes' }
  ],
  participantCriteria: 'University students aged 18-22 enrolled in psychology courses',
  estimatedSampleSize: 60,
  recruitmentStrategy: 'Recruit through psychology department email list and class announcements',
  procedureDraft: `1. Recruit 60 university students through email
2. Randomly assign to flashcard or note-taking group (30 each)
3. Provide study materials on cognitive psychology
4. Each participant studies for exactly 30 minutes using their assigned technique
5. Immediately after, administer standardized test
6. Record scores and analyze using t-test`
};

const result1 = checkCriticalIssues(successMethodology);
console.log('Result:', JSON.stringify(result1, null, 2));
console.log('Valid:', result1.valid);
console.log('Error Count:', result1.errorCount);
console.log('Warning Count:', result1.warningCount);
console.log('Issues:', result1.issues);

// Test 2: Failure scenario with children
console.log('\n=== Test 2: Children + Small Sample ===');
const failMethodology = {
  projectId: 'test-project-2',
  methodType: 'experimental',
  methodName: 'Experiment with Children',
  reasoning: 'Testing effects on children',
  independentVariables: [
    { name: 'Treatment', description: 'Drug vs. Placebo' }
  ],
  dependentVariables: [
    { name: 'Outcome', description: 'Some outcome' }
  ],
  controlVariables: [],
  participantCriteria: 'Children aged 8-12 from local elementary schools',
  estimatedSampleSize: 5,
  recruitmentStrategy: 'Ask teachers to send kids',
  procedureDraft: 'Give kids the drug and measure stuff'
};

const result2 = checkCriticalIssues(failMethodology);
console.log('Result:', JSON.stringify(result2, null, 2));
console.log('Valid:', result2.valid);
console.log('Error Count:', result2.errorCount);
console.log('Issues Count:', result2.issues.length);

// Test 3: Vulnerable populations
console.log('\n=== Test 3: Vulnerable Populations ===');
const vulnerableMethodology = {
  projectId: 'test-project-3',
  methodType: 'survey',
  methodName: 'Survey Research',
  reasoning: 'Understanding experiences',
  independentVariables: [],
  dependentVariables: [
    { name: 'Responses', description: 'Survey responses' }
  ],
  controlVariables: [],
  participantCriteria: 'Pregnant women and minors under 18',
  estimatedSampleSize: 100,
  recruitmentStrategy: 'Social media recruitment',
  procedureDraft: 'Send survey via email, collect responses, no consent form needed'
};

const result3 = checkCriticalIssues(vulnerableMethodology);
console.log('Result:', JSON.stringify(result3, null, 2));
console.log('Valid:', result3.valid);
console.log('Issues:', result3.issues);
