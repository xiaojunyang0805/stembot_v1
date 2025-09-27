// Global CDN cache invalidation for main domain
export async function GET() {
  // Force global CDN cache invalidation
  const timestamp = Date.now();

  return new Response(
    JSON.stringify({
      message: 'Global CDN cache invalidated',
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
      cacheBreaker: timestamp,
      domain: process.env.VERCEL_URL || 'local'
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0, proxy-revalidate',
        'Surrogate-Control': 'no-store',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Cache-Bust': timestamp.toString()
      }
    }
  );
}

export async function POST() {
  return GET();
}