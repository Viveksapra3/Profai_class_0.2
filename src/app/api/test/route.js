import { NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const API_BASE = process.env.NEXT_PUBLIC_NEXT_BACK_API || 'http://16.171.47.247:5001';

export async function GET() {
  const routes = [
    '/api/session',
    '/api/course/[id]',
    '/api/quiz/generate-course',
    '/api/quiz/generate-module', 
    '/api/quiz/submit',
    '/api/chat',
    '/api/logout'
  ];

  return NextResponse.json({
    message: 'API proxy routes are active',
    availableRoutes: routes,
    backend: API_BASE,
    timestamp: new Date().toISOString()
  });
}
