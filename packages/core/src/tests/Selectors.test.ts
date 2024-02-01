// from unittest.mock import patch

import { serviceContextFromDefaults } from "../ServiceContext";
import { OpenAI } from "../llm";
import { LLMSingleSelector } from "../selectors";
import { mocStructuredkLlmGeneration } from "./utility/mockOpenAI";

jest.mock("../llm/open_ai", () => {
  return {
    getOpenAISession: jest.fn().mockImplementation(() => null),
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
