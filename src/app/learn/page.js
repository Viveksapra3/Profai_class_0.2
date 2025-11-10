"use client";
import { Experience } from "@/components/Experience";
import { ChatProvider, useChat } from "@/hooks/useChat";
import { Leva } from "leva";
import { SessionGate } from "@/components/SessionGate";
import { useEffect, useMemo, useState } from "react";

// TEACH MODE - COMMENTED OUT
// function TeachControls() {
//   const {
//     startClass,
//     pausePlayback,
//     resumePlayback,
//     stopPlayback,
//     isConnected,
//     connectionStatus,
//   } = useChat();

//   const API_BASE = process.env.NEXT_PUBLIC_NEXT_BACK3_API;

//   const [open, setOpen] = useState(false);
//   const [loadingCourses, setLoadingCourses] = useState(false);
//   const [courses, setCourses] = useState([]);
//   const [courseDetails, setCourseDetails] = useState(null);

//   const [selectedCourseId, setSelectedCourseId] = useState("");
//   const [selectedModuleIndex, setSelectedModuleIndex] = useState("");
//   const [selectedSubTopicIndex, setSelectedSubTopicIndex] = useState("");

//   const [isStarted, setIsStarted] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);
//   const [status, setStatus] = useState("");

//   // Auto-pick course from left panel (sessionStorage: activeCourseId)
//   useEffect(() => {
//     try {
//       const active = sessionStorage.getItem("activeCourseId") || "";
//       if (active && active !== selectedCourseId) {
//         setSelectedCourseId(active);
//       }
//     } catch (e) {
//       // ignore
//     }
//   }, [open]);

//   useEffect(() => {
//     if (!open) return;
//     const load = async () => {
//       if (!API_BASE) {
//         setStatus("Missing NEXT_PUBLIC_NEXT_BACK3_API env");
//         return;
//       }
//       try {
//         setLoadingCourses(true);
//         setStatus("Loading courses...");
//         const res = await fetch(`${API_BASE}/api/courses`);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = await res.json();
//         setCourses(data || []);
//         setStatus("");
//       } catch (e) {
//         setStatus(`Failed to load courses: ${e.message}`);
//       } finally {
//         setLoadingCourses(false);
//       }
//     };
//     load();
//   }, [open, API_BASE]);

//   useEffect(() => {
//     if (!API_BASE || !selectedCourseId) {
//       setCourseDetails(null);
//       setSelectedModuleIndex("");
//       setSelectedSubTopicIndex("");
//       return;
//     }
//     const loadDetails = async () => {
//       try {
//         setStatus("Loading course details...");
//         const res = await fetch(`${API_BASE}/api/course/${selectedCourseId}`);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const details = await res.json();
//         setCourseDetails(details);
//         setStatus("");
//       } catch (e) {
//         setStatus(`Failed to load course details: ${e.message}`);
//       }
//     };
//     loadDetails();
//   }, [API_BASE, selectedCourseId]);

//   const modules = courseDetails?.modules || [];
//   const selectedModule = useMemo(() => {
//     const idx = parseInt(selectedModuleIndex);
//     if (Number.isNaN(idx)) return null;
//     return modules[idx] || null;
//   }, [modules, selectedModuleIndex]);

//   const canStart =
//     isConnected &&
//     selectedCourseId !== "" &&
//     selectedModuleIndex !== "" &&
//     selectedSubTopicIndex !== "" &&
//     !isStarted;

//   const onStart = () => {
//     if (!canStart) return;
//     const mIdx = parseInt(selectedModuleIndex);
//     const sIdx = parseInt(selectedSubTopicIndex);
//     // language omitted; hook uses default internally
//     startClass(selectedCourseId, mIdx, sIdx);
//     setIsStarted(true);
//     setIsPaused(false);
//     setStatus("Starting class...");
//   };

//   const onPauseResume = () => {
//     if (!isStarted) return;
//     if (isPaused) {
//       resumePlayback();
//       setIsPaused(false);
//       setStatus("Class resumed");
//     } else {
//       pausePlayback();
//       setIsPaused(true);
//       setStatus("Class paused");
//     }
//   };

