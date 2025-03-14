import { atom } from "jotai/vanilla";
import type { BaseToolWithCall, ToolMetadata } from "llamaindex";
import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { store, toolMetadataAtom, toolsAtom, type Info } from "./internal";

export type { Info };

/**
 * @internal This function is used by the compiler to inject metadata into the source code.
 */
export function injectMetadata(metadata: ToolMetadata, info: Info) {
  store.get(toolMetadataAtom).push([metadata, info]);
}

const openaiToolsAtom = atom<ChatCompletionTool[]>((get) => {
  const metadata = get(toolMetadataAtom);
  return metadata.map(([metadata]) => ({
    type: "function",
    function: metadata.parameters
      ? {
          parameters: metadata.parameters,
          name: metadata.name,
          description: metadata.description,
        }
      : {
          name: metadata.name,
          description: metadata.description,
        },
  }));
});

const llamaindexToolsAtom = atom<BaseToolWithCall[]>((get) => {
  const metadata = get(toolMetadataAtom);
  const fns = get(toolsAtom);
  return metadata.map(([metadata, info]) => ({
    call: (input: Record<string, unknown>) => {
      const args = Object.entries(info.parameterMapping).reduce(
        (arr, [name, idx]) => {
          arr[idx] = input[name];
          return arr;
        },
        [] as unknown[],
      );
      const fn = fns[metadata.name] ?? info.originalFunction;
      if (!fn) {
        throw new Error(`Cannot find function to call: ${metadata.name}`);
      }
      return fn(...args);
    },
    metadata,
  }));
});

export function convertTools(format: "openai"): ChatCompletionTool[];
export function convertTools(format: "llamaindex"): BaseToolWithCall[];
export function convertTools(
  format: string,
): ChatCompletionTool[] | BaseToolWithCall[] {
  switch (format) {
    case "openai": {
      return store.get(openaiToolsAtom);
    }
    case "llamaindex": {
      return store.get(llamaindexToolsAtom);
    }
  }
  throw new Error(`Unknown format: ${format}`);
}

/**
 * Call a tool by name with the given input.
 */
export function callTool(
  name: string,
  input: string | Record<string, unknown>,
): unknown | Promise<unknown> {
  const tools = store.get(llamaindexToolsAtom);
  const targetTool = tools.find((tool) => tool.metadata.name === name);
  if (!targetTool) {
    throw new Error(`Cannot find tool: ${name}`);
  }
  return targetTool.call(
    // for OpenAI, input is a string
    // for ClaudeAI, input is an object
    typeof input === "string" ? JSON.parse(input) : input,
  );
}
