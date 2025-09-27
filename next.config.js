/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  // Force cache invalidation
  generateBuildId: async () => {
    // Use git commit SHA or timestamp for unique build IDs
    return process.env.VERCEL_GIT_COMMIT_SHA || `build-${Date.now()}`;
  },
  env: {
    BUILD_DATE: new Date().toISOString(),
    BUILD_VERSION: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
    DEPLOYMENT_ENV: process.env.VERCEL_ENV || 'development',
    APP_VERSION: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
    NEXT_PUBLIC_APP_VERSION: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString(),
    NEXT_PUBLIC_DEPLOYMENT_ENV: process.env.VERCEL_ENV || 'development',
    FORCE_REFRESH: 'v14-VERCEL-CONFIG-FIX',
  },
  // Aggressive cache busting for immediate updates
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  // Build optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable concurrent builds and faster compilation
  swcMinify: true,
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/hooks': path.resolve(__dirname, 'src/hooks'),
      '@/types': path.resolve(__dirname, 'src/types'),
      '@/styles': path.resolve(__dirname, 'src/styles'),
      '@/utils': path.resolve(__dirname, 'src/lib/utils'),
      '@/app': path.resolve(__dirname, 'src/app'),
      '@/public': path.resolve(__dirname, 'public'),
    }

    // Exclude problematic files from pdf-parse test data
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        crypto: false,
      }
    }

    return config
  },
};

module.exports = nextConfig;