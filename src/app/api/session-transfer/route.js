import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_NEXT_BACK_API || 'http://16.171.47.247:5001';

export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionToken, courseId, userInfo } = body;
    
    console.log('Session transfer request received:', {
      hasSessionToken: !!sessionToken,
      courseId,
      hasUserInfo: !!userInfo,
      userInfo: userInfo ? { id: userInfo.id, username: userInfo.username, role: userInfo.role } : null
    });
    
    // Since the backend doesn't have a session-transfer endpoint,
    // we'll create a temporary session validation response
    // In a production environment, you'd want to implement proper session management
    
    if (!userInfo || !courseId) {
      return NextResponse.json(
        { error: 'Missing required session transfer data' },
        { status: 400 }
      );
    }
    
    // Validate the session token if provided
    let isValidToken = true;
    if (sessionToken) {
      try {
        const decoded = JSON.parse(atob(sessionToken));
        if (!decoded.userId || !decoded.timestamp || !decoded.source) {
          isValidToken = false;
        }
        // Check if token is not too old (1 hour max)
        const tokenAge = Date.now() - decoded.timestamp;
        if (tokenAge > 60 * 60 * 1000) {
          isValidToken = false;
        }
      } catch (error) {
        console.warn('Invalid session token format:', error);
        isValidToken = false;
      }
    }
    
    // Create session data for the r3f project
    const sessionData = {
      authenticated: true,
      user: {
        id: userInfo.id,
        username: userInfo.username,
        email: userInfo.email,
        role: userInfo.role
      },
      course_id: courseId,
      timestamp: Date.now(),
      source: 'profai-coach-transfer',
      sessionToken: sessionToken,
      tokenValid: isValidToken
    };
    
    console.log('Session transfer successful:', {
      userId: userInfo.id,
      courseId,
      tokenValid: isValidToken
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      session: sessionData,
      message: 'Session transferred successfully',
      method: 'direct-transfer'
    });
    
  } catch (error) {
    console.error('Session transfer API error:', error);
    return NextResponse.json(
      { error: 'Failed to transfer session: ' + error.message },
      { status: 500 }
    );
  }
}
