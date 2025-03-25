import { useChatMessage } from "@llamaindex/chat-ui";
import { User2 } from "lucide-react";
import Image from "next/image";

export function ChatMessageAvatar() {
  const { message } = useChatMessage();
  if (message.role === "user") {
    return (
      <div className="bg-background flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm">
        <User2 className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-black text-white shadow-sm">
      <Image
        className="rounded-md"
        src="/llama.png"
        alt="Llama Logo"
        width={24}
        height={24}
        priority
      />
    </div>
  );
}
