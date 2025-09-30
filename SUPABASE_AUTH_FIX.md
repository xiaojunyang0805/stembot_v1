# 🔧 Supabase Authentication Fix Guide

## Problem Identified

The authentication system is failing because:

1. **Anonymous API Key**: Invalid/expired (`Invalid API key` error)
2. **Email Authentication**: Disabled in Supabase project (`Email signups are disabled` error)

## Solution Steps

### Step 1: Fix Supabase Project Configuration

You need to access your Supabase dashboard to enable email authentication:

1. **Go to Supabase Dashboard**: https://app.supabase.com/projects
2. **Select your project**: `kutpbtpdgptcmrlabekq`
3. **Navigate to Authentication → Settings**
4. **Enable Email Authentication**:
   - Under "Auth Providers" section
   - Ensure "Email" is enabled/toggled ON
   - Disable "Confirm email" if you want instant registration (for MVP testing)
   - Or configure SMTP if you want email confirmation

### Step 2: Get Fresh API Keys

In the same Supabase dashboard:

1. **Go to Settings → API**
2. **Copy the fresh keys**:
   - `anon public` key
   - `service_role` key (be careful with this one!)

### Step 3: Update Environment Variables

Replace the keys in `.env.local`:

```bash
# Replace these with fresh keys from Supabase dashboard
NEXT_PUBLIC_SUPABASE_URL=https://kutpbtpdgptcmrlabekq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[NEW_ANON_KEY_HERE]
SUPABASE_SERVICE_ROLE_KEY=[NEW_SERVICE_ROLE_KEY_HERE]
```

### Step 4: Test the Fix

Run the test script to verify:
```bash
node test-auth-config.js
```

Expected success output:
```
✅ SUCCESS: Email authentication is properly configured!
```

## Quick Fix Alternative

If you can't access the Supabase dashboard right now, I've implemented a fallback system. You can temporarily use Google OAuth only by updating the auth forms to hide email/password fields and show only Google sign-in.

## Files Modified

- `.env.local` - Updated to disable mock fallback
- `src/providers/AuthProvider.tsx` - Added better error handling
- `test-auth-config.js` - Diagnostic tool

## Next Steps After Fix

1. Test user registration with email
2. Test user login with email
3. Verify Google OAuth still works
4. Deploy to production with working authentication

The system is now ready for student users once Supabase email auth is enabled!