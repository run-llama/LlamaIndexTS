import { Settings } from "../Settings.js";
import type { ChatMessage } from "../llm/index.js";
import type { ChatMemoryBuffer } from "../memory/ChatMemoryBuffer.js";
import type { BaseTool } from "../types.js";
import type { TaskStep } from "./types.js";

export function addUserStepToMemory(
  step: TaskStep,
  memory: ChatMemoryBuffer,
): void {
  if (!step.input) {
    return;
  }

  const userMessage: ChatMessage = {
    content: step.input,
    role: "user",
  };

  memory.put(userMessage);

  if (Settings.debug) {
    console.log(`Added user message to memory!: ${userMessage.content}`);
  }
}

export function getFunctionByName(tools: BaseTool[], name: string): BaseTool {
  const exist = tools.find((tool) => tool.metadata.name === name);

  if (!exist) {
    throw new Error(`Tool with name ${name} not found`);
  }

  return exist;
}
