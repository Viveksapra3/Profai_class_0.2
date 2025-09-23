"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";


export const CourseDropdown = () => {
  const [courseId, setCourseId] = useState("");
  const [sessionCourseId, setSessionCourseId] = useState("");
  const [course, setCourse] = useState(null);
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Load session to obtain course_id from authenticated page
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const url = `/api/session`;
        const res = await fetch(url, { credentials: "include" });
        
        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to fetch session:", res.status, text);
          console.log("Fallback: No session found, will try URL params or sessionStorage");
          return;
        }

        const data = await res.json();
        console.log("Session data received:", data);
        
        const cid = data?.session?.course_id || data?.course_id || "";
        if (cid) {
          console.log("Course ID found in session:", cid);
          setSessionCourseId(String(cid));
        } else {
          console.log("No course_id found in session data");
        }
      } catch (e) {
        console.error("Network error while fetching session:", e);
        console.log("Fallback: Will try URL params or sessionStorage");
      }
    };

    fetchSession();
  }, []);

  // Read courseId from query params or sessionStorage
  useEffect(() => {
    try {
      const q = searchParams?.get("courseId");
      if (q && q !== courseId) {
        console.log("Course ID found in URL params:", q);
        setCourseId(q);
        sessionStorage.setItem("activeCourseId", q);
      } else if (!q) {
        const stored = sessionStorage.getItem("activeCourseId") || "";
        if (stored && stored !== courseId) {
          console.log("Course ID found in sessionStorage:", stored);
          setCourseId(stored);
        }
      }
    } catch (e) {
      console.error("Error reading courseId from URL or sessionStorage:", e);
    }
  }, [searchParams, courseId]);

  // Fetch course details when courseId or sessionCourseId changes
  useEffect(() => {
    let cancelled = false;

    const fetchCourseData = async () => {
      const id = String(sessionCourseId || courseId || "").trim();
      
      if (!id) {
        console.log("No course ID available - waiting for session or URL params");
        setCourse(null);
        setLoading(false);
        return;
      }

      console.log("Fetching course data for ID:", id);
      setLoading(true);
      setError(null);

      try {
        const url = `/api/course/${encodeURIComponent(id)}`;
        console.log("Fetching course from URL:", url);

        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to fetch course:", res.status, text);
          console.error("Response headers:", Object.fromEntries(res.headers.entries()));
          
          if (res.status === 404) {
            setError(`Course not found (ID: ${id})`);
          } else if (res.status === 401) {
            setError("Unauthorized - please login");
          } else if (res.status === 403) {
            setError("Access forbidden to this course");
          } else {
            setError(`Failed to fetch course: ${res.status} ${res.statusText}`);
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        console.log("Course data received:", data);

        if (!cancelled) {
          setCourse(data || null);
          
          // Set first module as selected if available
          if (data && Array.isArray(data.modules) && data.modules.length > 0) {
            console.log("Setting first module as selected:", data.modules[0]);
            setSelectedModuleIdx(0);
          } else {
            console.log("No modules found in course data");
          }
        }
      } catch (e) {
        console.error("Network error while fetching course:", e);
        if (!cancelled) {
          setError("Network error - please check your connection");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCourseData();
    return () => { cancelled = true; };
  }, [courseId, sessionCourseId]);

  if (loading) {
    if (!isVisible) {
      return (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed top-4 left-4 z-50 bg-slate-600/80 hover:bg-slate-600 text-white p-3 rounded-full shadow-lg backdrop-blur-sm border border-white/20 transition-all"
          title="Show Course"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </button>
      );
    }
    
    return (
      <div className="fixed top-4 left-4 bottom-4 w-96 z-40">
        <div className="h-full bg-gradient-to-tr from-slate-300/30 via-gray-400/30 to-slate-600/30 backdrop-blur-md border border-slate-100/30 rounded-xl flex flex-col shadow-2xl">
          <div className="p-4 border-b border-white/20 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-white text-lg font-semibold">Loading...</div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-white/60 hover:text-white/90 p-1 rounded transition-colors"
                title="Hide Course"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-white text-sm">Loading course...</div>
              <div className="mt-2 w-6 h-6 border-2 border-white/30 border-t-white/70 rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    if (!isVisible) {
      return (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed top-4 left-4 z-50 bg-slate-600/80 hover:bg-slate-600 text-white p-3 rounded-full shadow-lg backdrop-blur-sm border border-white/20 transition-all"
          title="Show Course"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </button>
      );
    }
    
    return (
      <div className="fixed top-4 left-4 bottom-4 w-96 z-40">
        <div className="h-full bg-gradient-to-tr from-red-300/30 via-red-400/30 to-red-600/30 backdrop-blur-md border border-red-100/30 rounded-xl flex flex-col shadow-2xl">
          <div className="p-4 border-b border-white/20 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-white text-lg font-semibold">Error</div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-white/60 hover:text-white/90 p-1 rounded transition-colors"
                title="Hide Course"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 flex items-center justify-center">
            <div className="text-center">
              <div className="text-white text-sm mb-2">Error: {error}</div>
              <div className="text-white/80 text-xs">
                Course ID: {sessionCourseId || courseId || "None"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    if (!isVisible) {
      return (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed top-4 left-4 z-50 bg-slate-600/80 hover:bg-slate-600 text-white p-3 rounded-full shadow-lg backdrop-blur-sm border border-white/20 transition-all"
          title="Show Course"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </button>
      );
    }
    
    return (
      <div className="fixed top-4 left-4 bottom-4 w-96 z-40">
        <div className="h-full bg-gradient-to-tr from-yellow-300/30 via-yellow-400/30 to-yellow-600/30 backdrop-blur-md border border-yellow-100/30 rounded-xl flex flex-col shadow-2xl">
          <div className="p-4 border-b border-white/20 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-white text-lg font-semibold">No Course</div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-white/60 hover:text-white/90 p-1 rounded transition-colors"
                title="Hide Course"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 flex items-center justify-center">
            <div className="text-center">
              <div className="text-white text-sm">No course selected</div>
              <div className="text-white/80 text-xs mt-1">
                Waiting for course ID from session or URL
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show toggle button when dropdown is hidden
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-4 left-4 z-50 bg-slate-600/80 hover:bg-slate-600 text-white p-3 rounded-full shadow-lg backdrop-blur-sm border border-white/20 transition-all"
        title="Show Course"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </button>
    );
  }

  return (
    <>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
      <div className="fixed top-4 left-4 bottom-4 w-96 z-40">
        <div className="h-full bg-gradient-to-tr from-slate-600 via-gray-600 to-slate-600 border border-slate-100 rounded-xl flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-white text-lg font-semibold">
              {course?.title || course?.name || "Course"}
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/60 hover:text-white/90 p-1 rounded transition-colors"
              title="Hide Course"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto p-4 custom-scrollbar"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
          }}
        >
          {course && Array.isArray(course.modules) && course.modules.length > 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Select Module
                </label>
                <select
                  value={selectedModuleIdx}
                  onChange={(e) => setSelectedModuleIdx(Number(e.target.value))}
                  className="w-full bg-slate-900/60 text-white px-3 py-2 rounded-md border border-white/20"
                >
                  {course.modules.map((m, idx) => (
                    <option key={idx} value={idx}>
                      {`${m.week ? `Week ${m.week} — ` : ""}${m.title}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Show selected module details */}
              <div>
                <h4 className="text-white font-semibold text-sm mb-3">
                  Module: {course.modules[selectedModuleIdx]?.title}
                </h4>
                
                {course.modules[selectedModuleIdx]?.sub_topics && (
                  <div className="space-y-3">
                    <div className="text-white text-xs font-medium">Subtopics:</div>
                    {course.modules[selectedModuleIdx].sub_topics.map((st, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <div className="text-white text-sm font-medium mb-2">{st.title}</div>
                        {st.content && (
                          <div className="text-white/90 text-xs leading-relaxed whitespace-pre-wrap">
                            {st.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {(!course?.modules || course.modules.length === 0) && (
            <div className="text-white text-sm">No modules available</div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};