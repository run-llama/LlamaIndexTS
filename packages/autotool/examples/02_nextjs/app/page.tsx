import { ChatSection } from "@/components/chat-section";

export const runtime = "edge";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-10 p-24 background-gradient">
      <ChatSection />
    </main>
  );
}
