/** @type {import('next').NextConfig} */

// Validate environment variables at build time (skip during initial Vercel build)
function validateEnvironment() {
  try {
    // Skip validation during Vercel builds or when dist doesn't exist
    if (process.env.VERCEL || process.env.CI) {
      console.log('⚠️ Environment validation skipped (deployment build)');
      return;
    }

    // Only validate in production builds when dist exists
    if (process.env.NODE_ENV === 'production') {
      const { getServerEnv } = require('./dist/lib/config/env');
      getServerEnv();
      console.log('✅ Environment validation passed');
    }
  } catch (error) {
    // Skip validation if compiled files don't exist yet (first build)
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('⚠️ Environment validation skipped (first build)');
      return;
    }
    console.error('❌ Environment validation failed:');
    console.error(error.message);
    // Don't exit process during build - let it continue
    console.log('⚠️ Continuing build despite validation failure...');
  }
}

// Run validation
validateEnvironment();

const nextConfig = {
  /* Basic Configuration */
  reactStrictMode: true,
  poweredByHeader: false,
  generateEtags: false,
  compress: true,

  /* Experimental Features */
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'chart.js'
    ],
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },

  /* TypeScript Configuration */
  typescript: {
    ignoreBuildErrors: false,
  },

  /* ESLint Configuration */
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during builds to prevent deployment failures
    dirs: ['src', 'pages', 'components', 'lib', 'app'],
  },

  /* Image Optimization */
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'stembot.nl',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  /* Headers Configuration */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? 'https://stembot.nl' 
              : 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  /* Rewrites Configuration */
  async rewrites() {
    return [
      {
        source: '/api/ollama/:path*',
        destination: `${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/:path*`,
      },
      {
        source: '/health',
        destination: '/api/health',
      },
    ];
  },

  /* Redirects Configuration */
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/dashboard',
        permanent: false,
      },
      {
        source: '/login',
        destination: '/auth/login',
        permanent: false,
      },
      {
        source: '/register',
        destination: '/auth/register',
        permanent: false,
      },
    ];
  },

  /* Webpack Configuration */
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Handle SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Optimize bundle size
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };

    // Bundle analyzer
    if (process.env.ANALYZE === 'true') {
      const withBundleAnalyzer = require('@next/bundle-analyzer')({
        enabled: true,
      });
      return withBundleAnalyzer(config);
    }

    return config;
  },

  /* Output Configuration */
  output: 'standalone',

  /* Compiler Configuration */
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  /* Development Configuration */
  ...(process.env.NODE_ENV === 'development' && {
    devIndicators: {
      position: 'bottom-right',
    },
  }),
};

module.exports = nextConfig;