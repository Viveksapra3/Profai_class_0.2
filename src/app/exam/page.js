"use client"

import React, { useEffect, useState, useRef } from "react";
import { SessionGate } from "@/components/SessionGate";
import { useRouter, useSearchParams } from "next/navigation";
import { getTransferredCourseId } from "@/utils/sessionTransfer";

// NOTE: This component only performs a single network request: a POST to
// `${process.env.NEXT_PUBLIC_NEXT_BACK_API}/course/${courseId}` with body { course_id }
// Make sure to define NEXT_PUBLIC_NEXT_BACK_API in your environment (.env.local):
// NEXT_PUBLIC_NEXT_BACK_API=https://api.example.com

export default function ExamPage({
  questions = [],
  timeLimit = 15 * 60,
  onSubmit = (res) => console.log("Quiz results", res),
  _allowReview = true,
  shuffle = false,
}) {
  const search = useSearchParams();
  const router = useRouter();
  const [courseId, setCourseId] = useState("");
  const [course, setCourse] = useState(null);
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);
  
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [sessionCourseId, setSessionCourseId] = useState("");

  const activeQuestions = generatedQuestions.length ? generatedQuestions : questions;

  // Load session to obtain course_id
  useEffect(() => {
    (async () => {
      try {
        const url = `/api/session`;
        const res = await fetch(url, { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        const cid = data?.session?.course_id || data?.course_id || "";
        if (cid) setSessionCourseId(String(cid));
      } catch {}
    })();
  }, []);

  // Read courseId from query, sessionStorage, or transferred session
  useEffect(() => {
    try {
      const q = search?.get("courseId");
      if (q && q !== courseId) {
        setCourseId(q);
        sessionStorage.setItem("activeCourseId", q);
      } else if (!q) {
        // Try to get from transferred session first, then fallback to sessionStorage
        const transferredId = getTransferredCourseId();
        const stored = transferredId || sessionStorage.getItem("activeCourseId") || "";
        if (stored && stored !== courseId) {
          setCourseId(stored);
          console.log('Using course ID from transfer/storage:', stored);
        }
      }
    } catch (error) {
      console.error('Error setting course ID:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Fetch course details using GET to `${NEXT_PUBLIC_NEXT_BACK_API}/api/course/${courseId}`
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!courseId) return;
      const url = `/api/course/${encodeURIComponent(courseId)}`;
      try {
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to fetch course:", res.status, text);
          return;
        }
        const data = await res.json();
        if (!cancelled) setCourse(data || null);
        // default to first module
        if (data && Array.isArray(data.modules) && data.modules.length > 0) {
          setSelectedModuleIdx(0);
        }
      } catch (e) {
        console.error("Network error while fetching course:", e);
      }
    })();
    return () => { cancelled = true; };
  }, [courseId]);

  // No inline quiz renderer; QuizExam component will handle timing and grading

  async function handleStartCourseExam() {
    try {
      setQuizError("");
      setQuizLoading(true);
      const url = `/api/quiz/generate-course`;
      const payload = {
        quiz_type: "quiz",
        course_id: String(sessionCourseId || courseId || ""),
        module_week: 0,
      };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      console.log("Course quiz generation response:", data);
      if (!res.ok) throw new Error(data?.error || "Failed to generate course quiz");

      const qArr = Array.isArray(data?.quiz?.questions) ? data.quiz.questions : (Array.isArray(data?.questions) ? data.questions : []);
      
      // Try multiple possible locations for quiz ID
      const quizId = data?.quiz?.id || 
                     data?.quiz?.quiz_id || 
                     data?.quiz_id || 
                     data?.id || 
                     data?.quizId ||
                     data?.quiz?.quizId ||
                     null;
                     
      console.log("Extracted course quiz ID:", quizId);
      console.log("Available data keys:", Object.keys(data));
      if (data.quiz) console.log("Quiz object keys:", Object.keys(data.quiz));
      
      // Log all possible ID fields for debugging
      console.log("Course quiz ID field search:", {
        "data.quiz.id": data?.quiz?.id,
        "data.quiz.quiz_id": data?.quiz?.quiz_id,
        "data.quiz_id": data?.quiz_id,
        "data.id": data?.id,
        "data.quizId": data?.quizId,
        "data.quiz.quizId": data?.quiz?.quizId
      });
      
      if (!qArr.length) throw new Error("No questions returned");
      const normalized = qArr.map((q, i) => ({
        id: q.id || `q${i + 1}`,
        type: "single",
        title: q.title || q.question || q.question_text || `Question ${i + 1}`,
        options: Array.isArray(q.options) ? q.options : [],
        correct: q.correct ?? q.correct_answer ?? undefined,
        marks: q.marks || 1,
      }));
      setGeneratedQuestions(normalized);
      try {
        localStorage.setItem("exam:generatedQuestions", JSON.stringify(normalized));
        if (quizId) {
          localStorage.setItem("exam:quizMeta", JSON.stringify({ quiz_id: String(quizId) }));
          console.log("Saved course quiz metadata with ID:", quizId);
        } else {
          console.warn("No course quiz ID found in response - submission may fail");
        }
      } catch {}
      router.push("/exam/run");
    } catch (e) {
      setQuizError(e?.message || "Failed to start course exam");
    } finally {
      setQuizLoading(false);
    }
  }

  async function handleStartModuleExam() {
    try {
      setQuizError("");
      setQuizLoading(true);
      const url = `/api/quiz/generate-module`;
      const week = Number(course?.modules?.[selectedModuleIdx]?.week ?? selectedModuleIdx + 1) || 0;
      const payload = {
        quiz_type: "quiz",
        course_id: String(sessionCourseId || courseId || ""),
        module_week: week,
      };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      console.log("Quiz generation response:", data);
      if (!res.ok) throw new Error(data?.error || "Failed to generate module quiz");

      const qArr = Array.isArray(data?.quiz?.questions) ? data.quiz.questions : (Array.isArray(data?.questions) ? data.questions : []);
      
      // Try multiple possible locations for quiz ID
      const quizId = data?.quiz?.id || 
                     data?.quiz?.quiz_id || 
                     data?.quiz_id || 
                     data?.id || 
                     data?.quizId ||
                     data?.quiz?.quizId ||
                     null;
                     
      console.log("Extracted quiz ID:", quizId);
      console.log("Available data keys:", Object.keys(data));
      if (data.quiz) console.log("Quiz object keys:", Object.keys(data.quiz));
      
      // Log all possible ID fields for debugging
      console.log("ID field search:", {
        "data.quiz.id": data?.quiz?.id,
        "data.quiz.quiz_id": data?.quiz?.quiz_id,
        "data.quiz_id": data?.quiz_id,
        "data.id": data?.id,
        "data.quizId": data?.quizId,
        "data.quiz.quizId": data?.quiz?.quizId
      });
      
      if (!qArr.length) throw new Error("No questions returned");
      const normalized = qArr.map((q, i) => ({
        id: q.id || `q${i + 1}`,
        type: "single",
        title: q.title || q.question || q.question_text || `Question ${i + 1}`,
        options: Array.isArray(q.options) ? q.options : [],
        correct: q.correct ?? q.correct_answer ?? undefined,
        marks: q.marks || 1,
      }));
      setGeneratedQuestions(normalized);
      try {
        localStorage.setItem("exam:generatedQuestions", JSON.stringify(normalized));
        if (quizId) {
          localStorage.setItem("exam:quizMeta", JSON.stringify({ quiz_id: String(quizId) }));
          console.log("Saved quiz metadata with ID:", quizId);
        } else {
          console.warn("No quiz ID found in response - submission may fail");
        }
      } catch {}
      router.push("/exam/run");
    } catch (e) {
      setQuizError(e?.message || "Failed to start exam");
    } finally {
      setQuizLoading(false);
    }
  }

