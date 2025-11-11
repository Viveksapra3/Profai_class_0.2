"use client";
import { Experience } from "@/components/Experience";
import { ChatProvider, useChat } from "@/hooks/useChat";
import { Leva } from "leva";
import { SessionGate } from "@/components/SessionGate";
import { useEffect, useMemo, useState } from "react";

function TeachControls() {
  const {
    startClass,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    isConnected,
    connectionStatus,
  } = useChat();

  const [open, setOpen] = useState(false);
  const [courseDetails, setCourseDetails] = useState(null);
  const [courseName, setCourseName] = useState("");

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedModuleIndex, setSelectedModuleIndex] = useState("");
  const [selectedSubTopicIndex, setSelectedSubTopicIndex] = useState("");

  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [status, setStatus] = useState("");

  // Auto-pick course from sessionStorage on mount
  useEffect(() => {
    try {
      const active = sessionStorage.getItem("activeCourseId") || "";
      if (active) {
        setSelectedCourseId(active);
      } else {
        setStatus("No course selected. Please select a course first.");
      }
    } catch (e) {
      setStatus("Error loading course selection");
    }
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setCourseDetails(null);
      setCourseName("");
      setSelectedModuleIndex("");
      setSelectedSubTopicIndex("");
      return;
    }
    const loadDetails = async () => {
      try {
        setStatus("Loading course details...");
        // Use Next.js API proxy to avoid mixed content issues
        const res = await fetch(`/api/course/${encodeURIComponent(selectedCourseId)}`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const details = await res.json();
        setCourseDetails(details);
        setCourseName(details.course_title || details.title || `Course ${selectedCourseId}`);
        setStatus("");
      } catch (e) {
        setStatus(`Failed to load course details: ${e.message}`);
      }
    };
    loadDetails();
  }, [selectedCourseId]);

  const modules = courseDetails?.modules || [];
  const selectedModule = useMemo(() => {
    const idx = parseInt(selectedModuleIndex);
    if (Number.isNaN(idx)) return null;
    return modules[idx] || null;
  }, [modules, selectedModuleIndex]);

  const canStart =
    isConnected &&
    selectedCourseId !== "" &&
    selectedModuleIndex !== "" &&
    selectedSubTopicIndex !== "" &&
    !isStarted;

  const onStart = () => {
    if (!canStart) return;
    const mIdx = parseInt(selectedModuleIndex);
    const sIdx = parseInt(selectedSubTopicIndex);
    // language omitted; hook uses default internally
    startClass(selectedCourseId, mIdx, sIdx);
    setIsStarted(true);
    setIsPaused(false);
    setStatus("Starting class...");
  };

  const onPauseResume = () => {
    if (!isStarted) return;
    if (isPaused) {
      resumePlayback();
      setIsPaused(false);
      setStatus("Class resumed");
    } else {
      pausePlayback();
      setIsPaused(true);
      setStatus("Class paused");
    }
  };

  const onStop = () => {
    if (!isStarted) return;
    stopPlayback(); // stop currently playing chunks immediately
    setIsStarted(false);
    setIsPaused(false);
    setSelectedModuleIndex("");
    setSelectedSubTopicIndex("");
    setStatus("Class stopped");
  };

  return (
    <div className="pointer-events-auto select-none">
  {/* Center-bottom control bar */}
  <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex gap-2">
    <button
      className="px-3 py-2 rounded bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
      onClick={() => setOpen((v) => !v)}
    >
      {open ? "Close Teach Mode" : "Teach Mode"}
    </button>
    <div
      className={`px-2 py-2 text-xs rounded ${
        isConnected
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {connectionStatus}
    </div>
  </div>

  {/* Centered popup panel */}
  {open && (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-96 max-w-[95vw] bg-yellow-200 text-black border border-yellow-400 rounded-lg shadow-lg p-4">
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Course</label>
        <div className="w-full border rounded px-2 py-1 bg-gray-100 text-gray-700">
          {courseName || "Loading course..."}
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Module</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={selectedModuleIndex}
          disabled={!courseDetails}
          onChange={(e) => {
            setSelectedModuleIndex(e.target.value);
            setSelectedSubTopicIndex("");
          }}
        >
          <option value="">Select a module...</option>
          {modules.map((m, idx) => (
            <option key={idx} value={idx}>
              {`Week ${m.week}: ${m.title}`}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Sub-topic</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={selectedSubTopicIndex}
          disabled={!selectedModule}
          onChange={(e) => setSelectedSubTopicIndex(e.target.value)}
        >
          <option value="">Select a sub-topic...</option>
          {(selectedModule?.sub_topics || []).map((st, idx) => (
            <option key={idx} value={idx}>
              {st.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          className="px-3 py-2 rounded bg-green-600 text-white text-sm font-semibold disabled:opacity-50"
          disabled={!canStart}
          onClick={onStart}
        >
          Start Class
        </button>
        <button
          className="px-3 py-2 rounded bg-yellow-600 text-white text-sm font-semibold disabled:opacity-50"
          disabled={!isStarted}
          onClick={onPauseResume}
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
        <button
          className="px-3 py-2 rounded bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
          disabled={!isStarted}
          onClick={onStop}
        >
          Stop
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-800 h-5">{status}</div>
    </div>
  )}
</div>

  );
}

export default function LearnPage() {
  return (
    <SessionGate>
      <main className="h-screen min-h-screen">
        <ChatProvider>
          <Leva hidden/>
          <Experience />
          <TeachControls />
        </ChatProvider>
      </main>
    </SessionGate>
  );
}
