import { ALL_AVAILABLE_OPENAI_MODELS } from "..";

export const isFunctionCallingModel = (model: string): boolean => {
  const isChatModel = Object.keys(ALL_AVAILABLE_OPENAI_MODELS).includes(model);
  const isOld = model.includes("0314") || model.includes("0301");
  return isChatModel && !isOld;
};
