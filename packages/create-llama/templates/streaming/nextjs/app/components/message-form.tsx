"use client";

import { UseChatHelpers } from "ai/react";

export default function MessageForm({ chat }: { chat: UseChatHelpers }) {
  return (
    <>
      <form
        onSubmit={chat.handleSubmit}
        className="flex items-start justify-between w-full max-w-5xl p-4 bg-white rounded-xl shadow-xl gap-4"
      >
        <input
          autoFocus
          name="message"
          placeholder="Type a message"
          className="w-full p-4 rounded-xl shadow-inner flex-1"
          value={chat.input}
          onChange={chat.handleInputChange}
        />
        <button
          type="submit"
          className="p-4 text-white rounded-xl shadow-xl bg-gradient-to-r from-cyan-500 to-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send message
        </button>
      </form>
    </>
  );
}
