import { EngineResponse, type NodeWithScore } from '../schema';

export type QueryBundle = {
	query: string;
	imagePath?: string;
	customEmbeddings?: string[];
	embeddings?: number[];
}

export type QueryType = string | QueryBundle;

export interface BaseQueryEngine {
	query(
		strOrQueryBundle: QueryType,
		stream: true,
	): Promise<AsyncIterable<EngineResponse>>;
	query(
		strOrQueryBundle: QueryType,
		stream?: false,
	): Promise<EngineResponse>;

	synthesize?(
		strOrQueryBundle: QueryType,
		nodes: NodeWithScore[],
		additionalSources?: Iterator<NodeWithScore>,
	): Promise<EngineResponse>;
}