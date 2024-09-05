import type { QueryType } from './base';
import { EngineResponse, StreamEngineResponse } from '../schema';

export type QueryStartEvent = {
	id: string;
	query: QueryType;
}

export type QueryEndEvent = {
	id: string;
	response: EngineResponse | StreamEngineResponse;
}
