/** @type {import('jest').Config} */

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Test Environment
  testEnvironment: 'jsdom',

  // Setup Files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Module Path Mapping (matching tsconfig.json paths)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@/utils/(.*)$': '<rootDir>/src/lib/utils/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/public/(.*)$': '<rootDir>/public/$1',
    
    // Handle CSS imports (with identity-obj-proxy)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__tests__/mocks/fileMock.js',
  },

  // Test Match Patterns
  testMatch: [
    '<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],

  // Coverage Configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.config.{js,ts}',
    '!src/app/**/layout.tsx',
    '!src/app/**/loading.tsx',
    '!src/app/**/not-found.tsx',
    '!src/app/**/error.tsx',
    '!src/middleware.ts',
    '!src/lib/database/migrations/**',
    '!src/types/**',
  ],

  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary',
  ],

  coverageDirectory: 'coverage',

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    // Specific thresholds for critical modules
    'src/lib/ai/**': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    'src/lib/auth/**': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    'src/lib/gamification/**': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },

  // Transform Configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  transformIgnorePatterns: [
    '/node_modules/(?!(@supabase|@radix-ui|lucide-react|recharts|uuid|nanoid)/)',
  ],

  // Test Environment Options
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },

  // Module Directories
  moduleDirectories: ['node_modules', '<rootDir>/'],

  // File Extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Globals
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },

  // Test Timeout
  testTimeout: 30000,

  // Watch Mode Configuration
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],

  // Reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './coverage',
        outputName: 'junit.xml',
      },
    ],
  ],

  // Error Handling
  errorOnDeprecated: true,
  verbose: true,

  // Performance
  maxWorkers: '50%',
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',

  // Mock Configuration
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Snapshot Configuration
  snapshotSerializers: ['@emotion/jest/serializer'],

  // Custom Test Patterns
  projects: [
    {
      displayName: 'unit',
      testMatch: [
        '<rootDir>/__tests__/unit/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      ],
      testEnvironment: 'jsdom',
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/__tests__/integration/**/*.{js,jsx,ts,tsx}'],
      testEnvironment: 'node',
    },
  ],

  // Environment Variables for Testing
  setupFiles: ['<rootDir>/jest.env.js'],
};

// Create jest config with Next.js integration
module.exports = createJestConfig(customJestConfig);