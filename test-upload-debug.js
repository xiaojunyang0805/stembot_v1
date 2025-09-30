const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testUploadFlow() {
  console.log('🧪 Testing upload flow to debug console message issue...');

  const projectId = '314b3a6f-5520-40a6-8e31-ca56aa2b3c88';

  // Test 1: Check if duplicate detection endpoint works
  console.log('\n🔍 Step 1: Testing duplicate detection API...');

  const formData = new FormData();
  formData.append('projectId', projectId);
  formData.append('extractedText', 'Wearable electrochemical sensor for cortisol detection');

  const fileBuffer = Buffer.alloc(1000000, 'X');
  formData.append('file', fileBuffer, {
    filename: '2025_A Wearable Molecularly Imprinted Electrochemical Sensor_Cortisol_Sweat.pdf',
    contentType: 'application/pdf'
  });

  try {
    const response = await fetch('https://stembotv1.vercel.app/api/documents/check-duplicates', {
      method: 'POST',
      body: formData,
      headers: {
        // Add some headers that might be expected
        'User-Agent': 'Mozilla/5.0 (compatible; TestBot/1.0)',
      }
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Duplicate detection API working:');
      console.log('  isDuplicate:', result.isDuplicate);
      console.log('  confidence:', result.confidence + '%');
      console.log('  matches:', result.matches?.length || 0);
      console.log('  recommendation:', result.recommendation);

      if (result.isDuplicate && result.matches?.length > 0) {
        console.log('\n💡 EXPECTED USER WORKFLOW:');
        console.log('  1. User uploads file via chat interface');
        console.log('  2. handleFileUpload() should log: "🚀 UPLOAD HANDLER CALLED"');
        console.log('  3. File info should be logged');
        console.log('  4. Duplicate detection should be called');
        console.log('  5. Dialog should appear with matches');
        console.log('  6. User chooses action');
        console.log('  7. File should be processed or replaced');

        console.log('\n🤔 POTENTIAL ISSUES:');
        console.log('  - Browser cache preventing JS reload');
        console.log('  - Event handler not attached to file input');
        console.log('  - Console.log not visible (wrong browser tab/context)');
        console.log('  - JavaScript error preventing handler execution');
        console.log('  - Input element disabled or hidden');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  // Test 2: Check if the analyze endpoint works (used after duplicate check)
  console.log('\n📄 Step 2: Testing document analyze API...');

  try {
    const analyzeForm = new FormData();
    analyzeForm.append('projectId', projectId);
    analyzeForm.append('file', fileBuffer, {
      filename: 'test-document.pdf',
      contentType: 'application/pdf'
    });

    const analyzeResponse = await fetch('https://stembotv1.vercel.app/api/documents/analyze', {
      method: 'POST',
      body: analyzeForm
    });

    console.log('📊 Analyze response status:', analyzeResponse.status);

    if (analyzeResponse.ok) {
      const analyzeResult = await analyzeResponse.json();
      console.log('✅ Document analyze API working');
      console.log('  Success:', analyzeResult.success);
    } else {
      const errorText = await analyzeResponse.text();
      console.log('❌ Analyze API Error:', errorText);
    }

  } catch (error) {
    console.error('❌ Analyze test failed:', error.message);
  }
}

testUploadFlow();