import { AsyncLocalStorage } from "@llamaindex/env";
import type { LLM } from "../../llms";

const llmAsyncLocalStorage = new AsyncLocalStorage<LLM>();
let globalLLM: LLM | undefined;

export function getLLM(): LLM {
  const currentLLM = llmAsyncLocalStorage.getStore() ?? globalLLM;
  if (!currentLLM) {
    throw new Error(
      "Cannot find LLM, please set `Settings.llm = ...` on the top of your code",
    );
  }
  return currentLLM;
}

export function setLLM(llm: LLM): void {
  globalLLM = llm;
}

export function withLLM<Result>(llm: LLM, fn: () => Result): Result {
  return llmAsyncLocalStorage.run(llm, fn);
}
