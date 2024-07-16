import type { BaseEmbedding } from "@llamaindex/core/embeddings";
import { Ollama } from "../llm/ollama.js";

/**
 * OllamaEmbedding is an alias for Ollama that implements the BaseEmbedding interface.
 */
export class OllamaEmbedding extends Ollama implements BaseEmbedding {}
