import { useActions } from "ai/rsc";

import { generateId, Message } from "ai";
import { useUIState } from "ai/rsc";
import { useState } from "react";
import { AIProvider } from "./ai-action";

export function useChatRSC() {
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useUIState<AIProvider>();
  const { chat } = useActions<AIProvider>();

  const append = async (message: Omit<Message, "id">) => {
    const newMsg: Message = { ...message, id: generateId() };

    setIsLoading(true);
    try {
      setMessages((prev) => [...prev, { ...newMsg, display: message.content }]);
      const assistantMsg = await chat(newMsg);
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
    setInput("");

    return message.content;
  };

  return {
    input,
    setInput,
    isLoading,
    messages,
    setMessages,
    append,
  };
}
