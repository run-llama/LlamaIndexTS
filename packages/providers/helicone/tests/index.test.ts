import type { ChatMessage } from "@llamaindex/core/llms";
import { setEnvs } from "@llamaindex/env";
import type { LLMInstance } from "@llamaindex/openai";
import { beforeAll, describe, expect, test, vi } from "vitest";
import { Helicone } from "../src";

beforeAll(() => {
  setEnvs({
    HELICONE_API_KEY: "valid",
  });
});

describe("HeliconeLLM (OpenAI-compatible) Basics", () => {
  test("uses default model and forwards chat params", async () => {
    const createSpy = vi.fn().mockResolvedValue({
      choices: [
        {
          message: { content: "ok", role: "assistant" },
        },
      ],
    });

    const mockSession = {
      chat: {
        completions: {
          create: createSpy,
        },
      },
      apiKey: undefined,
      baseURL: undefined,
      embeddings: {} as unknown,
      responses: {} as unknown,
    } as const;

    const llm = new Helicone({
      session: mockSession as unknown as LLMInstance,
    });
    const messages: ChatMessage[] = [{ role: "user", content: "Hello" }];

    const res = await llm.chat({ messages });

    expect(res.message.content).toBe("ok");
    expect(createSpy).toHaveBeenCalledTimes(1);
    const arg = createSpy.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(arg["model"]).toBe("gpt-4o-mini"); // default model
    expect(arg["stream"]).toBe(false);
  });

  test("sets default baseURL and allows override via env and init", () => {
    // default when no HELICONE_API_BASE provided
    const llmDefault = new Helicone();
    expect(llmDefault.additionalSessionOptions?.baseURL).toBe(
      "https://ai-gateway.helicone.ai/v1",
    );

    // override via env
    setEnvs({ HELICONE_API_BASE: "https://custom.example.com/v1" });
    const llmEnv = new Helicone();
    expect(llmEnv.additionalSessionOptions?.baseURL).toBe(
      "https://custom.example.com/v1",
    );

    // override via init.additionalSessionOptions.baseURL takes precedence
    const llmInit = new Helicone({
      additionalSessionOptions: { baseURL: "https://init.example.com/v1" },
    });
    expect(llmInit.additionalSessionOptions?.baseURL).toBe(
      "https://init.example.com/v1",
    );
  });

  test("throws without HELICONE_API_KEY", () => {
    const prev = process.env.HELICONE_API_KEY;
    // Ensure neither INTERNAL_ENV nor process.env provides the key
    setEnvs({ HELICONE_API_KEY: undefined as unknown as string });
    delete process.env.HELICONE_API_KEY;

    expect(() => new Helicone()).toThrow(/HELICONE_API_KEY/);

    // restore for other tests
    if (prev !== undefined) {
      process.env.HELICONE_API_KEY = prev;
    }
    setEnvs({ HELICONE_API_KEY: "valid" });
  });

  test("supports setting custom default headers", () => {
    const llm = new Helicone({
      additionalSessionOptions: {
        defaultHeaders: {
          "Helicone-Property-User": "test-user",
          "X-Custom": "abc",
        },
      },
    });

    expect(llm.additionalSessionOptions?.defaultHeaders).toEqual({
      "Helicone-Property-User": "test-user",
      "X-Custom": "abc",
    });
  });
});
