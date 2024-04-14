import { consola } from "consola";
import { Anthropic, Settings, type LLM } from "llamaindex";
import { ok } from "node:assert";
import { beforeEach, test } from "node:test";
import { ensureEnvironmentVariables, mockLLMEvent } from "./utils.js";

using _ = ensureEnvironmentVariables("anthropic");

let llm: LLM;
beforeEach(async () => {
  Settings.llm = new Anthropic({
    model: "claude-3-opus",
  });
  llm = Settings.llm;
});

await test("anthropic llm", async (t) => {
  await mockLLMEvent(t, "llm-anthropic");
  await t.test("llm.chat", async () => {
    const response = await llm.chat({
      messages: [
        {
          content: "Hello",
          role: "user",
        },
      ],
    });
    consola.debug("response:", response);
    ok(typeof response.message.content === "string");
  });

  await t.test("stream llm.chat", async () => {
    const iter = await llm.chat({
      stream: true,
      messages: [
        {
          content: "hello",
          role: "user",
        },
      ],
    });
    for await (const chunk of iter) {
      consola.debug("chunk:", chunk);
      ok(typeof chunk.delta === "string");
    }
  });
});
