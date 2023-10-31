"use client";

import { nanoid } from "nanoid";
import { useState } from "react";
import { ChatInput, ChatMessages, Message } from "../../../../ui/html/chat";

export default function ChatSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

  const getAssistantMessage = async (messages: Message[]) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
      }),
    });
    const data = await response.json();
    const assistantMessage = data.result as Message;
    return assistantMessage;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input) return;
    try {
      setLoading(true);
      const newMessages = [
        ...messages,
        { id: nanoid(), content: input, role: "user" },
      ];
      setMessages(newMessages);
      setInput("");
      const assistantMessage = await getAssistantMessage(newMessages);
      setMessages([...newMessages, { ...assistantMessage, id: nanoid() }]);
      setLoading(false);
    } catch (error: any) {
      alert(JSON.stringify(error));
    }
  };

  const handleInputChange = (e: any): void => {
    setInput(e.target.value);
  };

  return (
    <>
      <ChatMessages messages={messages} />
      <ChatInput
        handleSubmit={handleSubmit}
        isLoading={loading}
        input={input}
        handleInputChange={handleInputChange}
      />
    </>
  );
}
