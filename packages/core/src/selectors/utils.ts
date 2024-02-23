import { ServiceContext } from "../ServiceContext.js";
import { BaseSelector } from "./base.js";
import { LLMMultiSelector, LLMSingleSelector } from "./llmSelectors.js";

export const getSelectorFromContext = (
  serviceContext: ServiceContext,
  isMulti: boolean = false,
): BaseSelector => {
  let selector: BaseSelector | null = null;

  const llm = serviceContext.llm;

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
