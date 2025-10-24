# Supabase Keep-Alive Implementation Guide

## 🎯 Problem

Supabase free tier projects are automatically paused after 7 days of inactivity. This affects development projects that don't have regular user traffic.

## ✅ Solutions Implemented

### **Solution 1: Vercel Cron Job (Recommended - Automated)**

**Status:** Configured and ready to deploy

**What it does:**
- Automatically queries database every 3 days
- Runs on Vercel's edge network (free on all plans)
- No local machine required

**Files created:**
- `src/app/api/cron/keepalive/route.ts` - Cron endpoint
- `vercel.json` - Cron schedule configuration

**Deployment steps:**

1. **Add CRON_SECRET to Vercel:**
   ```bash
   # Option A: Via Vercel Dashboard
   # Go to: https://vercel.com/your-project/settings/environment-variables
   # Add: CRON_SECRET = your-random-secret-string-here

   # Option B: Via CLI
   npx vercel env add CRON_SECRET production
   ```

2. **Deploy the changes:**
   ```bash
   git add .
   git commit -m "Add Supabase keep-alive cron job"
   git push origin main
   ```

3. **Verify cron job is active:**
   - Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
   - Should see: `/api/cron/keepalive` running every 3 days

4. **Test manually (optional):**
   ```bash
   # Get your CRON_SECRET from Vercel environment variables
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://stembotv1.vercel.app/api/cron/keepalive

   # Expected response:
   # {"success":true,"timestamp":"2025-10-24T...","projectCount":X,"message":"..."}
   ```

**Schedule:** Every 3 days at midnight UTC (`0 0 */3 * *`)

**Cost:** FREE (included in all Vercel plans)

---

### **Solution 2: Local Script (Manual Backup)**

**Status:** Available for manual execution

**What it does:**
- Runs locally on your machine
- Queries database to generate activity
- Logs results to `scripts/keepalive.log`

**File created:**
- `scripts/supabase-keepalive.js`

**Usage:**

1. **Install dependencies** (if not already installed):
   ```bash
   cd D:\stembot-mvp\stembot_v1
   npm install @supabase/supabase-js dotenv
   ```

2. **Run manually:**
   ```bash
   node scripts/supabase-keepalive.js
   ```

3. **Expected output:**
   ```
   🔄 Running Supabase keep-alive check...
   📅 Timestamp: 2025-10-24T12:00:00.000Z
   ✅ Database active - 5 projects exist
   ✨ Keep-alive successful! Next check recommended in 3-5 days.
   ```

4. **Set up Windows Task Scheduler (optional):**
   - Open Task Scheduler
   - Create Basic Task
   - Name: "Supabase Keep-Alive"
   - Trigger: Weekly, every 3 days
   - Action: Start a program
     - Program: `C:\Program Files\nodejs\node.exe`
     - Arguments: `"D:\stembot-mvp\stembot_v1\scripts\supabase-keepalive.js"`
     - Start in: `D:\stembot-mvp\stembot_v1`

---

## 📊 Monitoring

### Check if keep-alive is working:

**Via Vercel:**
- Dashboard → Your Project → Deployments → Functions
- Look for `/api/cron/keepalive` executions in logs

**Via Supabase:**
- Dashboard → Settings → Database → Activity
- Should show regular queries every 3 days

**Via local logs:**
- Check `scripts/keepalive.log` for execution history

---

## 🚨 Troubleshooting

### Vercel cron not executing:

1. **Verify CRON_SECRET is set:**
   ```bash
   npx vercel env ls
   # Should show CRON_SECRET in production
   ```

2. **Check cron configuration:**
   ```bash
   cat vercel.json
   # Should show crons array with keepalive path
   ```

3. **Manually trigger:**
   ```bash
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://stembotv1.vercel.app/api/cron/keepalive
   ```

### Local script errors:

1. **"Missing Supabase credentials":**
   - Ensure `.env.local` exists with valid credentials
   - Check `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

2. **"Database query failed":**
   - Verify Supabase project is not paused
   - Check RLS policies allow service role access

---

## 🎯 Recommended Approach

1. **Immediate:** Run local script once to generate activity NOW
   ```bash
   node scripts/supabase-keepalive.js
   ```

2. **Long-term:** Deploy Vercel cron job for automated keep-alive
   ```bash
   git add .
   git commit -m "Add Supabase keep-alive cron job"
   git push origin main
   ```

3. **Monitoring:** Check Vercel dashboard in 3 days to verify first execution

---

## 💡 Alternative: Upgrade to Pro

If you need guaranteed uptime without worrying about inactivity:

**Supabase Pro Plan:**
- Cost: $25/month
- No inactivity pausing
- Better performance and support
- Upgrade at: https://supabase.com/dashboard/project/kutpbtpdgptcmrlabekq/settings/billing

**When to upgrade:**
- Production deployment
- Multiple active users
- Need 99.9% uptime guarantee
- Want to avoid maintenance overhead

---

## 📝 Summary

✅ **Vercel Cron (Recommended):**
- Fully automated
- Free
- No local machine required
- Deploy + forget

✅ **Local Script (Backup):**
- Manual execution
- Free
- Useful for testing
- Requires scheduled task setup

✅ **Pro Plan (Future):**
- No maintenance needed
- Production-ready
- $25/month

**Next Step:** Deploy Vercel cron job to avoid pausing permanently!
