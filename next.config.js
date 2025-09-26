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
  // Force Vercel to use latest commit
  env: {
    BUILD_DATE: new Date().toISOString(),
    FORCE_REFRESH: 'v3',
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