import { Settings as RootSettings } from "@llamaindex/core/global";
import { OpenAI } from "@llamaindex/openai";
import { Settings } from "llamaindex";
import { beforeEach, expect, test } from "vitest";
const defaultLLM = new OpenAI();

beforeEach(() => {
  RootSettings.llm = defaultLLM;
});

test("async local storage with core", () => {
  const symbol = Symbol("llm");
  RootSettings.withLLM(symbol as never, () => {
    expect(RootSettings.llm).toBe(symbol);
  });
});

test("async local storage with llamaindex", () => {
  const symbol = Symbol("llm");
  Settings.withLLM(symbol as never, () => {
    expect(Settings.llm).toBe(symbol);
    expect(RootSettings.llm).toBe(symbol);
  });
});
