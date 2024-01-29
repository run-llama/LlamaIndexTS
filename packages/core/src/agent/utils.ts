import { BaseTool, ToolMetadata } from "../Tool";
import { ChatMessage } from "../llm";
import { ChatMemoryBuffer } from "../memory/ChatMemoryBuffer";
import { TaskStep } from "./types";

import { ZodTypeAny, z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

/**
 * Adds the user's input to the memory.
 *
 * @param step - The step to add to the memory.
 * @param memory - The memory to add the step to.
 * @param verbose - Whether to print debug messages.
 */
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

/**
 * Get function by name.
 * @param tools: tools
 * @param name: name
 * @returns: tool
 */
export function getFunctionByName(tools: BaseTool[], name: string): BaseTool {
  const nameToTool: { [key: string]: BaseTool } = {};
  tools.forEach((tool) => {
    nameToTool[tool.metadata.name] = tool;
  });

  if (!(name in nameToTool)) {
    throw new Error(`Tool with name ${name} not found`);
  }

  return nameToTool[name];
}

export const isZodSchema = (schema: any): boolean => {
  if (!schema) return false;

  if (schema instanceof z.Schema) return true;

  return false;
};

/**
 * Converts a zod schema to a JSON schema.
 * @param zSchema - The zod schema to convert.
 * @returns The JSON schema.
 */
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

export const printStep = (text: string): void => {
  console.log(text);
};
