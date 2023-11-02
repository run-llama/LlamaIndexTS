import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "../button";
import ChatAvatar from "./chat-avatar";

export interface Message {
  id: string;
  content: string;
  role: string;
}

export default function ChatMessage(chatMessage: Message) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(chatMessage.content);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div className="flex items-start gap-4 pt-5">
      <ChatAvatar role={chatMessage.role} />
      <div className="group flex flex-1 justify-between gap-2">
        <p className="break-words">{chatMessage.content}</p>
        <Button
          onClick={copyToClipboard}
          size="icon"
          variant="ghost"
          className="hidden h-8 w-8 group-hover:flex"
        >
          {isCopied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
