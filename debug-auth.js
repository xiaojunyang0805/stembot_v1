/**
 * Debug script to test Supabase auth directly
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kutpbtpdgptcmrlabekq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dHBidHBkZ3B0Y21ybGFiZWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNzA3MDQsImV4cCI6MjA3Mzg0NjcwNH0.wGTfWO5Sv4eUWMWoMzMRSrzLkXB8Fum5S5SiU7T6WEo';

async function debugAuth() {
  console.log('🔍 Starting comprehensive auth debug...');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Test 1: Check if we can connect
  console.log('\n📊 Test 1: Basic Connection');
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ Connection successful');
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
    return;
  }

  // Test 2: Try to sign up a user
  console.log('\n📊 Test 2: Email Signup');
  const testEmail = `debug${Date.now()}@example.com`;
  const testPassword = 'DebugPassword123!';

  try {
    console.log(`📧 Attempting signup with: ${testEmail}`);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          firstName: 'Debug',
          lastName: 'User',
          role: 'researcher'
        }
      }
    });

    if (signUpError) {
      console.log('❌ Signup failed:', signUpError);
      console.log('Error details:', {
        message: signUpError.message,
        status: signUpError.status,
        statusText: signUpError.statusText,
        name: signUpError.name
      });

      // Check if it's a known error pattern
      if (signUpError.message.includes('Email signups are disabled')) {
        console.log('💡 Issue: Email signups still disabled in Supabase dashboard');
      } else if (signUpError.message.includes('Invalid API key')) {
        console.log('💡 Issue: API key problems');
      } else {
        console.log('💡 Issue: Unknown signup error - need further investigation');
      }
    } else {
      console.log('✅ Signup successful!');
      console.log('User data:', {
        id: signUpData.user?.id,
        email: signUpData.user?.email,
        email_confirmed_at: signUpData.user?.email_confirmed_at,
        user_metadata: signUpData.user?.user_metadata
      });

      // Test 3: Try to sign in immediately
      console.log('\n📊 Test 3: Immediate Sign In');
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        });

        if (signInError) {
          console.log('❌ Sign in failed:', signInError.message);
          if (signInError.message.includes('Email not confirmed')) {
            console.log('💡 Issue: Email confirmation required but not completed');
          } else if (signInError.message.includes('Invalid login credentials')) {
            console.log('💡 Issue: User not properly created despite signup success');
          }
        } else {
          console.log('✅ Sign in successful!');
          console.log('Session user:', signInData.user?.email);
        }
      } catch (err) {
        console.log('❌ Sign in exception:', err.message);
      }
    }
  } catch (err) {
    console.log('❌ Signup exception:', err.message);
  }

  console.log('\n🎯 Debug completed.');
}

debugAuth();