"use client";

import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const ChatSection = dynamic(() => import("./components/chat-section"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="text-muted-foreground animate-spin" />
    </div>
  ),
});

export default function Home() {
  return (
    <main className="background-gradient flex h-screen w-screen items-center justify-center overflow-hidden">
      <div className="w-[90%] space-y-2 lg:w-[60rem] lg:space-y-10">
        <ChatSection />
      </div>
    </main>
  );
}
