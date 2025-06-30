import type { ChatMessage } from "../llms";
import { ChatMessageAdapter } from "./adapter/chat";
import {
  FactExtractionMemoryBlock,
  type FactExtractionMemoryBlockOptions,
} from "./block/fact";
import {
  StaticMemoryBlock,
  type StaticMemoryBlockOptions,
} from "./block/static";
import { Memory, type MemoryOptions } from "./memory";
import type { MemoryMessage } from "./types";

/**
 * Create a Memory instance with default options
 * @returns A new Memory instance with default configuration
 */
export function createMemory<TMessageOptions extends object = object>(): Memory<
  Record<string, never>,
  TMessageOptions
>;

/**
 * Create a Memory instance with options only
 * @param options - Memory configuration options
 * @returns A new Memory instance
 */
export function createMemory<TMessageOptions extends object = object>(
  options: MemoryOptions<TMessageOptions>,
): Memory<Record<string, never>, TMessageOptions>;

/**
 * Create a Memory instance with ChatMessage array (IDs will be generated)
 * @param messages - Initial ChatMessage array for the memory
 * @param options - Memory configuration options
 * @returns A new Memory instance
 */
export function createMemory<TMessageOptions extends object = object>(
  messages: ChatMessage<TMessageOptions>[],
  options?: MemoryOptions<TMessageOptions>,
): Memory<Record<string, never>, TMessageOptions>;

/**
 * Create a Memory instance with MemoryMessage array and options
 * @param messages - Initial MemoryMessage array for the memory
 * @param options - Memory configuration options
 * @returns A new Memory instance
 */
export function createMemory<TMessageOptions extends object = object>(
  messages: MemoryMessage<TMessageOptions>[],
  options: MemoryOptions<TMessageOptions>,
): Memory<Record<string, never>, TMessageOptions>;

/**
 * Create a Memory instance
 * @param messagesOrOptions - Either initial messages or options
 * @param options - Memory configuration options (when first param is messages)
 * @returns A new Memory instance
 */
export function createMemory<TMessageOptions extends object = object>(
  messagesOrOptions:
    | ChatMessage<TMessageOptions>[]
    | MemoryMessage<TMessageOptions>[]
    | MemoryOptions<TMessageOptions> = [],
  options: MemoryOptions<TMessageOptions> = {},
): Memory<Record<string, never>, TMessageOptions> {
  let messages: MemoryMessage<TMessageOptions>[] = [];

  if (Array.isArray(messagesOrOptions)) {
    const firstMessage = messagesOrOptions[0];
    if (firstMessage) {
      if ("id" in firstMessage) {
        messages = messagesOrOptions as MemoryMessage<TMessageOptions>[];
      } else {
        const adapter = new ChatMessageAdapter<TMessageOptions>();
        messages = messagesOrOptions.map((chatMessage) =>
          adapter.toMemory(chatMessage),
        );
      }
    }
  }
  return new Memory<Record<string, never>, TMessageOptions>(messages, options);
}

/**
 * create a StaticMemoryBlock
 * @param options - Configuration options for the static memory block
 * @returns A new StaticMemoryBlock instance
 */
export function staticBlock<TMessageOptions extends object = object>(
  options: StaticMemoryBlockOptions,
): StaticMemoryBlock<TMessageOptions> {
  return new StaticMemoryBlock<TMessageOptions>(options);
}

/**
 * create a FactExtractionMemoryBlock
 * @param options - Configuration options for the fact extraction memory block
 * @returns A new FactExtractionMemoryBlock instance
 */
export function factExtractionBlock<TMessageOptions extends object = object>(
  options: FactExtractionMemoryBlockOptions,
): FactExtractionMemoryBlock<TMessageOptions> {
  return new FactExtractionMemoryBlock<TMessageOptions>(options);
}
