import { EngineResponse, MetadataMode } from '../schema';
import type { LLM, MessageContent } from '../llms';
import { PromptHelper } from '../indices';
import { Settings } from '../global';
import { randomUUID } from '@llamaindex/env';
import type { SynthesizeQuery } from './type';
import { PromptMixin } from '../prompts';

export type BaseSynthesizerOptions = {
	llm?: LLM;
	promptHelper?: PromptHelper;
}

export abstract class BaseSynthesizer extends PromptMixin {
	llm: LLM;
	promptHelper: PromptHelper;

	protected constructor (
		options: Partial<BaseSynthesizerOptions>
	) {
		super();
		this.llm = options.llm ?? Settings.llm;
		this.promptHelper = options.promptHelper ?? PromptHelper.fromLLMMetadata(
			this.llm.metadata
		);
	}

	protected abstract getResponse (
		query: MessageContent,
		textChunks: string[],
		stream: boolean
	): Promise<EngineResponse | AsyncIterable<EngineResponse>>

	synthesize (
		query: SynthesizeQuery,
		stream: true
	): Promise<AsyncIterable<EngineResponse>>;
	synthesize (query: SynthesizeQuery, stream?: false): Promise<EngineResponse>;
	async synthesize (
		query: SynthesizeQuery,
		stream = false
	): Promise<EngineResponse | AsyncIterable<EngineResponse>> {
		const callbackManager = Settings.callbackManager;
		const id = randomUUID();
		callbackManager.dispatchEvent('synthesize-start', { id, query });
		let response: EngineResponse | AsyncIterable<EngineResponse>;
		if (query.nodes.length === 0) {
			if (stream) {
				response = EngineResponse.fromResponse("Empty Response", true)
			} else {
				response = EngineResponse.fromResponse("Empty Response", false)
			}
		}
		else {
			const queryMessage = query.query.query;
			const textChunks = query.nodes.map(
				({ node }) => node.getContent(MetadataMode.LLM));
			response = await this.getResponse(queryMessage, textChunks, stream);
		}
		callbackManager.dispatchEvent('synthesize-end', { id, query, response });
		return response;
	}
}