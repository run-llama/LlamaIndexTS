import type { QueryBundle } from '../query-engine';
import {
	EngineResponse,
	type NodeWithScore,
} from '../schema';


export type SynthesizeQuery = {
	query: QueryBundle;
	nodes: NodeWithScore[];
	additionalSourceNodes?: NodeWithScore[];
}

export type SynthesizeStartEvent = {
	id: string;
	query: SynthesizeQuery;
}

export type SynthesizeEndEvent = {
	id: string;
	query: SynthesizeQuery;
	response: EngineResponse | AsyncIterable<EngineResponse>;
}