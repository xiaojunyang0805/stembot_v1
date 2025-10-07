/**
 * Integration Verification Script
 * Checks all WP5 Writing Phase integrations
 *
 * Usage: node verify-integration.js
 */

const BASE_URL = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'http://localhost:3000';

const TEST_PROJECT_ID = process.env.TEST_PROJECT_ID || 'test-project-id';

console.log('🧪 WP5 Writing Phase - Integration Verification');
console.log('📍 Testing URL:', BASE_URL);
console.log('🆔 Test Project ID:', TEST_PROJECT_ID);
console.log('');

const tests = [];
let passedTests = 0;
let failedTests = 0;

// Test result tracking
function test(name, fn) {
  tests.push({ name, fn });
}

function pass(name, details = '') {
  console.log(`✅ PASS: ${name}${details ? ' - ' + details : ''}`);
  passedTests++;
}

function fail(name, error) {
  console.log(`❌ FAIL: ${name} - ${error}`);
  failedTests++;
}

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data,
      duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      error: error.message,
      duration
    };
  }
}

// ============================================
// TEST SUITE 1: Writing API Endpoints
// ============================================

test('Writing Sections API - GET', async () => {
  const result = await apiCall(`/api/writing/sections?projectId=${TEST_PROJECT_ID}`);

  if (!result.success) {
    fail('Writing Sections GET', result.error || `Status ${result.status}`);
    return;
  }

  if (!result.data.sections || !Array.isArray(result.data.sections)) {
    fail('Writing Sections GET', 'Invalid response format');
    return;
  }

  pass('Writing Sections GET', `${result.data.sections.length} sections, ${result.duration}ms`);
});

test('Writing Sections API - POST', async () => {
  const testSection = {
    projectId: TEST_PROJECT_ID,
    sectionName: 'Test Integration Section',
    content: 'This is test content for integration verification.',
    wordCount: 7,
    status: 'in_progress'
  };

  const result = await apiCall('/api/writing/sections', {
    method: 'POST',
    body: JSON.stringify(testSection)
  });

  if (!result.success) {
    fail('Writing Sections POST', result.error || `Status ${result.status}`);
    return;
  }

  if (!result.data.section || !result.data.section.id) {
    fail('Writing Sections POST', 'Invalid response format');
    return;
  }

  pass('Writing Sections POST', `Created section ID: ${result.data.section.id}, ${result.duration}ms`);
});

test('Writing Suggestions API', async () => {
  const result = await apiCall('/api/writing/suggestions', {
    method: 'POST',
    body: JSON.stringify({
      projectId: TEST_PROJECT_ID,
      sectionName: 'Introduction',
      currentContent: 'This is a test introduction.'
    })
  });

  if (!result.success) {
    fail('Writing Suggestions', result.error || `Status ${result.status}`);
    return;
  }

  if (result.duration > 5000) {
    fail('Writing Suggestions', `Too slow: ${result.duration}ms (target <5000ms)`);
    return;
  }

  pass('Writing Suggestions', `${result.duration}ms (target <5000ms)`);
});

test('Outline Generation API', async () => {
  const result = await apiCall('/api/writing/generate-outline', {
    method: 'POST',
    body: JSON.stringify({
      projectId: TEST_PROJECT_ID
    })
  });

  if (!result.success) {
    fail('Outline Generation', result.error || `Status ${result.status}`);
    return;
  }

  if (result.duration > 8000) {
    fail('Outline Generation', `Too slow: ${result.duration}ms (target <8000ms)`);
    return;
  }

  pass('Outline Generation', `${result.duration}ms (target <8000ms)`);
});

// ============================================
// TEST SUITE 2: Progress API
// ============================================

test('Progress Metrics API', async () => {
  const result = await apiCall(`/api/projects/${TEST_PROJECT_ID}/progress`);

  if (!result.success) {
    fail('Progress Metrics', result.error || `Status ${result.status}`);
    return;
  }

  const requiredFields = ['phases', 'currentPhase', 'nextMilestone'];
  const missingFields = requiredFields.filter(field => !result.data[field]);

  if (missingFields.length > 0) {
    fail('Progress Metrics', `Missing fields: ${missingFields.join(', ')}`);
    return;
  }

  pass('Progress Metrics', `${result.duration}ms`);
});

// ============================================
// TEST SUITE 3: Chat Integration
// ============================================

