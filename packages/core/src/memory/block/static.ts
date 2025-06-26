import type { MessageContent, MessageType } from "../../llms";
import type { MemoryMessage } from "../types";
import { BaseMemoryBlock, type MemoryBlockOptions } from "./base";

export type StaticMemoryBlockOptions = {
  /**
   * The static content to store.
   */
  staticContent: MessageContent;
  /**
   * The role of the message.
   */
  messageRole?: MessageType;
} & MemoryBlockOptions & {
    isLongTerm?: false;
    priority: 0; // Always included in the memory context
  };

/**
 * A memory block that stores static content that doesn't change.
 */
export class StaticMemoryBlock<
  TAdditionalMessageOptions extends object = object,
> extends BaseMemoryBlock<TAdditionalMessageOptions> {
  private readonly staticContent: MessageContent;
  private readonly messageRole: MessageType;

  constructor(options: StaticMemoryBlockOptions) {
    super(options);
    this.staticContent = options.staticContent;
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
        content: this.staticContent,
      },
    ];
  }

  async put(
    _messages: MemoryMessage<TAdditionalMessageOptions>[],
  ): Promise<void> {
    // No-op: static content doesn't change
  }
}
