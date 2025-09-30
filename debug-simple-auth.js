/**
 * Test the simplest possible Supabase auth signup
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kutpbtpdgptcmrlabekq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dHBidHBkZ3B0Y21ybGFiZWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNzA3MDQsImV4cCI6MjA3Mzg0NjcwNH0.wGTfWO5Sv4eUWMWoMzMRSrzLkXB8Fum5S5SiU7T6WEo';

async function testSimpleAuth() {
  console.log('🔍 Testing simplest possible Supabase auth...');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Test 1: Ultra-simple signup with no metadata
  console.log('\n📊 Test 1: Minimal Signup (no metadata)');
  const testEmail = `simple${Date.now()}@example.com`;
  const testPassword = 'SimplePassword123!';

  try {
    console.log(`📧 Attempting minimal signup: ${testEmail}`);

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (error) {
      console.log('❌ Minimal signup failed:', error.message);
      console.log('Status:', error.status);
      console.log('Code:', error.code);
    } else {
      console.log('✅ Minimal signup successful!');
      console.log('User ID:', data.user?.id);
      console.log('Email:', data.user?.email);
      console.log('Confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
    }
  } catch (err) {
    console.log('❌ Exception during minimal signup:', err.message);
  }

  // Test 2: Check if email confirmation is required
  console.log('\n📊 Test 2: Check Auth Settings');
  try {
    // This might give us clues about the configuration
    const { data: session } = await supabase.auth.getSession();
    console.log('Current session status:', session ? 'Active' : 'None');
  } catch (err) {
    console.log('Session check failed:', err.message);
  }

  console.log('\n🎯 Simple auth test completed.');
}

testSimpleAuth();