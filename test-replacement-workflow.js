const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testReplacementWorkflow() {
  console.log('🧪 Testing complete replacement workflow...');

  const projectId = '314b3a6f-5520-40a6-8e31-ca56aa2b3c88';

  // Step 1: Test duplicate detection API
  console.log('\n🔍 Step 1: Testing duplicate detection...');

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
      body: formData
    });

    const result = await response.json();
    console.log('📊 Duplicate detection result:');
    console.log('  isDuplicate:', result.isDuplicate);
    console.log('  confidence:', result.confidence + '%');
    console.log('  matches:', result.matches?.length || 0);
    console.log('  recommendation:', result.recommendation);

    if (result.isDuplicate && result.matches?.length > 0) {
      console.log('✅ Duplicate detection working - found matches');

      // Test what happens in the UI workflow
      console.log('\n💭 Expected UI workflow:');
      console.log('  1. User sees duplicate dialog');
      console.log('  2. User chooses "Replace existing file"');
      console.log('  3. handleDuplicateChoice() should delete document ID:', result.matches[0].id);
      console.log('  4. Upload continues with new file');

      // The problem might be that the upload process creates a NEW document
      // instead of replacing the existing one
      console.log('\n🤔 POTENTIAL ISSUE:');
      console.log('  - Deletion happens correctly');
      console.log('  - But upload process creates NEW document');
      console.log('  - Result: Still 2 documents (1 deleted, 1 new, 1 remaining old)');

    } else {
      console.log('❌ Duplicate detection not working properly');
    }

  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

testReplacementWorkflow();