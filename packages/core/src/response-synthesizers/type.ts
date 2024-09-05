import type { QueryBundle } from '../query-engine';
import {
	EngineResponse,
	type NodeWithScore,
	StreamEngineResponse
} from '../schema';


export type SynthesizeQuery = {
	query: QueryBundle;
	nodes?: NodeWithScore[];
	additionalSourceNodes?: NodeWithScore[];
}

export type SynthesizeStartEvent = {
	id: string;
	query: SynthesizeQuery;
}

export type SynthesizeEndEvent = {
	id: string;
	query: SynthesizeQuery;
	response: EngineResponse | StreamEngineResponse;
}
