import { tokenizerResultPromise } from "@/utils/llm";
import { use } from "react";

export const runtime = "edge";

export default function Home() {
  const result = use(tokenizerResultPromise);
  return (
    <main>
      <div>
        <h1>Next.js Edge Runtime</h1>
        <div>
          {result.map((value, index) => (
            <span key={index}>{value}</span>
          ))}
        </div>
      </div>
    </main>
  );
}
