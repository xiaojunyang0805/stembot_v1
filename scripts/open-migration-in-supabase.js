#!/usr/bin/env node

/**
 * Helper script to open Supabase SQL Editor with migration ready to paste
 * Usage: node scripts/open-migration-in-supabase.js [migration-file.sql]
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Get migration file from command line
const migrationFile = process.argv[2] || 'supabase/migrations/20251003_create_project_methodology.sql';

// Resolve file path
const filePath = path.resolve(process.cwd(), migrationFile);

if (!fs.existsSync(filePath)) {
  console.error(`❌ Migration file not found: ${filePath}`);
  process.exit(1);
}

// Read SQL content
const sqlContent = fs.readFileSync(filePath, 'utf-8');

console.log('📋 Migration File:', path.basename(migrationFile));
console.log('📊 Size:', sqlContent.length, 'characters');
console.log('');
console.log('═'.repeat(60));
console.log('🚀 MANUAL MIGRATION INSTRUCTIONS');
console.log('═'.repeat(60));
console.log('');
console.log('1. Opening Supabase SQL Editor in your browser...');
console.log('   URL: https://supabase.com/dashboard/project/kutpbtpdgptcmrlabekq/sql/new');
console.log('');
console.log('2. Copy the SQL below (it\'s in your clipboard if you have pbcopy/clip):');
console.log('');
console.log('─'.repeat(60));
console.log(sqlContent);
console.log('─'.repeat(60));
console.log('');
console.log('3. Paste into SQL Editor and click "Run"');
console.log('');
console.log('4. Verify success:');
console.log('   - Check for "Success. No rows returned" message');
console.log('   - Or run: SELECT * FROM project_methodology LIMIT 1;');
console.log('');
console.log('═'.repeat(60));

// Try to copy to clipboard (OS-specific)
const platform = process.platform;
let clipboardCmd = null;

if (platform === 'darwin') {
  clipboardCmd = 'pbcopy';
} else if (platform === 'win32') {
  clipboardCmd = 'clip';
} else if (platform === 'linux') {
  clipboardCmd = 'xclip -selection clipboard';
}

if (clipboardCmd) {
  const child = exec(clipboardCmd);
  child.stdin.write(sqlContent);
  child.stdin.end();
  console.log('✅ SQL copied to clipboard!');
  console.log('');
}

// Open browser
const supabaseUrl = 'https://supabase.com/dashboard/project/kutpbtpdgptcmrlabekq/sql/new';

if (platform === 'darwin') {
  exec(`open "${supabaseUrl}"`);
} else if (platform === 'win32') {
  exec(`start "" "${supabaseUrl}"`);
} else if (platform === 'linux') {
  exec(`xdg-open "${supabaseUrl}"`);
}

console.log('🌐 Browser opened to Supabase SQL Editor');
console.log('');
