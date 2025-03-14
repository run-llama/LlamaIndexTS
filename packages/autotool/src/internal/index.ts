import { atom, createStore } from "jotai/vanilla";
import type { ToolMetadata } from "llamaindex";

export type Info = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  originalFunction?: (...args: any[]) => any;
  /**
   * In current LLM, it doesn't support non-object parameter, so we mock arguments as object, and use this mapping to convert it back.
   */
  parameterMapping: Record<string, number>;
};

/**
 * This is used in parser side to store the original function and parameter mapping.
 *
 * In the runtime, originalFunction is a JS function.
 *
 * @internal
 */
export type InfoString = {
  originalFunction: string | undefined;
  parameterMapping: Record<string, number>;
};

export const store: ReturnType<typeof createStore> = createStore();
export const toolMetadataAtom = atom<[ToolMetadata, Info][]>([]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toolsAtom = atom<Record<string, (...args: any[]) => any>>({});
