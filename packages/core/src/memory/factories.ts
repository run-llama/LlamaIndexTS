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
import { DEFAULT_TOKEN_LIMIT, Memory, type MemoryOptions } from "./memory";
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

  // Determine the correct options to pass to Memory
  const resolvedOptions: MemoryOptions<TMessageOptions> = Array.isArray(
    messagesOrOptions,
  )
    ? options
    : (messagesOrOptions as MemoryOptions<TMessageOptions>);

  return new Memory<Record<string, never>, TMessageOptions>(
    messages,
    resolvedOptions,
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

/**
 * Creates a new Memory instance from a snapshot
 * @param snapshot The snapshot to load from
 * @param options Optional MemoryOptions to apply when loading (including memory blocks)
 * @returns A new Memory instance with the snapshot data and provided options
 */
export function loadMemory<TMessageOptions extends object = object>(
  snapshot: string,
  options?: MemoryOptions<TMessageOptions>,
): Memory<Record<string, never>, TMessageOptions> {
  const { messages, tokenLimit, memoryCursor } = JSON.parse(snapshot);

  // Merge snapshot data with provided options
  const mergedOptions: MemoryOptions<TMessageOptions> = {
    tokenLimit: options?.tokenLimit ?? tokenLimit ?? DEFAULT_TOKEN_LIMIT,
    ...(options?.shortTermTokenLimitRatio && {
      shortTermTokenLimitRatio: options.shortTermTokenLimitRatio,
    }),
    ...(options?.customAdapters && {
      customAdapters: options.customAdapters,
    }),
    memoryBlocks: options?.memoryBlocks ?? [],
    memoryCursor: memoryCursor ?? 0,
  };

  return new Memory<Record<string, never>, TMessageOptions>(
    messages,
    mergedOptions,
  );
}
