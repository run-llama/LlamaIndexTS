import type { MessageContent } from '../../dist/llms';
import type { NodeWithScore } from '../../dist/schema';
import type { QueryBundle, QueryType } from '../query-engine';
import { Settings } from '../global';

export type RetrieveParams = {
	query: MessageContent;
	preFilters?: unknown;
};

export abstract class BaseRetriever {
	public async retrieve(params: QueryType): Promise<NodeWithScore[]> {
		const cb = Settings.callbackManager
		cb.dispatchEvent('retrieve-start', { id: 'todo', query: params });
		const queryBundle = typeof params === 'string' ? { query: params } : params;
		const response = await this._retrieve(queryBundle);
		cb.dispatchEvent('retrieve-end', { id: 'todo', response });
		return response;
	}

	abstract _retrieve(params: QueryBundle): Promise<NodeWithScore[]>;
}