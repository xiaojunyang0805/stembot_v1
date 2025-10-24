#!/usr/bin/env node
/**
 * Supabase Keep-Alive Script
 *
 * Purpose: Generates minimal database activity to prevent automatic pausing
 * on Supabase's free tier (requires activity every 7 days)
 *
 * Usage:
 *   node scripts/supabase-keepalive.js
 *
 * Scheduling (Windows Task Scheduler):
 *   - Set to run every 3 days to stay well within 7-day window
 *   - Action: Start a program
 *   - Program: C:\Program Files\nodejs\node.exe
 *   - Arguments: "D:\stembot-mvp\stembot_v1\scripts\supabase-keepalive.js"
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function keepAlive() {
  console.log('🔄 Running Supabase keep-alive check...');
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);

  try {
    // Simple query to generate activity - just count projects
    const { data, error, count } = await supabase
      .from('research_projects')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Database query failed:', error.message);
      process.exit(1);
    }

    console.log(`✅ Database active - ${count || 0} projects exist`);
    console.log('✨ Keep-alive successful! Next check recommended in 3-5 days.');

    // Log to file for tracking
    const fs = require('fs');
    const logPath = require('path').join(__dirname, 'keepalive.log');
    const logEntry = `${new Date().toISOString()} - Success - ${count || 0} projects\n`;
    fs.appendFileSync(logPath, logEntry);

    process.exit(0);
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

keepAlive();
