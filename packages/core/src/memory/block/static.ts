import type { MessageContent, MessageType } from "../../llms";
import type { MemoryMessage } from "../types";
import { BaseMemoryBlock, type MemoryBlockOptions } from "./base";

export type StaticMemoryBlockOptions = {
  /**
   * The static content to store.
   */
  content: MessageContent;
  /**
   * The role of the message.
   */
  messageRole?: MessageType;
} & Omit<MemoryBlockOptions, "priority" | "isLongTerm">;

/**
 * A memory block that stores static content that doesn't change.
 * Static content is always included in the memory context.
 */
export class StaticMemoryBlock<
  TAdditionalMessageOptions extends object = object,
> extends BaseMemoryBlock<TAdditionalMessageOptions> {
  private readonly content: MessageContent;
  private readonly messageRole: MessageType;

  constructor(options: StaticMemoryBlockOptions) {
    super({ ...options, priority: 0, isLongTerm: false });
    this.content = options.content;
    this.messageRole = options.messageRole ?? "user";
  }

  /**
   * Returns the static content.
   * The messages parameter is ignored since this block contains static content.
   */
  async get(
    _messages?: MemoryMessage<TAdditionalMessageOptions>[],
    _blockKwargs?: Record<string, unknown>,
  ): Promise<MemoryMessage<TAdditionalMessageOptions>[]> {
    return [
      {
        id: this.id,
        role: this.messageRole,
        content: this.content,
      },
    ];
  }

  async put(
    _messages: MemoryMessage<TAdditionalMessageOptions>[],
  ): Promise<void> {
    // No-op: static content doesn't change
  }
}
