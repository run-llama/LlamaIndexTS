"use client";
import { chatWithAgent } from "@/actions";
import type { ReactNode } from "react";
import { useFormState } from "react-dom";

export const runtime = "edge";

export default function Home() {
  const [state, action] = useFormState<ReactNode>(async () => {
    return chatWithAgent("hello!", []);
  }, null);
  return (
    <main>
      {state}
      <form action={action}>
        <button>Chat</button>
      </form>
    </main>
  );
}
