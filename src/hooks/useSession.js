"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet } from "@/lib/api";

export function useSession() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // First check if we have transferred session data
      const transferredUserInfo = sessionStorage.getItem('transferredUserInfo');
      if (transferredUserInfo) {
        try {
          const parsedUser = JSON.parse(transferredUserInfo);
          console.log('Using transferred session data:', parsedUser);
          setUser(parsedUser);
          setLoading(false);
          return;
        } catch (parseError) {
          console.warn('Failed to parse transferred user info:', parseError);
          // Continue with normal session check
        }
      }

      // Prepare headers for API call
      const headers = {};
      
      // If we have transferred user info, send it in headers as fallback
      if (transferredUserInfo) {
        headers['x-transferred-user'] = transferredUserInfo;
      }

      // Call session API with potential transferred user data
      const { ok, data } = await apiGet("/api/session", { headers });
      
      console.log('Session API response:', { ok, data });
      
      if (!ok || !data?.authenticated) {
        setUser(null);
        setError(data?.error || "Not authenticated");
      } else {
        setUser(data.user || null);
        console.log('Session loaded successfully:', data.user);
      }
    } catch (e) {
      console.error('Session refresh error:', e);
      setError("Failed to verify session");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { loading, user, error, refresh };
}
