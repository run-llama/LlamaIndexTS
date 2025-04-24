"use client";

import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const ChatSection = dynamic(() => import("./components/ui/chat/chat-section"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="text-muted-foreground animate-spin" />
    </div>
  ),
});

export default function Home() {
  return <ChatSection />;
}
