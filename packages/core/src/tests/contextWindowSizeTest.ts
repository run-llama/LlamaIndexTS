import { ALL_AVAILABLE_OPENAI_MODELS, ALL_AVAILABLE_LLAMADEUCE_MODELS } from "../llm/LLM";
import { DEFAULT_CONTEXT_WINDOW } from "../constants";
import { expect } from "chai";

describe("Context Window Size Tests", () => {
  Object.entries(ALL_AVAILABLE_OPENAI_MODELS).forEach(([modelName, model]) => {
    it(`should use the correct context window size for the ${modelName} model`, () => {
      expect(model.contextWindow).not.to.equal(DEFAULT_CONTEXT_WINDOW);
    });
  });

  Object.entries(ALL_AVAILABLE_LLAMADEUCE_MODELS).forEach(([modelName, model]) => {
    it(`should use the correct context window size for the ${modelName} model`, () => {
      expect(model.contextWindow).not.to.equal(DEFAULT_CONTEXT_WINDOW);
    });
  });
});
