/**
 * Check current auth status and attempt various fixes
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kutpbtpdgptcmrlabekq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dHBidHBkZ3B0Y21ybGFiZWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc1NDA1MzgsImV4cCI6MjA0MzExNjUzOH0.hHKHtA9bBKGBGGDBz1W5z3HRJqwMZlHU6-nKlN8_5uo';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dHBidHBkZ3B0Y21ybGFiZWtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI3MDcwNCwiZXhwIjoyMDczODQ2NzA0fQ.lMcRfuEUoY9QsTBd6MfISFmD8gqHUTdrG2RRoDlkwPU';

async function checkAndFixAuth() {
  console.log('🔍 Comprehensive Supabase authentication check and fix...');

  // Test 1: Check if API keys are working
  console.log('\n📊 Test 1: API Key Validation');
  const anonKeyValid = await testAPIKey(supabaseAnonKey, 'ANON');
  const serviceKeyValid = await testAPIKey(serviceRoleKey, 'SERVICE_ROLE');

  if (!anonKeyValid) {
    console.log('❌ CRITICAL: Anonymous key is invalid - need to generate new one');
    await generateNewKeys();
    return;
  }

  // Test 2: Check current auth settings
  console.log('\n📊 Test 2: Auth Settings Check');
  await checkAuthSettings();

  // Test 3: Try to enable email auth via SQL
  console.log('\n📊 Test 3: SQL Configuration Attempt');
  await attemptSQLFix();

  // Test 4: Final verification
  console.log('\n📊 Test 4: Final Verification');
  await finalVerification();

  // Provide manual fix instructions
  console.log('\n📋 Manual Fix Instructions:');
  provideFinalInstructions();
}

async function testAPIKey(key, keyType) {
  try {
    const client = createClient(supabaseUrl, key);
    const { data, error } = await client.auth.getSession();

    if (error) {
      console.log(`❌ ${keyType} key error:`, error.message);
      return false;
    }

    console.log(`✅ ${keyType} key is valid`);
    return true;
  } catch (error) {
    console.log(`❌ ${keyType} key test failed:`, error.message);
    return false;
  }
}

async function checkAuthSettings() {
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check if we can query auth-related tables
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('count')
      .limit(1);

    if (authError && authError.code === 'PGRST116') {
      console.log('ℹ️ Cannot access auth.users table - this is normal');
    } else if (authError) {
      console.log('❌ Auth table error:', authError.message);
    } else {
      console.log('✅ Can access auth system');
    }

    // Try to get some configuration info
    const { data: configData, error: configError } = await supabase.rpc('version');
    if (!configError) {
      console.log('✅ Database connection working');
    }

  } catch (error) {
    console.log('❌ Auth settings check failed:', error.message);
  }
}

async function attemptSQLFix() {
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log('🔧 Attempting to check auth configuration via SQL...');

    // Try to query auth configuration (this might not work due to security)
    const { data, error } = await supabase.rpc('get_auth_settings');

    if (error) {
      console.log('ℹ️ Cannot directly modify auth settings via SQL (expected)');
      console.log('📋 Reason:', error.message);
    } else {
      console.log('✅ Auth settings accessible:', data);
    }

  } catch (error) {
    console.log('ℹ️ SQL configuration not available:', error.message);
  }
}

async function finalVerification() {
  console.log('🧪 Testing email signup one more time...');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const testEmail = `test${Date.now()}@example.com`;

  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'testpassword123!'
  });

  if (error) {
    console.log('❌ Email signup still disabled:', error.message);

    if (error.message.includes('Email signups are disabled')) {
      console.log('💡 SOLUTION: Email authentication needs to be enabled in Supabase Dashboard');
      return false;
    } else if (error.message.includes('Invalid API key')) {
      console.log('💡 SOLUTION: API keys need to be regenerated');
      return false;
    }
  } else {
    console.log('✅ SUCCESS: Email signup is now working!');
    return true;
  }
}

async function generateNewKeys() {
  console.log('\n🔑 API Key Generation Instructions:');
  console.log('1. Go to: https://supabase.com/dashboard/project/kutpbtpdgptcmrlabekq/settings/api');
  console.log('2. Copy the new anon public key');
  console.log('3. Copy the new service_role key');
  console.log('4. Update .env.local with the new keys');
  console.log('5. Restart the application');
}

function provideFinalInstructions() {
  console.log(`
📋 MANUAL CONFIGURATION REQUIRED:

1. 🌐 Go to Supabase Dashboard:
   https://supabase.com/dashboard/project/kutpbtpdgptcmrlabekq

2. 🔧 Navigate to Authentication → Settings

3. ✅ Enable Email Authentication:
   - Under "Auth Providers" section
   - Toggle ON the "Email" provider
   - Set "Enable email signups" to ON

4. ⚙️ Configure Email Settings:
   - Disable "Confirm email" for MVP testing
   - OR configure SMTP for production

5. 💾 Save the configuration

6. 🧪 Test using our diagnostic script:
   node test-auth-config.js

7. 🚀 Once working, update production environment

The code is ready - just need to enable email auth in the dashboard!
  `);
}

checkAndFixAuth();