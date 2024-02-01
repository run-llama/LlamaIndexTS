import { ChatMessage } from "../llm";
import { ChatMemoryBuffer } from "../memory/ChatMemoryBuffer";
import { BaseTool } from "../types";
import { TaskStep } from "./types";

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