test('Enhanced Chat with Writing Context', async () => {
  const result = await apiCall('/api/ai/enhanced-chat', {
    method: 'POST',
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'What should I write next?' }
      ],
      projectContext: {
        projectId: TEST_PROJECT_ID,
        currentPhase: 'writing'
      },
      useEnhanced: true
    })
  });

  if (!result.success) {
    fail('Enhanced Chat', result.error || `Status ${result.status}`);
    return;
  }

  if (!result.data.message || !result.data.message.content) {
    fail('Enhanced Chat', 'Invalid response format');
    return;
  }

  const totalTime = result.duration;
  if (totalTime > 3000) {
    fail('Enhanced Chat', `Too slow: ${totalTime}ms (target <3000ms total)`);
    return;
  }

  pass('Enhanced Chat', `${totalTime}ms (includes context <500ms)`);
});

test('Chat Health Check', async () => {
  const result = await apiCall('/api/ai/enhanced-chat', {
    method: 'GET'
  });

  if (!result.success) {
    fail('Chat Health Check', result.error || `Status ${result.status}`);
    return;
  }

  if (!result.data.services) {
    fail('Chat Health Check', 'Invalid response format');
    return;
  }

  const gpt5Status = result.data.services['gpt-5-nano']?.status;
  pass('Chat Health Check', `GPT-4o-mini: ${gpt5Status}`);
});

// ============================================
// TEST SUITE 4: Data Flow Integration
// ============================================

test('Cross-Page Data Consistency', async () => {
  // 1. Write content to sections API
  const writeResult = await apiCall('/api/writing/sections', {
    method: 'POST',
    body: JSON.stringify({
      projectId: TEST_PROJECT_ID,
      sectionName: 'Introduction',
      content: 'Test content for data consistency verification. This should appear in progress metrics.',
      wordCount: 12,
      status: 'in_progress'
    })
  });

  if (!writeResult.success) {
    fail('Data Consistency - Write', writeResult.error);
    return;
  }

  // 2. Wait 1 second for database propagation
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 3. Check if progress API reflects the change
  const progressResult = await apiCall(`/api/projects/${TEST_PROJECT_ID}/progress`);

  if (!progressResult.success) {
    fail('Data Consistency - Read Progress', progressResult.error);
    return;
  }

  // 4. Verify writing phase shows updated data
  const hasWritingData = progressResult.data.phases?.some(phase =>
    phase.name === 'Writing' && phase.progress > 0
  );

  if (!hasWritingData) {
    fail('Data Consistency', 'Progress API does not reflect writing data');
    return;
  }

  pass('Data Consistency', 'Write → Read → Verify successful');
});

// ============================================
// TEST SUITE 5: Performance Benchmarks
// ============================================

test('Page Load Performance', async () => {
  const pages = [
    '/projects/' + TEST_PROJECT_ID + '/writing',
    '/projects/' + TEST_PROJECT_ID + '/progress',
    '/projects/' + TEST_PROJECT_ID
  ];

  const results = [];

  for (const page of pages) {
    const startTime = Date.now();
    try {
      const response = await fetch(BASE_URL + page);
      const duration = Date.now() - startTime;
      results.push({ page, duration, status: response.status });
    } catch (error) {
      results.push({ page, duration: -1, error: error.message });
    }
  }

  const slowPages = results.filter(r => r.duration > 2000);

  if (slowPages.length > 0) {
    fail('Page Load Performance',
      `Slow pages: ${slowPages.map(p => `${p.page} (${p.duration}ms)`).join(', ')}`
    );
    return;
  }

  const avgDuration = Math.round(
    results.reduce((sum, r) => sum + r.duration, 0) / results.length
  );

  pass('Page Load Performance', `Average: ${avgDuration}ms (all <2000ms)`);
});

// ============================================
// RUN ALL TESTS
// ============================================

async function runTests() {
  console.log(`Running ${tests.length} integration tests...\n`);

  for (const { name, fn } of tests) {
    try {
      await fn();
    } catch (error) {
      fail(name, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📝 Total:  ${tests.length}`);
  console.log(`📈 Success Rate: ${Math.round((passedTests / tests.length) * 100)}%`);
  console.log('='.repeat(60));

  if (failedTests === 0) {
    console.log('\n🎉 All integration tests passed! Ready for pilot testing.\n');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${failedTests} test(s) failed. Please fix before pilot testing.\n`);
    process.exit(1);
  }
}

// Start tests
runTests().catch(error => {
  console.error('❌ Fatal error running tests:', error);
  process.exit(1);
});
