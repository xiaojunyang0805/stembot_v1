const FormData = require('form-data');
const { createClient } = require('@supabase/supabase-js');

// Import fetch for Node.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Use the REAL project ID that has documents
const REAL_PROJECT_ID = '314b3a6f-5520-40a6-8e31-ca56aa2b3c88';

async function testRealDuplicateDetection() {
  console.log('🎯 Testing duplicate detection with REAL user data...');
  console.log('📋 Project ID:', REAL_PROJECT_ID);

  // Test with the exact same file that exists in the database
  const formData = new FormData();
  formData.append('projectId', REAL_PROJECT_ID);
  formData.append('extractedText', 'Sample content from the PDF about wearable electrochemical sensors');

  // Create a file with the exact same name as in the database
  const fileBuffer = Buffer.alloc(1000000, 'X'); // Random content, but same name
  formData.append('file', fileBuffer, {
    filename: '2025_A Wearable Molecularly Imprinted Electrochemical Sensor_Cortisol_Sweat.pdf',
    contentType: 'application/pdf'
  });

  try {
    console.log('📡 Making duplicate check request...');
    const response = await fetch('https://stembotv1.vercel.app/api/documents/check-duplicates', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    console.log('📊 API Response:', JSON.stringify(result, null, 2));

    if (result.success && result.isDuplicate) {
      console.log('🎉 SUCCESS! Duplicate detection is working!');
      console.log(`   Confidence: ${result.confidence}%`);
      console.log(`   Matches found: ${result.matches.length}`);
      console.log(`   Recommendation: ${result.recommendation}`);
      return true;
    } else if (result.success) {
      console.log('❌ Still no duplicates detected');
      console.log('   Debug info:', result.debug);
      return false;
    } else {
      console.log('❌ API call failed:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
    return false;
  }
}

testRealDuplicateDetection();