"use client";
import { ChatMessage } from "llamaindex";

export default function MessageForm() {
  const testSendMessage = async (message: string) => {
    const chatHistory: ChatMessage[] = [];
    const apiRoute = "/api/llm";
    const response = await fetch(apiRoute, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, chatHistory }),
    });
    const data = await response.json();
    alert(JSON.stringify(data));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const message = e.currentTarget.message.value;
        testSendMessage(message);
      }}
      className="flex flex-col items-center justify-center w-full max-w-5xl p-4 space-y-4 bg-white rounded-xl shadow-xl"
    >
      <input
        autoFocus
        type="text"
        name="message"
        placeholder="Type a message"
        className="w-full p-4 rounded-xl shadow-inner"
      />
      <button
        type="submit"
        className="p-4 text-white rounded-xl shadow-xl bg-gradient-to-r from-cyan-500 to-sky-500 dark:from-cyan-600 dark:to-sky-600"
      >
        Send message
      </button>
    </form>
  );
}
