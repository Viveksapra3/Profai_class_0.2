"use client"

import React from "react";
import { useRouter } from "next/navigation";
import QuizExam from "@/components/QuizExam";
import { getExam } from "@/app/exam/data";
import { SessionGate } from "@/components/SessionGate";

export default function ChapterExamPage({ params }) {
  const { subject, chapter } = params || {};
  const exam = getExam(subject, chapter);
  const router = useRouter();

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 text-slate-900 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Exam not found</h2>
          <p className="text-sm text-slate-600 mb-4">Please select a valid subject and chapter.</p>
          <button
            className="px-4 py-2 rounded bg-blue-700 text-white hover:bg-blue-800"
            onClick={() => router.push("/exam")}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const { subject: subj, chapter: chap } = exam;

  return (
    <SessionGate>
    <div className="min-h-screen bg-gray-50 text-slate-900">
      {/* <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border mb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-sm text-slate-500">{subj.name}</div>
              <h1 className="text-xl font-semibold">{chap.name}</h1>
            </div>
            <button
              className="px-4 py-2 rounded border bg-white hover:bg-gray-50"
              onClick={() => router.push("/exam")}
            >
              Change Chapter
            </button>
          </div>
        </div>
      </div> */}

      <QuizExam
        questions={chap.questions}
        timeLimit={15 * 60}
        onSubmit={(res) => console.log("Submitted:", res)}
        allowReview
        shuffle={false}
      />
    </div>
    </SessionGate>
  );
}
