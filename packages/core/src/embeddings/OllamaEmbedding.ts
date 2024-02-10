import { Ollama } from "../llm/ollama";
import { BaseEmbedding } from "./types";

/**
 * OllamaEmbedding is an alias for Ollama that implements the BaseEmbedding interface.
 */
export class OllamaEmbedding extends Ollama implements BaseEmbedding {}
