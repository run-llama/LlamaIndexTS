"use client";
import { chatWithAI } from "@/actions";
import { ReactNode, useActionState } from "react";
import { toast } from "sonner";

export function ChatSection() {
  const [state, formAction] = useActionState<ReactNode | null, FormData>(
    async (state, payload) => {
      const input = payload.get("input") as string | null;
      if (!input) {
        toast.error("Please type a message");
        return null;
      }
      return chatWithAI(input);
    },
    null,
  );
  return (
    <form>
      <div className="border border-gray-400 p-2 max-w-md">{state}</div>
      <input
        className="border border-gray-400 p-2"
        type="text"
        name="input"
        placeholder="Type your message here"
      />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        formAction={formAction}
      >
        Chat
      </button>
    </form>
  );
}
