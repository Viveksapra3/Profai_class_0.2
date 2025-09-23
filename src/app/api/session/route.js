import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_NEXT_BACK_API || 'http://16.171.47.247:5001';

export async function GET(request) {
  try {
    // First check if we have a transferred session stored in cookies or headers
    const cookieStore = cookies();
    const transferredSession = cookieStore.get('transferred_session');
    
    if (transferredSession) {
      try {
        const sessionData = JSON.parse(transferredSession.value);
        console.log('Using transferred session from cookie:', sessionData);
        return NextResponse.json({
          authenticated: true,
          user: sessionData.user,
          source: 'transferred_session'
        });
      } catch (parseError) {
        console.warn('Failed to parse transferred session cookie:', parseError);
      }
    }

    // Check for session data in request headers (for client-side transfers)
    const transferredUserHeader = request.headers.get('x-transferred-user');
    if (transferredUserHeader) {
      try {
        const userData = JSON.parse(transferredUserHeader);
        console.log('Using transferred session from header:', userData);
        return NextResponse.json({
          authenticated: true,
          user: userData,
          source: 'transferred_header'
        });
      } catch (parseError) {
        console.warn('Failed to parse transferred user header:', parseError);
      }
    }

    // Fallback: try to get session from backend
    try {
      const url = `${API_BASE.replace(/\/$/, '')}/api/session`;
      
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
      const nextResponse = NextResponse.json({
        ...data,
        source: 'backend_session'
      }, { status: response.status });
      
      // Forward any set-cookie headers from the backend
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        nextResponse.headers.set('set-cookie', setCookieHeader);
      }

      return nextResponse;
    } catch (backendError) {
      console.warn('Backend session check failed:', backendError.message);
      
      // If backend fails, return unauthenticated
      return NextResponse.json(
        { authenticated: false, error: 'No valid session found', source: 'no_session' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session: ' + error.message },
      { status: 500 }
    );
  }
}
