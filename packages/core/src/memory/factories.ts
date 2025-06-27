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
 * Create a Memory instance with messages and options
 * @param messages - Initial messages for the memory
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
    | MemoryMessage<TMessageOptions>[]
    | MemoryOptions<TMessageOptions> = [],
  options: MemoryOptions<TMessageOptions> = {},
): Memory<Record<string, never>, TMessageOptions> {
  // If first parameter is an array, it's messages
  if (Array.isArray(messagesOrOptions)) {
    return new Memory<Record<string, never>, TMessageOptions>(
      messagesOrOptions,
      options,
    );
  }
  // Otherwise, it's options
  return new Memory<Record<string, never>, TMessageOptions>(
    [],
    messagesOrOptions,
  );
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
