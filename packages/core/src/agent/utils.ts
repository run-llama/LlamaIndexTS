import { ChatMessage } from "../llm";
import { ChatMemoryBuffer } from "../memory/ChatMemoryBuffer";
import { TaskStep } from "./types";

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
