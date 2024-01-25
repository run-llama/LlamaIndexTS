import { ToolMetadata } from "../Tool";
import { ChatMessage } from "../llm";
import { ChatMemoryBuffer } from "../memory/ChatMemoryBuffer";
import { TaskStep } from "./types";

import { ZodTypeAny, z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

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

export const isZodSchema = (schema: any): boolean => {
  if (!schema) return false;

  if (schema instanceof z.Schema) return true;

  return false;
};

export const getProperties = (
  zSchema: ZodTypeAny,
): ToolMetadata["parameters"] => {
  // # TODO: on current zod version it doesn't return the correct type, then having to force it
  const schema = zodToJsonSchema(zSchema) as {
    properties: Record<string, { type: string; description?: string }>;
    required?: string[];
  };

  if (!schema?.properties) {
    throw new Error("Invalid properties");
  }

  return {
    type: "object",
    properties: schema?.properties,
    required: schema?.required,
  } as ToolMetadata["parameters"];
};
