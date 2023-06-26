import {
  DEFAULT_CONTEXT_WINDOW,
  DEFAULT_NUM_OUTPUTS,
  DEFAULT_CHUNK_OVERLAP_RATIO,
} from "./constants";

class PromptHelper {
  contextWindow = DEFAULT_CONTEXT_WINDOW;
  numOutput = DEFAULT_NUM_OUTPUTS;
  chunkOverlapRatio = DEFAULT_CHUNK_OVERLAP_RATIO;
  chunkSizeLimit?: number;
  tokenizer?: (text: string) => string[];
  separator = " ";
}
