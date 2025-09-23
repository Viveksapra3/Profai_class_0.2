"use client";

import React, { useEffect, useState } from "react";
import QuizExam from "@/components/QuizExam";

export default function RunExamPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("exam:generatedQuestions");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setQuestions(parsed);
      }
    } catch {}
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-700">
        Loading exam…
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 bg-white border rounded shadow-sm text-center">
          <div className="font-semibold mb-2">No exam loaded</div>
          <div className="text-sm text-slate-600">Go back and generate the exam first.</div>
        </div>
      </div>
    );
  }

  return <QuizExam questions={questions} />;
}
