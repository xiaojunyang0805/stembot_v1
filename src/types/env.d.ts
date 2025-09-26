declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: 'development' | 'production' | 'test';

      readonly NEXT_PUBLIC_SUPABASE_URL: string;
      readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      readonly SUPABASE_SERVICE_ROLE_KEY: string;

      readonly NEXTAUTH_SECRET: string;
      readonly NEXTAUTH_URL: string;

      readonly GOOGLE_CLIENT_ID: string;
      readonly GOOGLE_CLIENT_SECRET: string;

      readonly OLLAMA_BASE_URL?: string;
      readonly OLLAMA_MODEL_CHAT?: string;
      readonly OLLAMA_MODEL_CODE?: string;
      readonly OLLAMA_MODEL_EMBED?: string;

      readonly HUGGINGFACE_API_KEY: string;

      readonly VECTOR_DIMENSIONS?: string;
      readonly VECTOR_SIMILARITY_THRESHOLD?: string;

      readonly NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
      readonly STRIPE_SECRET_KEY?: string;
      readonly STRIPE_WEBHOOK_SECRET?: string;

      readonly DEBUG_AI_RESPONSES?: string;
      readonly ENABLE_ANALYTICS?: string;

      readonly FEATURE_COLLABORATION?: string;
      readonly FEATURE_EDUCATOR_MODE?: string;
      readonly FEATURE_BILLING?: string;
    }
  }
}

export {};