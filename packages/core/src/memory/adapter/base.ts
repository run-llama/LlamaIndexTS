import type { MemoryMessage } from "../types";

export interface MessageAdapter<T> {
  fromMemory(message: MemoryMessage): T;
  toMemory(message: T): MemoryMessage;
  isCompatible(message: unknown): message is T;
}
