/**
 * Integration Configuration for StemBot MVP
 * Handles integration between public frontend and private core
 */

const integrationConfig = {
  // Integration method: 'submodule', 'npm-package', or 'env-based'
  method: process.env.INTEGRATION_METHOD || 'env-based',

  // Private repository configuration
  privateRepo: {
    url: process.env.PRIVATE_REPO_URL || 'https://github.com/yourusername/stembot-mvp-core.git',
    branch: process.env.PRIVATE_REPO_BRANCH || 'main',
    path: process.env.PRIVATE_REPO_PATH || './core'
  },

  // API endpoint configuration for production
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.stembot.app',
    version: process.env.API_VERSION || 'v1',
    timeout: parseInt(process.env.API_TIMEOUT) || 30000
  },

  // Feature flags for integration
  features: {
    usePrivateComponents: process.env.USE_PRIVATE_COMPONENTS === 'true',
    enableCoreIntegration: process.env.ENABLE_CORE_INTEGRATION === 'true',
    fallbackToMocks: process.env.FALLBACK_TO_MOCKS === 'true'
  },

  // Development configuration
  development: {
    useMocks: process.env.NODE_ENV === 'development' && process.env.USE_MOCKS === 'true',
    debugIntegration: process.env.DEBUG_INTEGRATION === 'true',
    localCoreUrl: process.env.LOCAL_CORE_URL || 'http://localhost:3001'
  }
};

module.exports = integrationConfig;