import { Settings } from "../Settings.js";
import type { BaseSelector } from "./base.js";
import { LLMMultiSelector, LLMSingleSelector } from "./llmSelectors.js";

export const getSelectorFromContext = (
  isMulti: boolean = false,
): BaseSelector => {
  let selector: BaseSelector | null = null;

  const llm = Settings.llm;

  if (isMulti) {
    selector = new LLMMultiSelector({ llm });
  } else {
    selector = new LLMSingleSelector({ llm });
  }

  if (selector === null) {
    throw new Error("Selector is null");
  }

  return selector;
};
