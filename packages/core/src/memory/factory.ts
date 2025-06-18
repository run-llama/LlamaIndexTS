import { StaticMemoryBlock } from "./base";
import { Memory } from "./memory";
import type { MemoryBlockContent, MemoryOptions } from "./types";

/**
 * Create a new enhanced memory instance with support for dual message formats,
 * snapshots, and memory blocks
 *
 * @example
 * ```typescript
 * // Basic usage
 * const memory = createMemory();
 *
 * // With configuration
 * const memory = createMemory({
 *   tokenLimit: 10_000,
 *   blocks: [
 *     staticMemoryBlock(["You are a helpful assistant named Claude."], 0),
 *   ],
 * });
 *
 * // Add messages in different formats
 * await memory.add({
 *   content: "Hello, how are you?",
 *   role: "user",
 * });
 *
 * // Get messages in Vercel AI format
 * const uiMessages = await memory.get({ type: "vercel" });
 *
 * // Save and restore memory state
 * const snapshot = memory.snapshot();
 * await memory.loadSnapshot(snapshot);
 * ```
 *
 * @param options Configuration options for the memory instance
 * @returns A new EnhancedMemory instance
 */
export function createMemory(options: MemoryOptions = {}): Memory {
  return new Memory(options);
}

/**
 * Create a new static memory block instance
 *
 * @param content The content of the memory block
 * @param priority The priority of the memory block
 * @returns A new StaticMemoryBlock instance
 */
export function staticMemoryBlock(
  content: MemoryBlockContent[],
  priority: number,
): StaticMemoryBlock {
  return new StaticMemoryBlock(content, priority);
}
