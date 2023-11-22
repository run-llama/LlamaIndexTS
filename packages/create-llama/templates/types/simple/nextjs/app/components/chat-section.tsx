"use client";

import { nanoid } from "nanoid";
import { useState } from "react";
import { ChatInput, ChatInputProps, ChatMessages, Message } from "./ui/chat";

function useChat(): ChatInputProps & { messages: Message[] } {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");

  const getAssistantMessage = async (messages: Message[]) => {
    const response = await fetch(
      process.env.NEXT_PUBLIC_CHAT_API ?? "/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
        }),
      },
    );
    const data = await response.json();
    const assistantMessage = data.result as Message;
    return assistantMessage;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input) return;

    setIsLoading(true);

    try {
      const newMessages = [
        ...messages,
        { id: nanoid(), content: input, role: "user" },
      ];
      setMessages(newMessages);
      setInput("");
      const assistantMessage = await getAssistantMessage(newMessages);
      setMessages([...newMessages, { ...assistantMessage, id: nanoid() }]);
    } catch (error: any) {
      console.log(error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: any): void => {
    setInput(e.target.value);
  };

  return {
    messages,
    isLoading,
    input,
    handleSubmit,
    handleInputChange,
  };
}

export default function ChatSection() {
  const { messages, isLoading, input, handleSubmit, handleInputChange } =
    useChat();
  return (
    <div className="space-y-4 max-w-5xl w-full">
      <ChatMessages messages={messages} />
      <ChatInput
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        input={input}
        handleInputChange={handleInputChange}
      />
    </div>
  );
}