return (
  <SessionGate>
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Choose a Subject</h1>
            <p className="text-slate-600 text-sm">Pick a chapter to start the exam</p>
          </div>

          {/* Course Exam Button */}
          {courseId && (
            <div className="mb-6 bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Full Course Exam</h3>
                  <p className="text-sm text-slate-600">Take a comprehensive exam covering the entire course</p>
                </div>
                <button
                  onClick={handleStartCourseExam}
                  disabled={quizLoading}
                  className={`px-6 py-3 rounded-lg text-white font-medium ${quizLoading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"}`}
                >
                  {quizLoading ? "Generating quiz…" : "Start Course Exam"}
                </button>
              </div>
              {quizError && (
                <div className="mt-2 text-red-600 text-sm font-medium">{quizError}</div>
              )}
            </div>
          )}

        {/* Course module dropdown (titles) */}
        {course && Array.isArray(course.modules) && (
          <div className="mb-6 bg-white p-4 rounded-lg border">
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Module</label>
            <select
              value={selectedModuleIdx}
              onChange={(e) => setSelectedModuleIdx(Number(e.target.value))}
              className="w-full rounded p-2 border"
            >
              {course.modules.map((m, idx) => (
                <option key={idx} value={idx}>{`${m.week ? `Week ${m.week} — ` : ""}${m.title}`}</option>
              ))}
            </select>

            {/* show subtopics of selected module */}
            <div className="mt-4">
              <h3 className="font-semibold">Module: {course.modules[selectedModuleIdx]?.title}</h3>
              <ul className="mt-2 space-y-2">
                {(course.modules[selectedModuleIdx]?.sub_topics || []).map((st, i) => (
                  <li key={i} className="p-2 border rounded bg-gray-50">
                    <div className="font-medium">{st.title}</div>
                    <div className="text-sm mt-1 text-slate-700 whitespace-pre-wrap">{st.content?.slice(0, 400)}{st.content && st.content.length > 400 ? '…' : ''}</div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex gap-2 items-center">
                <button
                  onClick={handleStartModuleExam}
                  disabled={quizLoading}
                  className={`px-4 py-2 rounded text-white ${quizLoading ? "bg-blue-400" : "bg-blue-700 hover:bg-blue-800"}`}
                >
                  {quizLoading ? "Generating quiz…" : "Start Module Test"}
                </button>
                {quizError && (
                  <div className="text-red-600 text-sm font-medium">{quizError}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quiz is rendered on /exam/run after generation */}
      </div>
    </div>
  </SessionGate>
);
}