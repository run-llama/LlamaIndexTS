import type { MessageContent } from '../llms';
import type { NodeWithScore } from './node';

export class EngineResponse<Metadata extends Record<string, any> = Record<string, unknown>> {
	constructor (
		readonly message: MessageContent,
		readonly sourceNodes?: NodeWithScore<Metadata>[],
		readonly metadata?: Metadata
	) {}

	static from<
		Metadata extends Record<string, any> = Record<string, any>
	> (
		message: MessageContent,
		sourceNodes?: NodeWithScore<Metadata>[],
		metadata?: Metadata
	): EngineResponse<Metadata> {
		return new EngineResponse(message, sourceNodes, metadata);
	}
}

export class StreamEngineResponse<
	Metadata extends Record<string, any> = Record<string, any>
> implements AsyncIterable<MessageContent> {
	constructor (
		readonly iterable: AsyncIterable<MessageContent>,
		readonly sourceNodes?: NodeWithScore<Metadata>[],
		readonly metadata?: Metadata
	) {}

	static from<
		Metadata extends Record<string, any> = Record<string, any>
	> (
		iterable: AsyncIterable<MessageContent>,
		sourceNodes?: NodeWithScore<Metadata>[],
		metadata?: Metadata
	): StreamEngineResponse<Metadata> {
		return new StreamEngineResponse(iterable, sourceNodes, metadata);
	}

	[Symbol.asyncIterator] (): AsyncIterator<MessageContent> {
		return this.iterable[Symbol.asyncIterator]();
	}
}


