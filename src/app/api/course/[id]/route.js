import { NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const API_BASE = process.env.NEXT_PUBLIC_NEXT_BACK_API || 'http://16.171.47.247:5001';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const url = `${API_BASE.replace(/\/$/, '')}/api/course/${encodeURIComponent(id)}`;
    
    // Forward the request to the backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward any cookies from the original request
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    const data = await response.json();

    // Create the response
    const nextResponse = NextResponse.json(data, { status: response.status });
    
    // Forward any set-cookie headers from the backend
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      nextResponse.headers.set('set-cookie', setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    console.error('Course API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}
