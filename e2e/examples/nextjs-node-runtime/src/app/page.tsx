import { tokenize } from "@/utils/tokenizer";
import { use } from "react";

export const runtime = "nodejs";

export default function Home() {
  const result = use(tokenize("Hello world"));
  return (
    <main>
      <div>
        <h1>Next.js Node Runtime calling tokenizer</h1>
        <div>{result}</div>
      </div>
    </main>
  );
}
