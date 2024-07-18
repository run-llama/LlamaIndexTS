import type { QueryType } from '../query-engine';

export function extractQuery(
	queryType: QueryType
): string {
	return typeof queryType === 'string' ? queryType : queryType.query;
}