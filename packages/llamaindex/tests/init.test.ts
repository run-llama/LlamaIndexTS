import { expect, test, vi } from "vitest";

test("init without error", async () => {
  vi.stubEnv("OPENAI_API_KEY", undefined);
  const { Settings } = await import("llamaindex");
  expect(Settings.llm).toBeDefined();
});
