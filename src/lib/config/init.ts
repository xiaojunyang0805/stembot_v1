import { ensureEnvironmentValidated } from './validate-env';

let initialized = false;

export function initializeEnvironment(): void {
  if (initialized) {
    return;
  }

  ensureEnvironmentValidated();
  initialized = true;
}

if (typeof window === 'undefined') {
  initializeEnvironment();
}