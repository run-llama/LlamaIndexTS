import { OpenAI, Settings, type LLM } from "llamaindex";
import { ok } from "node:assert";
import { before, test } from "node:test";

let llm: LLM;

before(() => {
  Settings.llm = new OpenAI({
    apiKey: "ollama",
    model: "llama2",
    additionalSessionOptions: {
      baseURL: "http://localhost:11434/v1",
    },
  });
  llm = Settings.llm;
});

void test("basic", async () => {
  const response = await llm.chat({
    messages: [
      {
        content: "Hello",
        role: "user",
      },
    ],
  });
  ok(typeof response.message.content === "string");
});
