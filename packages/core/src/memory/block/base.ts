import { randomUUID } from "@llamaindex/env";
import type { MemoryMessage } from "../types";

export type MemoryBlockOptions = {
  /**
   * The id of the memory block.
   */
  id?: string;
  /**
   * The priority of the memory block.
   */
  priority: number;
};

/**
 * A base class for memory blocks.
 */
export abstract class BaseMemoryBlock<
  TAdditionalMessageOptions extends object = object,
> {
  public readonly id: string;
  public readonly priority: number;

  constructor(options: MemoryBlockOptions) {
    this.id = options.id ?? `memory-block-${randomUUID()}`;
    this.priority = options.priority;
  }

  /**
   * Pull the memory block content (async).
   *
   * @param messages - Optional list of chat messages to consider when retrieving memory
   * @param blockKwargs - Additional keyword arguments specific to the memory block
   * @returns The memory block content as an array of ChatMessage.
   */
  abstract get(
    messages?: MemoryMessage<TAdditionalMessageOptions>[],
    blockKwargs?: Record<string, unknown>,
  ): Promise<MemoryMessage<TAdditionalMessageOptions>[]>;

  /**
   * Store the messages in the memory block.
   */
  abstract put(
    messages: MemoryMessage<TAdditionalMessageOptions>[],
  ): Promise<void>;

  // TODO: Implement truncate
}
