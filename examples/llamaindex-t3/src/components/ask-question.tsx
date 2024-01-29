"use client";
import { api } from "~/trpc/react";
import { Suspense, useState } from "react";

export function AskQuestion() {
  const [question, setQuestion] = useState<string | null>(null);
  return (
    <div>
      <h1></h1>
      AskQuestion
      <form
        action={(formData) => {
          setQuestion(formData.get("question") as string);
        }}
      >
        <input name="question" type="text" />
        <button type="submit">Ask</button>
      </form>
      <Suspense fallback="Asking...">
        {question && <Response question={question} />}
      </Suspense>
    </div>
  );
}

type ResponseProps = {
  question: string;
};

const Response = (props: ResponseProps) => {
  const [{ text }] = api.post.ask.useSuspenseQuery({
    text: props.question,
  });

  return <div>{text}</div>;
};
