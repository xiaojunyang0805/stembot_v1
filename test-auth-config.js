/**
 * Test script to check Supabase authentication configuration
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kutpbtpdgptcmrlabekq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dHBidHBkZ3B0Y21ybGFiZWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc1NDA1MzgsImV4cCI6MjA0MzExNjUzOH0.hHKHtA9bBKGBGGDBz1W5z3HRJqwMZlHU6-nKlN8_5uo';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dHBidHBkZ3B0Y21ybGFiZWtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI3MDcwNCwiZXhwIjoyMDczODQ2NzA0fQ.lMcRfuEUoY9QsTBd6MfISFmD8gqHUTdrG2RRoDlkwPU';

async function testWithClient(client, keyType) {
  console.log(`\n🔑 Testing with ${keyType} key...`);

  try {
    // Test 1: Get session
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) {
      console.error(`❌ ${keyType} session error:`, sessionError.message);
      return false;
    }
    console.log(`✅ ${keyType} session check successful`);

    // Test 2: Try signup with a test email (generate unique email each time)
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'testpassword123!';

    console.log(`📧 Testing signup with: ${testEmail}`);
    const { data: signUpData, error: signUpError } = await client.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (signUpError) {
      console.error(`❌ ${keyType} signup error:`, signUpError.message);

      // Analyze the error
      if (signUpError.message.includes('rate limit')) {
        console.log('💡 Email auth is working but rate limited - this is actually good!');
        return true;
      } else if (signUpError.message.includes('not enabled') || signUpError.message.includes('disabled')) {
        console.log('💡 Email authentication is DISABLED in Supabase project');
        return false;
      } else if (signUpError.message.includes('Invalid API key')) {
        console.log('💡 API key is invalid or expired');
        return false;
      }
      return false;
    }

    console.log(`✅ ${keyType} signup successful!`);
    console.log('📧 User created, email confirmation may be required');
    return true;

  } catch (error) {
    console.error(`❌ ${keyType} test failed:`, error.message);
    return false;
  }
}

async function testAuthConfig() {
  console.log('🔍 Testing Supabase authentication configuration...');
  console.log('🌐 URL:', supabaseUrl);

  // Test with anonymous key (what users will use)
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const anonResult = await testWithClient(supabase, 'ANON');

  // Test with service role key (admin access)
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  const adminResult = await testWithClient(supabaseAdmin, 'SERVICE_ROLE');

  console.log('\n📊 RESULTS:');
  console.log('Anonymous key works:', anonResult ? '✅' : '❌');
  console.log('Service role key works:', adminResult ? '✅' : '❌');

  if (!anonResult && !adminResult) {
    console.log('\n❌ CRITICAL: Both keys failed - check Supabase project configuration');
  } else if (!anonResult && adminResult) {
    console.log('\n⚠️ WARNING: Only service role works - check anonymous key permissions');
  } else if (anonResult) {
    console.log('\n✅ SUCCESS: Email authentication is properly configured!');
  }
}

testAuthConfig();