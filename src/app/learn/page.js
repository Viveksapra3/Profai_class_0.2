"use client";
import { Experience } from "@/components/Experience";
import { ChatProvider } from "@/hooks/useChat";
import { Leva } from "leva";
import { SessionGate } from "@/components/SessionGate";

export default function LearnPage() {
  return (
    <SessionGate>
      <main className="h-screen min-h-screen">
        <ChatProvider>
          <Leva hidden/>
          <Experience />
        </ChatProvider>
      </main>
    </SessionGate>
  );
}
