# 🚨 CRITICAL: Vercel Cron Setup (Complete in 2 Minutes)

## ✅ What's Done
- ✅ Keep-alive script created and tested locally
- ✅ API endpoint deployed to Vercel
- ✅ Cron schedule configured (every 3 days)
- ✅ Immediate database activity generated (bought you time!)

## 🚨 What You MUST Do Now (Required for Automation)

### **Step 1: Add CRON_SECRET to Vercel** (30 seconds)

1. Go to: https://vercel.com/xiaojunyang0805/stembot-v1/settings/environment-variables

2. Click "Add New" → "Environment Variable"

3. Enter:
   - **Key:** `CRON_SECRET`
   - **Value:** `stembot-cron-2025-secure-random-key` (or any random string)
   - **Environment:** Check "Production"

4. Click "Save"

### **Step 2: Verify Cron Job is Active** (30 seconds)

1. Go to: https://vercel.com/xiaojunyang0805/stembot-v1/settings/cron-jobs

2. You should see:
   - Path: `/api/cron/keepalive`
   - Schedule: `0 0 */3 * *` (every 3 days at midnight UTC)
   - Status: "Active"

3. If not visible, wait 2-3 minutes for deployment to complete

### **Step 3: Test Manually** (Optional - 15 seconds)

```bash
curl -H "Authorization: Bearer stembot-cron-2025-secure-random-key" \
  https://stembotv1.vercel.app/api/cron/keepalive
```

Expected response:
```json
{
  "success": true,
  "timestamp": "2025-10-24T...",
  "projectCount": 0,
  "message": "Database activity logged successfully"
}
```

---

## 📊 How to Monitor

### Check if it's working:

**Option 1: Vercel Logs**
- Go to: https://vercel.com/xiaojunyang0805/stembot-v1/logs
- Filter by: `/api/cron/keepalive`
- Should see executions every 3 days

**Option 2: Supabase Dashboard**
- Go to: https://supabase.com/dashboard/project/kutpbtpdgptcmrlabekq/editor
- Check "Activity" → Should show queries every 3 days

**Option 3: Local Script Log**
- Run: `cat scripts/keepalive.log`
- Shows manual execution history

---

## ⏰ Timeline

- **Now:** Database activity generated (safe for next 7 days)
- **In 3 days:** Vercel cron will execute automatically
- **In 6 days:** Vercel cron will execute again (safe forever!)

---

## 🔄 Backup Plan (If Cron Fails)

If for any reason the cron job doesn't work, you can manually run:

```bash
node scripts/supabase-keepalive.js
```

This is instant and ensures your database stays active.

---

## 🎯 Summary

✅ **Immediate protection:** Local script ran successfully
✅ **Long-term automation:** Cron job deployed
🚨 **Action required:** Add CRON_SECRET to Vercel (takes 30 seconds)

**Once CRON_SECRET is added, you're fully protected from auto-pause forever!**
