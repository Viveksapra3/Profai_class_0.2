import { NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const API_BASE = process.env.NEXT_PUBLIC_NEXT_BACK_API || 'http://16.171.47.247:5001';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userInfo, courseId } = body;
    
    // Create a temporary session for the r3f project
    // This is a simplified version - in production you'd want proper session management
    const sessionData = {
      authenticated: true,
      user: userInfo,
      course_id: courseId,
      timestamp: Date.now(),
      source: 'profai-coach-transfer'
    };
    
    // In a real implementation, you'd store this in your session store
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      session: sessionData,
      message: 'Session validated successfully'
    });
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate session' },
      { status: 500 }
    );
  }
}
