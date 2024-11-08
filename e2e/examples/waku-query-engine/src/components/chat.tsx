"use client";

import { useState } from "react";

export type ChatProps = {
  askQuestion: (question: string) => Promise<string>;
};

export const Chat = (props: ChatProps) => {
  const [response, setResponse] = useState<string | null>(null);

  return (
    <section className="border-blue-400 -mx-4 mt-4 rounded border border-dashed p-4">
      <h2 className="text-lg font-bold">Chat with AI</h2>
      {response ? (
        <p className="text-sm text-gray-600 max-w-sm">{response}</p>
      ) : null}
      <form
        action={async (formData) => {
          const question = formData.get("question") as string | null;
          if (question) {
            setResponse(await props.askQuestion(question));
          }
        }}
      >
        <input
          type="text"
          name="question"
          className="border border-gray-400 rounded-sm px-2 py-0.5 text-sm"
        />
        <button className="rounded-sm bg-black px-2 py-0.5 text-sm text-white">
          Ask
        </button>
      </form>
    </section>
  );
};
