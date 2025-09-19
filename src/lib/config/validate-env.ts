import { EnvironmentError, getServerEnv, getClientEnv } from './env';

export function validateServerEnvironment(): void {
  try {
    getServerEnv();
    console.log('✅ Server environment validation passed');
  } catch (error) {
    if (error instanceof EnvironmentError) {
      console.error('\n🚨 SERVER ENVIRONMENT VALIDATION FAILED\n');
      console.error('The following environment variables are missing or invalid:\n');

      error.errors.issues.forEach((err) => {
        const path = err.path.join('.');
        console.error(`❌ ${path}: ${err.message}`);
      });

      console.error('\n📝 To fix this issue:');
      console.error('1. Check your .env.local file in the project root');
      console.error('2. Ensure all required variables are set with valid values');
      console.error('3. Use .env.example as a reference for the expected format');
      console.error('4. Restart your development server after making changes\n');

      throw error;
    }
    throw error;
  }
}

export function validateClientEnvironment(): void {
  try {
    getClientEnv();
    console.log('✅ Client environment validation passed');
  } catch (error) {
    if (error instanceof EnvironmentError) {
      console.error('\n🚨 CLIENT ENVIRONMENT VALIDATION FAILED\n');
      console.error('The following NEXT_PUBLIC_ environment variables are missing or invalid:\n');

      error.errors.issues.forEach((err) => {
        const path = err.path.join('.');
        console.error(`❌ ${path}: ${err.message}`);
      });

      console.error('\n📝 To fix this issue:');
      console.error('1. Check your .env.local file in the project root');
      console.error('2. Ensure all NEXT_PUBLIC_ variables are set with valid values');
      console.error('3. These variables must be available at build time');
      console.error('4. Rebuild your application after making changes\n');

      throw error;
    }
    throw error;
  }
}

export function validateEnvironmentComplete(): void {
  console.log('🔍 Validating environment configuration...\n');

  validateServerEnvironment();
  validateClientEnvironment();

  console.log('\n🎉 All environment variables are valid and ready to use!\n');
}

let validated = false;

export function ensureEnvironmentValidated(): void {
  if (!validated) {
    validateEnvironmentComplete();
    validated = true;
  }
}