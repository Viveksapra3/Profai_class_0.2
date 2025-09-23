import { NextResponse } from 'next/server';

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
    backend: process.env.NEXT_PUBLIC_NEXT_BACK_API || 'http://16.171.47.247:5001',
    timestamp: new Date().toISOString()
  });
}
