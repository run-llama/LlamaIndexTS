import { ChatMessage } from "../llm";
import { ChatMemoryBuffer } from "../memory/ChatMemoryBuffer";
import { TaskStep } from "./types";

import { ZodTypeAny } from "zod";

export function addUserStepToMemory(
  step: TaskStep,
  memory: ChatMemoryBuffer,
  verbose: boolean = false,
): void {
  if (!step.input) {
    return;
  }

  const userMessage: ChatMessage = {
    content: step.input,
    role: "user",
  };

  memory.put(userMessage);

  if (verbose) {
    console.log(`Added user message to memory!: ${userMessage.content}`);
  }
}

const mapZodTypeToGeneric = (zodType: any): string => {
  switch (zodType) {
    case "ZodString":
      return "string";
    case "ZodNumber":
      return "number";
    case "ZodBoolean":
      return "boolean";
    default:
      return "any";
  }
};

export const createParameterDescriptionFromZodSchema = <T extends ZodTypeAny>(
  schema?: T,
): ZodTypeAny | undefined => {
  if (!schema) return undefined;

  const shape = schema._def.shape();

  const parameters: {
    type: string;
    properties: Record<string, { type: string; description?: string }>;
    required: string[];
  } = {
    type: "object",
    properties: {},
    required: Object.keys(shape),
  };

  Object.entries(shape).forEach(([key, value]: any) => {
    parameters.properties[key] = {
      type: mapZodTypeToGeneric(value._def.typeName),
      description: `The argument ${key}`, // Descrição padrão
    };
  });

  // @ts-ignore
  return parameters;
};
