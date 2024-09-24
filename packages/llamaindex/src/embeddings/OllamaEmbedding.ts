import type { BaseEmbedding } from "@llamaindex/core/embeddings";
import { Ollama } from "@llamaindex/ollama";

/**
 * OllamaEmbedding is an alias for Ollama that implements the BaseEmbedding interface.
 */
export class OllamaEmbedding extends Ollama implements BaseEmbedding {}
