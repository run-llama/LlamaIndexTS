import { randomUUID } from "@llamaindex/env";
import type { MemoryMessage } from "../types";

export type MemoryBlockOptions = {
  /**
   * The id of the memory block.
   */
  id?: string;
  /**
   * The priority of the memory block.
   * Note: if priority is 0, the block content is always included in the memory context.
   */
  priority: number;
  /**
   * Whether the memory block is long term.
   * Default is true.
   */
  isLongTerm?: boolean;
};

/**
 * A base class for memory blocks.
 */
export abstract class BaseMemoryBlock<
  TAdditionalMessageOptions extends object = object,
> {
  public readonly id: string;
  public readonly priority: number;
  public readonly isLongTerm: boolean;

  constructor(options: MemoryBlockOptions) {
    this.id = options.id ?? `memory-block-${randomUUID()}`;
    this.priority = options.priority;
    this.isLongTerm = options.isLongTerm ?? true;
  }

  /**
   * Pull the memory block content (async).
   *
   * @returns The memory block content as an array of ChatMessage.
   */
  abstract get(
    messages?: MemoryMessage<TAdditionalMessageOptions>[],
  ): Promise<MemoryMessage<TAdditionalMessageOptions>[]>;

  /**
   * Store the messages in the memory block.
   */
  abstract put(
    messages: MemoryMessage<TAdditionalMessageOptions>[],
  ): Promise<void>;
}
