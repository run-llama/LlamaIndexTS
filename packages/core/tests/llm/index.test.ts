import { setEnvs } from "@llamaindex/env";
import { Anthropic } from "llamaindex";
import { beforeAll, describe, expect, test } from "vitest";

beforeAll(() => {
  setEnvs({
    ANTHROPIC_API_KEY: "valid",
  });
});

describe("Anthropic llm", () => {
  test("format messages", () => {
    const anthropic = new Anthropic();
    expect(
      anthropic.formatMessages([
        {
          content: "You are a helpful assistant.",
          role: "assistant",
        },
        {
          content: "Hello?",
          role: "user",
        },
      ]),
    ).toEqual([
      {
        content: "You are a helpful assistant.",
        role: "assistant",
      },
      {
        content: "Hello?",
        role: "user",
      },
    ]);

    expect(
      anthropic.formatMessages([
        {
          content: "You are a helpful assistant.",
          role: "assistant",
        },
        {
          content: "Hello?",
          role: "user",
        },
        {
          content: "I am a system message.",
          role: "system",
        },
        {
          content: "What is your name?",
          role: "user",
        },
      ]),
    ).toEqual([
      {
        content: "You are a helpful assistant.",
        role: "assistant",
      },
      {
        content: "Hello?\nWhat is your name?",
        role: "user",
      },
    ]);
  });
});
