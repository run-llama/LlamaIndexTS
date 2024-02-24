import { Ollama } from "../llm/ollama.js";
import type { BaseEmbedding } from "./types.js";

/**
 * OllamaEmbedding is an alias for Ollama that implements the BaseEmbedding interface.
 */
export class OllamaEmbedding extends Ollama implements BaseEmbedding {}
