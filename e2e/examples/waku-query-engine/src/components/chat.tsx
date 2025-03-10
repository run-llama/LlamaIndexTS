"use client";

import { useState } from "react";

export type ChatProps = {
  askQuestion: (question: string) => Promise<string>;
};

export const Chat = (props: ChatProps) => {
  const [response, setResponse] = useState<string | null>(null);

  return (
    <section className="-mx-4 mt-4 rounded border border-dashed border-blue-400 p-4">
      <h2 className="text-lg font-bold">Chat with AI</h2>
      {response ? (
        <p className="max-w-sm text-sm text-gray-600">{response}</p>
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
          className="rounded-sm border border-gray-400 px-2 py-0.5 text-sm"
        />
        <button className="rounded-sm bg-black px-2 py-0.5 text-sm text-white">
          Ask
        </button>
      </form>
    </section>
  );
};
