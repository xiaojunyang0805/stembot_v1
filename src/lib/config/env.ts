import { z } from 'zod';

const booleanString = (defaultValue: string) => z
  .string()
  .default(defaultValue)
  .refine((val) => val === 'true' || val === 'false', {
    message: 'Must be "true" or "false"',
  })
  .transform((val) => val === 'true');

const numberString = (defaultValue: string) => z
  .string()
  .default(defaultValue)
  .refine((val) => !isNaN(Number(val)), {
    message: 'Must be a valid number',
  })
  .transform(Number);

const urlString = z.string().url('Must be a valid URL');

const nonEmptyString = z.string().min(1, 'Cannot be empty');

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  NEXT_PUBLIC_SUPABASE_URL: urlString,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: nonEmptyString,
  SUPABASE_SERVICE_ROLE_KEY: nonEmptyString,

  NEXTAUTH_SECRET: nonEmptyString.min(32, 'Must be at least 32 characters'),
  NEXTAUTH_URL: urlString,

  GOOGLE_CLIENT_ID: nonEmptyString,
  GOOGLE_CLIENT_SECRET: nonEmptyString,

  OLLAMA_BASE_URL: urlString.default('http://localhost:11434'),
  OLLAMA_MODEL_CHAT: nonEmptyString.default('llama3.1:8b'),
  OLLAMA_MODEL_CODE: nonEmptyString.default('codellama:7b'),
  OLLAMA_MODEL_EMBED: nonEmptyString.default('nomic-embed-text'),

  HUGGINGFACE_API_KEY: nonEmptyString,

  VECTOR_DIMENSIONS: numberString('384'),
  VECTOR_SIMILARITY_THRESHOLD: z
    .string()
    .default('0.8')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 1, {
      message: 'Must be a number between 0 and 1',
    })
    .transform(Number),

  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  DEBUG_AI_RESPONSES: booleanString('false'),
  ENABLE_ANALYTICS: booleanString('false'),

  FEATURE_COLLABORATION: booleanString('false'),
  FEATURE_EDUCATOR_MODE: booleanString('false'),
  FEATURE_BILLING: booleanString('false'),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: urlString,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: nonEmptyString,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;
type ClientEnv = z.infer<typeof clientEnvSchema>;

class EnvironmentError extends Error {
  constructor(message: string, public errors: z.ZodError) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

function formatValidationErrors(error: z.ZodError): string {
  const errorMessages = error.issues.map((err) => {
    const path = err.path.join('.');
    return `  • ${path}: ${err.message}`;
  });

  return `Environment validation failed:\n${errorMessages.join('\n')}`;
}

function validateServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const errorMessage = formatValidationErrors(result.error);
    console.error('\n❌ Invalid environment configuration:\n');
    console.error(errorMessage);
    console.error('\n💡 Please check your .env.local file and ensure all required variables are set.\n');
    throw new EnvironmentError(errorMessage, result.error);
  }

  return result.data;
}

function validateClientEnv(): ClientEnv {
  const clientVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  };

  const result = clientEnvSchema.safeParse(clientVars);

  if (!result.success) {
    const errorMessage = formatValidationErrors(result.error);
    console.error('\n❌ Invalid client environment configuration:\n');
    console.error(errorMessage);
    console.error('\n💡 Please check your .env.local file and ensure all NEXT_PUBLIC_ variables are set.\n');
    throw new EnvironmentError(errorMessage, result.error);
  }

  return result.data;
}

let serverEnv: ServerEnv | null = null;
let clientEnv: ClientEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (!serverEnv) {
    serverEnv = validateServerEnv();
  }
  return serverEnv;
}

export function getClientEnv(): ClientEnv {
  if (!clientEnv) {
    clientEnv = validateClientEnv();
  }
  return clientEnv;
}

export function isProduction(): boolean {
  return getServerEnv().NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  return getServerEnv().NODE_ENV === 'development';
}

export function isTest(): boolean {
  return getServerEnv().NODE_ENV === 'test';
}

export function getFeatureFlags() {
  const env = getServerEnv();
  return {
    collaboration: env.FEATURE_COLLABORATION,
    educatorMode: env.FEATURE_EDUCATOR_MODE,
    billing: env.FEATURE_BILLING,
  };
}

export function getAiConfig() {
  const env = getServerEnv();
  return {
    ollamaBaseUrl: env.OLLAMA_BASE_URL,
    models: {
      chat: env.OLLAMA_MODEL_CHAT,
      code: env.OLLAMA_MODEL_CODE,
      embed: env.OLLAMA_MODEL_EMBED,
    },
    huggingfaceApiKey: env.HUGGINGFACE_API_KEY,
    debugResponses: env.DEBUG_AI_RESPONSES,
  };
}

export function getVectorConfig() {
  const env = getServerEnv();
  return {
    dimensions: env.VECTOR_DIMENSIONS,
    similarityThreshold: env.VECTOR_SIMILARITY_THRESHOLD,
  };
}

export function getSupabaseConfig() {
  const env = getServerEnv();
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function getAuthConfig() {
  const env = getServerEnv();
  return {
    secret: env.NEXTAUTH_SECRET,
    url: env.NEXTAUTH_URL,
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  };
}

export function getStripeConfig() {
  const env = getServerEnv();
  return {
    publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  };
}

export type { ServerEnv, ClientEnv };
export { EnvironmentError };