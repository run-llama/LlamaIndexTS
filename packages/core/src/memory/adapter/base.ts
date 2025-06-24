import type { MemoryMessage } from "../types";

export interface MessageAdapter<T, TMessageOptions extends object = object> {
  fromMemory(message: MemoryMessage<TMessageOptions>): T;
  toMemory(message: T): MemoryMessage<TMessageOptions>;
  isCompatible(message: unknown): message is T;
}
