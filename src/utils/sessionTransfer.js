/**
 * Handle session transfer from ProfAICoach to r3f project
 */
export async function handleSessionTransfer() {
  try {
    // Check if session transfer has already been processed
    const transferProcessed = sessionStorage.getItem('sessionTransferProcessed');
    if (transferProcessed) {
      console.log('Session transfer already processed, skipping...');
      const storedCourseId = sessionStorage.getItem('activeCourseId');
      const storedUserInfo = sessionStorage.getItem('transferredUserInfo');
      
      if (storedCourseId && storedUserInfo) {
        try {
          const parsedUserInfo = JSON.parse(storedUserInfo);
          return { 
            success: true, 
            courseId: storedCourseId, 
            userInfo: parsedUserInfo,
            method: 'already-processed'
          };
        } catch (parseError) {
          console.warn('Failed to parse stored user info:', parseError);
        }
      }
    }
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId');
    const sessionToken = urlParams.get('sessionToken');
    const userInfo = urlParams.get('userInfo');
    
    console.log('Session transfer - Full URL:', window.location.href);
    console.log('Session transfer - Search params:', window.location.search);
    console.log('Session transfer - All URL params:', Object.fromEntries(urlParams.entries()));
    console.log('Session transfer parameters:', {
      courseId,
      hasSessionToken: !!sessionToken,
      hasUserInfo: !!userInfo,
      sessionTokenPreview: sessionToken ? sessionToken.substring(0, 20) + '...' : null
    });
    
    if (!courseId) {
      // Check if we already have a transferred session stored
      const storedCourseId = sessionStorage.getItem('activeCourseId') || localStorage.getItem('transferredCourseId');
      const storedUserInfo = sessionStorage.getItem('transferredUserInfo');
      
      if (storedCourseId && storedUserInfo) {
        console.log('No courseId in URL, but found stored session data:', {
          courseId: storedCourseId,
          hasUserInfo: !!storedUserInfo
        });
        
        try {
          const parsedUserInfo = JSON.parse(storedUserInfo);
          return { 
            success: true, 
            courseId: storedCourseId, 
            userInfo: parsedUserInfo,
            method: 'stored-session'
          };
        } catch (parseError) {
          console.warn('Failed to parse stored user info:', parseError);
        }
      }
      
      console.warn('No courseId provided in URL parameters and no stored session found');
      return { success: false, error: 'No course ID provided' };
    }

    // If we have session transfer data, process it
    if (sessionToken || userInfo) {
      try {
        let parsedUserInfo = null;
        
        // Parse userInfo if provided
        if (userInfo) {
          try {
            // Handle both encoded and non-encoded userInfo
            const decodedUserInfo = decodeURIComponent(userInfo);
            parsedUserInfo = JSON.parse(decodedUserInfo);
          } catch (parseError) {
            console.warn('Failed to parse userInfo, trying direct parse:', parseError);
            try {
              parsedUserInfo = JSON.parse(userInfo);
            } catch (directParseError) {
              console.error('Failed to parse userInfo in any format:', directParseError);
              return { success: false, error: 'Invalid user info format' };
            }
          }
        }
        
        console.log('Parsed user info:', parsedUserInfo);
        
        // Try to transfer the session to the r3f backend
        // First try the session-transfer endpoint, fallback to session-validate
        let response;
        let transferMethod = 'session-transfer';
        
        try {
          console.log('Attempting session-transfer...');
          response = await fetch('/api/session-transfer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionToken,
              courseId,
              userInfo: parsedUserInfo,
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Session transfer failed with status: ${response.status}`);
          }
        } catch (error) {
          console.log('session-transfer endpoint failed, trying session-validate:', error.message);
          transferMethod = 'session-validate';
          
          // Fallback to session validation
          response = await fetch('/api/session-validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userInfo: parsedUserInfo,
              courseId,
            }),
          });
        }

        const result = await response.json();
        
        if (response.ok) {
          console.log(`Session transferred successfully via ${transferMethod}:`, result);
          
          // Store course ID and session info for the session
          try {
            sessionStorage.setItem('activeCourseId', courseId);
            localStorage.setItem('transferredCourseId', courseId);
            
            // Store user info for immediate access
            if (parsedUserInfo) {
              sessionStorage.setItem('transferredUserInfo', JSON.stringify(parsedUserInfo));
              
              // Also store in a cookie for server-side access
              const sessionData = {
                user: parsedUserInfo,
                courseId: courseId,
                timestamp: Date.now(),
                source: 'profai-coach-transfer'
              };
              
              // Set cookie with session data (expires in 1 hour)
              document.cookie = `transferred_session=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; max-age=3600; SameSite=Lax`;
              
              console.log('Session data stored successfully:', {
                sessionStorage: true,
                cookie: true,
                userInfo: parsedUserInfo
              });
            }
            
            // Mark session transfer as processed
            sessionStorage.setItem('sessionTransferProcessed', 'true');
          } catch (e) {
            console.warn('Failed to store session data:', e);
          }
          
          // Clean up URL parameters after successful transfer
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          
          return { success: true, courseId, userInfo: parsedUserInfo, method: transferMethod };
        } else {
          console.error(`Session transfer failed via ${transferMethod}:`, result);
          return { success: false, error: result.error || `Session transfer failed via ${transferMethod}` };
        }
      } catch (error) {
        console.error('Error during session transfer:', error);
        return { success: false, error: error.message };
      }
    }

    // If no session transfer data, just store the course ID
    try {
      sessionStorage.setItem('activeCourseId', courseId);
      localStorage.setItem('transferredCourseId', courseId);
      sessionStorage.setItem('sessionTransferProcessed', 'true');
    } catch (e) {
      console.warn('Failed to store course ID:', e);
    }

    console.log('No session transfer data, just storing course ID');
    return { success: true, courseId };
  } catch (error) {
    console.error('Session transfer handler error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get the transferred course ID
 */
export function getTransferredCourseId() {
  try {
    // Try sessionStorage first, then localStorage, then URL params
    const sessionCourseId = sessionStorage.getItem('activeCourseId');
    if (sessionCourseId) return sessionCourseId;
    
    const localCourseId = localStorage.getItem('transferredCourseId');
    if (localCourseId) return localCourseId;
    
    const urlParams = new URLSearchParams(window.location.search);
    const urlCourseId = urlParams.get('courseId');
    if (urlCourseId) return urlCourseId;
    
    return null;
  } catch (error) {
    console.error('Error getting transferred course ID:', error);
    return null;
  }
}
