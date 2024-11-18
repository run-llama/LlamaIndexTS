import { clsx, type ClassValue } from "clsx";
import { LLM, LLMMetadata } from "llamaindex";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

class MockLLM  {
  metadata: LLMMetadata = {
    model: "MockLLM",
    temperature: 0.5,
    topP: 0.5,
    contextWindow: 1024,
    tokenizer: undefined,
  };

  chat() {
    const mockResponse = "Hello! This is a mock response";
    return Promise.resolve(
      new ReadableStream({
        async start(controller) {
          for (const char of mockResponse) {
            controller.enqueue({ delta: char });
            await new Promise((resolve) => setTimeout(resolve, 20));
          }
          controller.close();
        },
      }),
    );
  }
}

export const llm = new MockLLM() as unknown as LLM;