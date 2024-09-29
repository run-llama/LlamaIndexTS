"use client";

import { chatWithAI } from "@/actions/query-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type ReactNode } from "react";
import { useFormState } from "react-dom";

export default function Page() {
  const [ui, dispatch] = useFormState<ReactNode, FormData>(
    async (_, formData) => {
      return chatWithAI(formData.get("question") as string);
    },
    null,
  );

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Simple AI Chat</h1>
      <form action={dispatch} className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            name="question"
            placeholder="Ask me anything..."
            className="flex-grow"
          />
          <Button type="submit">Ask</Button>
        </div>
      </form>
      {ui && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">AI Response:</h2>
          <p>{ui}</p>
        </div>
      )}
    </div>
  );
}