//   const onStop = () => {
//     if (!isStarted) return;
//     stopPlayback(); // stop currently playing chunks immediately
//     setIsStarted(false);
//     setIsPaused(false);
//     setStatus("Class stopped");
//   };

//   return (
//     <div className="pointer-events-auto select-none">
//   {/* Center-bottom control bar */}
//   <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex gap-2">
//     <button
//       className="px-3 py-2 rounded bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
//       onClick={() => setOpen((v) => !v)}
//     >
//       {open ? "Close Teach Mode" : "Teach Mode"}
//     </button>
//     <div
//       className={`px-2 py-2 text-xs rounded ${
//         isConnected
//           ? "bg-green-100 text-green-700"
//           : "bg-red-100 text-red-700"
//       }`}
//     >
//       {connectionStatus}
//     </div>
//   </div>

//   {/* Centered popup panel */}
//   {open && (
//     <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-96 max-w-[95vw] bg-yellow-200 text-black border border-yellow-400 rounded-lg shadow-lg p-4">
//       <div className="mb-3">
//         <label className="block text-sm font-medium mb-1">Course</label>
//         <select
//           className="w-full border rounded px-2 py-1"
//           value={selectedCourseId}
//           onChange={(e) => {
//             setSelectedCourseId(e.target.value);
//             setSelectedModuleIndex("");
//             setSelectedSubTopicIndex("");
//           }}
//         >
//           <option value="">
//             {loadingCourses ? "Loading..." : "Select a course..."}
//           </option>
//           {courses.map((c) => (
//             <option key={c.course_id} value={c.course_id}>
//               {c.course_title || c.title || c.course_id}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="mb-3">
//         <label className="block text-sm font-medium mb-1">Module</label>
//         <select
//           className="w-full border rounded px-2 py-1"
//           value={selectedModuleIndex}
//           disabled={!courseDetails}
//           onChange={(e) => {
//             setSelectedModuleIndex(e.target.value);
//             setSelectedSubTopicIndex("");
//           }}
//         >
//           <option value="">Select a module...</option>
//           {modules.map((m, idx) => (
//             <option key={idx} value={idx}>
//               {`Week ${m.week}: ${m.title}`}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="mb-4">
//         <label className="block text-sm font-medium mb-1">Sub-topic</label>
//         <select
//           className="w-full border rounded px-2 py-1"
//           value={selectedSubTopicIndex}
//           disabled={!selectedModule}
//           onChange={(e) => setSelectedSubTopicIndex(e.target.value)}
//         >
//           <option value="">Select a sub-topic...</option>
//           {(selectedModule?.sub_topics || []).map((st, idx) => (
//             <option key={idx} value={idx}>
//               {st.title}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="flex gap-2 justify-end">
//         <button
//           className="px-3 py-2 rounded bg-green-600 text-white text-sm font-semibold disabled:opacity-50"
//           disabled={!canStart}
//           onClick={onStart}
//         >
//           Start Class
//         </button>
//         <button
//           className="px-3 py-2 rounded bg-yellow-600 text-white text-sm font-semibold disabled:opacity-50"
//           disabled={!isStarted}
//           onClick={onPauseResume}
//         >
//           {isPaused ? "Resume" : "Pause"}
//         </button>
//         <button
//           className="px-3 py-2 rounded bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
//           disabled={!isStarted}
//           onClick={onStop}
//         >
//           Stop
//         </button>
//       </div>

//       <div className="mt-2 text-xs text-gray-800 h-5">{status}</div>
//     </div>
//   )}
// </div>

//   );
// }

export default function LearnPage() {
  return (
    <SessionGate>
      <main className="h-screen min-h-screen">
        <ChatProvider>
          <Leva hidden/>
          <Experience />
          {/* TEACH MODE - COMMENTED OUT */}
          {/* <TeachControls /> */}
        </ChatProvider>
      </main>
    </SessionGate>
  );
}
