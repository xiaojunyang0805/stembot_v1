// Cache invalidation endpoint for Vercel edge functions
export async function GET() {
  return new Response(
    JSON.stringify({
      message: 'Cache invalidated',
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA || 'local'
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }
  );
}

export async function POST() {
  return GET();
}