"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SessionGate } from "@/components/SessionGate";

// Resolve backend API base URL (NEXT_PUBLIC_NEXT_BACK_API) with safe local fallback
const apiBase = (process.env.NEXT_PUBLIC_NEXT_BACK_API || "").trim();
const apiUrl = apiBase.replace(/\/$/, "") || "http://localhost:3007";

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "ja", label: "Japanese" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "hi", label: "Hindi" },
  { code: "zh", label: "Chinese (Mandarin)" },
  { code: "ko", label: "Korean" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
];

export default function MentorPage() {
  const router = useRouter();
  const [latestResult, setLatestResult] = useState(null);
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", text: "Hi! I'm your mentor. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("en");
  const inputRef = useRef(null);
  const endRef = useRef(null);

  // Fetch latest quiz results saved by the exam page
  useEffect(() => {
    try {
      const raw = localStorage.getItem("latestQuizResult");
      if (raw) {
        setLatestResult(JSON.parse(raw));
      }
    } catch {}
  }, []);

  // Auto scroll chat to bottom when messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const suggestedPrompts = useMemo(
    () => [
      "Explain the questions I got wrong",
      "Give me practice problems similar to my mistakes",
      "Summarize my performance and areas to improve",
      "Teach me the concepts behind question 2 step-by-step",
      "Quiz me again with increasing difficulty"
    ],
    []
  );

  async function handleSend(textOverride) {
    const text = (textOverride ?? input).trim();
    if (!text) return;
    const userMsg = { id: Date.now(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch(`/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          language: lang,
        }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${t || res.statusText}`);
      }

      const data = await res.json();
      // Expected shape:
      // { answer: string, sources: string[] }
      const answer = data?.answer ?? "";
      const sources = Array.isArray(data?.sources) ? data.sources : [];

      const replyText = sources.length
        ? `${answer}\n`
        : answer || "(No answer returned)";

      const reply = {
        id: Date.now() + 1,
        role: "assistant",
        text: replyText,
      };
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      const reply = {
        id: Date.now() + 1,
        role: "assistant",
        text: `Sorry, I couldn't reach the mentor service. ${err.message}`,
      };
      setMessages((prev) => [...prev, reply]);
    }
  }

  function handlePromptClick(p) {
    setInput(p);
    inputRef.current?.focus();
  }

  function handleBackNavigation() {
    try {
      // Check if there's an active course ID and return URL in sessionStorage
      const activeCourseId = sessionStorage.getItem("activeCourseId");
      const returnUrl = sessionStorage.getItem("returnUrl");
      
      if (activeCourseId) {
        // Navigate to the authenticated session page with courseId parameter
        const params = new URLSearchParams({ courseId: activeCourseId });
        if (returnUrl) {
          params.set("return", returnUrl);
        }
        router.push(`/?${params.toString()}`);
      } else {
        // No active course, just go to the main page
        router.push("/");
      }
    } catch (error) {
      // Fallback to main page if sessionStorage access fails
      router.push("/");
    }
  }

  return (
    <SessionGate>
    <div className="min-h-screen w-full bg-slate-950 text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBackNavigation}
              className="text-sm text-white/80 hover:text-white cursor-pointer"
            >
              ← Back
            </button>
            <div className="text-lg font-semibold">Mentor</div>
          </div>
          <div className="text-xs text-white/60">Live guidance & Q&A</div>
        </div>
      </div>

      {/* Main 30/70 layout */}
      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Left column 30% (on lg: 3/10) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Post-quiz results (upper section) */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-base font-semibold mb-3">Post-quiz results</h2>
            {latestResult ? (
              <div className="space-y-3">
                <div className="text-sm text-white/80">
                  <span className="font-medium">Submitted:</span>{" "}
                  {new Date(latestResult.submittedAt).toLocaleString()}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold">
                    {Math.round((latestResult.result.score + Number.EPSILON) * 100) / 100}
                  </div>
                  <div className="text-white/70">/ {latestResult.result.maxScore}</div>
                </div>
                <div className="max-h-48 overflow-auto pr-2">
                  <ul className="space-y-2 text-sm">
                    {latestResult.result.perQuestion.map((pq, idx) => (
                      <li key={pq.id} className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2">
                        <span className="text-white/80">Q{idx + 1}</span>
                        <span className="text-white/70">{Math.round((pq.awarded + Number.EPSILON) * 100) / 100} / {pq.marks}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-sm text-white/70">
                No recent quiz results found. Take an exam in
                <Link href="/exam" className="ml-1 underline hover:text-white">Practice</Link>
                , then come back here.
              </div>
            )}
          </section>

          {/* Suggested prompts (lower section) */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-base font-semibold mb-3">Suggested prompts</h2>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePromptClick(p)}
                  className="px-3 py-1.5 rounded-full text-sm bg-white/10 hover:bg-white/20 border border-white/10"
                >
                  {p}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right column 70% chat (on lg: 7/10) */}
        <div className="lg:col-span-7">
          <section className="flex h-[70vh] min-h-[420px] flex-col rounded-2xl border border-white/10 bg-white/5">
            {/* Chat messages */}
            <div className="flex-1 overflow-auto p-4 space-y-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`w-full flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`inline-block w-fit max-w-[90%] md:max-w-[75%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                      m.role === "user"
                        ? "bg-indigo-600/80"
                        : "bg-white/10"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            {/* Composer */}
            <div className="border-t border-white/10 p-3 flex items-center gap-2">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="rounded-lg bg-white/10 px-2 py-2 text-sm outline-none"
                title="Language"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask your mentor…"
                className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/40"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-medium"
              >
                Send
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
    </SessionGate>
  );
}
