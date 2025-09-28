import { NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const API_BASE = process.env.NEXT_PUBLIC_NEXT_BACK_API || 'http://16.171.47.247:5001';

// Generic proxy handler for any API endpoint not explicitly defined
export async function GET(request, { params }) {
  return handleRequest(request, params, 'GET');
}

export async function POST(request, { params }) {
  return handleRequest(request, params, 'POST');
}

export async function PUT(request, { params }) {
  return handleRequest(request, params, 'PUT');
}

export async function DELETE(request, { params }) {
  return handleRequest(request, params, 'DELETE');
}

export async function PATCH(request, { params }) {
  return handleRequest(request, params, 'PATCH');
}

async function handleRequest(request, params, method) {
  try {
    const { path } = params;
    const apiPath = Array.isArray(path) ? path.join('/') : path;
    const url = `${API_BASE.replace(/\/$/, '')}/api/${apiPath}`;
    
    // Get request body for methods that support it
    let body = null;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        body = await request.json();
      } catch {
        // No body or invalid JSON
      }
    }
    
    // Forward the request to the backend
    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Forward any cookies from the original request
        'Cookie': request.headers.get('cookie') || '',
      },
    };
    
    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, fetchOptions);
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
    console.error(`API proxy error for ${method} /${params.path}:`, error);
    return NextResponse.json(
      { error: 'API proxy error' },
      { status: 500 }
    );
  }
}
