import { AsyncLocalStorage } from "@llamaindex/env";
import type { LLM } from '../../llms';

const chunkSizeAsyncLocalStorage = new AsyncLocalStorage<LLM>();
let globalLLM: LLM | null = null;

export function getLLM(): LLM {
	const currentLLM = globalLLM ?? chunkSizeAsyncLocalStorage.getStore()
	if (!currentLLM) {
		throw new Error('No LLM found, please set one default LLM before using the module');
	}
	return currentLLM;
}

export function setLLM(tokenizer: LLM) {
	if (tokenizer !== undefined) {
		globalLLM = tokenizer;
	}
}

export function withLLM<Result>(
	tokenizer: LLM,
	fn: () => Result,
): Result {
	return chunkSizeAsyncLocalStorage.run(tokenizer, fn);
}
