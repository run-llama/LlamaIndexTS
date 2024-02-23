import { describe, expect, test, vi } from "vitest";
// from unittest.mock import patch

import { serviceContextFromDefaults } from "llamaindex/ServiceContext";
import { OpenAI } from "llamaindex/llm/index";
import { LLMSingleSelector } from "llamaindex/selectors/index";
import { mocStructuredkLlmGeneration } from "./utility/mockOpenAI.js";

vi.mock("llamaindex/llm/open_ai", () => {
  return {
    getOpenAISession: vi.fn().mockImplementation(() => null),
  };
});

describe("LLMSelector", () => {
  test("should be able to output a selection with a reason", async () => {
    const serviceContext = serviceContextFromDefaults({});

    const languageModel = new OpenAI({
      model: "gpt-3.5-turbo",
    });

    mocStructuredkLlmGeneration({
      languageModel,
      callbackManager: serviceContext.callbackManager,
    });

    const selector = new LLMSingleSelector({
      llm: languageModel,
    });

    const result = await selector.select(
      ["apple", "pear", "peach"],
      "what is the best fruit?",
    );

    expect(result.selections[0].reason).toBe("apple");
  });
});
