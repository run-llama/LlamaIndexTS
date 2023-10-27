"use client";
import { useChat } from "@/app/components/chat-section";
import ChatStorageService from "@/app/services/chatStorage.service";
import { ChatMessage } from "llamaindex";
import { useState } from "react";

const LLM_API_ROUTE = "/api/llm";

export default function MessageForm() {
  const { loadChat } = useChat();
  const [loading, setLoading] = useState(false);

  const getAssistantMessage = async (message: string) => {
    const response = await fetch(LLM_API_ROUTE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        chatHistory: ChatStorageService.getChatHistory(),
      }),
    });
    const data = await response.json();
    const assistantMessage = data.result as ChatMessage;
    return assistantMessage;
  };

  const sendMessage = async (message: string) => {
    if (!message) return;
    try {
      setLoading(true);
      const userMessage: ChatMessage = { content: message, role: "user" };
      ChatStorageService.addChatMessage(userMessage);
      loadChat();
      const assistantMessage = await getAssistantMessage(message);
      ChatStorageService.addChatMessage(assistantMessage);
      setLoading(false);
      loadChat();
    } catch (error: any) {
      alert(JSON.stringify(error));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = e.currentTarget.message.value;
    await sendMessage(message);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const message = e.currentTarget.value;
      if (message !== "") {
        await sendMessage(message);
      }
    }
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="flex items-start justify-between w-full max-w-5xl p-4 bg-white rounded-xl shadow-xl gap-4"
    >
      <textarea
        rows={1}
        autoFocus
        name="message"
        placeholder="Type a message"
        className="w-full p-4 rounded-xl shadow-inner flex-1"
        onKeyDown={handleKeyDown}
      />
      <button
        disabled={loading}
        type="submit"
        className="p-4 text-white rounded-xl shadow-xl bg-gradient-to-r from-cyan-500 to-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send message
      </button>
    </form>
  );
}
