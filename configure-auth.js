/**
 * Configure Supabase authentication settings via Management API
 */

const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dHBidHBkZ3B0Y21ybGFiZWtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI3MDcwNCwiZXhwIjoyMDczODQ2NzA0fQ.lMcRfuEUoY9QsTBd6MfISFmD8gqHUTdrG2RRoDlkwPU';
const projectRef = 'kutpbtpdgptcmrlabekq';

async function configureAuth() {
  console.log('🔧 Configuring Supabase authentication settings...');

  try {
    // Enable email signups via the auth config API
    const authConfigUrl = `https://${projectRef}.supabase.co/rest/v1/auth/config`;

    const authConfig = {
      // Enable email signups
      SITE_URL: 'https://stembotv1.vercel.app',
      URI_ALLOW_LIST: 'https://stembotv1.vercel.app,http://localhost:3000',
      // Enable email authentication
      EXTERNAL_EMAIL_ENABLED: true,
      // Disable email confirmation for easier MVP testing
      EMAIL_CONFIRM: false,
      // Allow signups
      ENABLE_SIGNUP: true,
      // Set minimum password length
      PASSWORD_MIN_LENGTH: 6
    };

    console.log('📤 Updating auth configuration...');
    console.log('Config:', authConfig);

    const response = await fetch(authConfigUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey
      },
      body: JSON.stringify(authConfig)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to update auth config:', response.status, errorText);

      // Try alternative approach using the admin API
      console.log('🔄 Trying alternative admin API approach...');
      await tryAdminAPIApproach();
      return;
    }

    const result = await response.json();
    console.log('✅ Successfully updated auth configuration!');
    console.log('📋 Result:', result);

    // Test the configuration
    console.log('\n🧪 Testing updated configuration...');
    await testAuthAfterConfig();

  } catch (error) {
    console.error('❌ Error configuring auth:', error.message);
    console.log('\n🔄 Trying alternative approaches...');
    await tryAlternativeApproaches();
  }
}

async function tryAdminAPIApproach() {
  console.log('🔧 Trying Supabase Admin API approach...');

  try {
    // Use the admin API to update project settings
    const adminUrl = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`;

    const adminConfig = {
      email_enable_signup: true,
      email_enable_confirmations: false,
      site_url: 'https://stembotv1.vercel.app',
      redirect_urls: ['https://stembotv1.vercel.app', 'http://localhost:3000']
    };

    console.log('📤 Sending admin API request...');
    const response = await fetch(adminUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adminConfig)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Admin API failed:', response.status, errorText);
      return false;
    }

    console.log('✅ Admin API configuration successful!');
    return true;

  } catch (error) {
    console.error('❌ Admin API error:', error.message);
    return false;
  }
}

async function tryAlternativeApproaches() {
  console.log('🔧 Trying direct database configuration...');

  try {
    // Try to enable auth directly via SQL if we have database access
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(`https://${projectRef}.supabase.co`, serviceRoleKey);

    // Check if we can access auth settings
    const { data, error } = await supabase.rpc('get_auth_settings');

    if (error) {
      console.log('ℹ️ Cannot access auth settings via RPC - this is expected');
      console.log('📋 Manual configuration required via Supabase Dashboard');
      return false;
    }

    console.log('📋 Current auth settings:', data);
    return true;

  } catch (error) {
    console.error('❌ Alternative approach failed:', error.message);
    return false;
  }
}

async function testAuthAfterConfig() {
  console.log('🧪 Testing email signup after configuration...');

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      `https://${projectRef}.supabase.co`,
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dHBidHBkZ3B0Y21ybGFiZWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc1NDA1MzgsImV4cCI6MjA0MzExNjUzOH0.hHKHtA9bBKGBGGDBz1W5z3HRJqwMZlHU6-nKlN8_5uo'
    );

    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'testpassword123!';

    console.log(`📧 Testing signup with: ${testEmail}`);

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (error) {
      console.error('❌ Test signup still failed:', error.message);
      return false;
    }

    console.log('✅ Test signup successful!');
    console.log('👤 User created:', data.user ? 'Yes' : 'No');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the configuration
configureAuth();