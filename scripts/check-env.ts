#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { validateEnvironmentComplete } from '../src/lib/config/validate-env';

try {
  validateEnvironmentComplete();
  process.exit(0);
} catch (error) {
  console.error('\n❌ Environment check failed. Please fix the issues above before proceeding.\n');
  process.exit(1);
}