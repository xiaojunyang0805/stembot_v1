# Environment Validation System

This directory contains a comprehensive environment validation system for StemBot v1, providing type-safe environment variable handling with runtime validation.

## Files Overview

- `env.ts` - Main environment configuration with Zod schemas and typed exports
- `validate-env.ts` - Runtime validation utilities with helpful error messages
- `init.ts` - Initialization script for environment validation
- `index.ts` - Exports all environment utilities

## Features

✅ **Zod validation schema** - Validates all environment variables with proper types
✅ **TypeScript type safety** - Full type safety for client vs server separation
✅ **Runtime validation** - Helpful error messages for missing/invalid variables
✅ **Build-time validation** - Integrated with Next.js configuration
✅ **Helper functions** - Utility functions for accessing config groups

## Usage

### Basic Usage

```typescript
import { getServerEnv, getClientEnv } from '@/lib/config';

// Server-side only
const serverEnv = getServerEnv();
const supabaseConfig = getSupabaseConfig();
const aiConfig = getAiConfig();

// Client-side safe
const clientEnv = getClientEnv();
```

### Helper Functions

```typescript
import {
  isProduction,
  isDevelopment,
  getFeatureFlags,
  getAiConfig,
  getVectorConfig,
  getSupabaseConfig,
  getAuthConfig,
  getStripeConfig
} from '@/lib/config';

// Environment checks
if (isProduction()) {
  // Production-only code
}

// Feature flags
const features = getFeatureFlags();
if (features.collaboration) {
  // Collaboration features
}

// Configuration groups
const ai = getAiConfig();
const vector = getVectorConfig();
const auth = getAuthConfig();
```

## Environment Variables

### Required Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXTAUTH_SECRET` - NextAuth secret (min 32 chars)
- `NEXTAUTH_URL` - NextAuth URL
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `HUGGINGFACE_API_KEY` - HuggingFace API key

### Optional Variables with Defaults

- `NODE_ENV` - Environment mode (default: 'development')
- `OLLAMA_BASE_URL` - Ollama server URL (default: 'http://localhost:11434')
- `OLLAMA_MODEL_CHAT` - Chat model (default: 'llama3.1:8b')
- `OLLAMA_MODEL_CODE` - Code model (default: 'codellama:7b')
- `OLLAMA_MODEL_EMBED` - Embedding model (default: 'nomic-embed-text')
- `VECTOR_DIMENSIONS` - Vector dimensions (default: 384)
- `VECTOR_SIMILARITY_THRESHOLD` - Similarity threshold (default: 0.8)
- `DEBUG_AI_RESPONSES` - Debug AI responses (default: false)
- `ENABLE_ANALYTICS` - Enable analytics (default: false)
- `FEATURE_COLLABORATION` - Enable collaboration (default: false)
- `FEATURE_EDUCATOR_MODE` - Enable educator mode (default: false)
- `FEATURE_BILLING` - Enable billing (default: false)

### Optional Variables

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

## Scripts

- `npm run env:check` - Validate environment configuration
- `npm run env:validate` - Same as env:check

## Error Handling

The system provides detailed error messages when validation fails:

```
❌ Invalid environment configuration:

  • NEXTAUTH_SECRET: Must be at least 32 characters
  • NEXT_PUBLIC_SUPABASE_URL: Must be a valid URL
  • HUGGINGFACE_API_KEY: Cannot be empty

💡 Please check your .env.local file and ensure all required variables are set.
```

## Type Safety

The system provides separate types for server and client environments:

```typescript
type ServerEnv = {
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  // ... all server variables
}

type ClientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
}
```

## Integration

The environment validation is integrated with:

1. **Next.js Configuration** - Validates at build time
2. **TypeScript** - Provides type definitions
3. **Runtime** - Validates during application startup

## Best Practices

1. Always use the helper functions instead of accessing `process.env` directly
2. Use `getServerEnv()` only in server-side code
3. Use `getClientEnv()` for client-safe variables
4. Check feature flags before implementing conditional features
5. Use the configuration groups for related settings