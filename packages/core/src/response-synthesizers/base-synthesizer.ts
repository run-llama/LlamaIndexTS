import type { QueryBundle } from '../query-engine';
import {
	EngineResponse,
	StreamEngineResponse
} from '../schema';
import type { LLM } from '../llms';
import { PromptHelper } from '../indices';
import { Settings } from '../global';
import { randomUUID } from '@llamaindex/env';
import type { SynthesizeQuery } from './type';

export type BaseSynthesizerOptions = {
	llm: LLM;
	promptHelper: PromptHelper;
}

export abstract class BaseSynthesizer {
	llm: LLM;
	promptHelper: PromptHelper;

	protected constructor (
		protected readonly get_response: (
			query: SynthesizeQuery,
			stream: boolean
		) => Promise<EngineResponse | StreamEngineResponse>,
		options: Partial<BaseSynthesizerOptions>
	) {
		this.llm = options.llm ?? Settings.llm;
		this.promptHelper = options.promptHelper ?? PromptHelper.fromLLMMetadata(
			this.llm.metadata
		);
	}

	synthesize (
		query: SynthesizeQuery,
		stream: true
	): Promise<StreamEngineResponse>;
	synthesize (query: SynthesizeQuery, stream?: false): Promise<EngineResponse>;
	async synthesize (
		query: SynthesizeQuery,
		stream = false
	): Promise<EngineResponse | StreamEngineResponse> {
		const callbackManager = Settings.callbackManager;
		const id = randomUUID();
		callbackManager.dispatchEvent('synthesize-start', { id, query });
		const response = await this.get_response(query, stream);
		callbackManager.dispatchEvent('synthesize-end', { id, query, response });
		return response;
	}
}
