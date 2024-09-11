import { describe, expect, test } from 'vitest';
import {
	SQLiteVectorStore,
	VectorStoreQueryMode
} from 'llamaindex/vector-store';
import { Document } from '@llamaindex/core/schema';

describe("better sqlite3", () => {
	test("init from better sqlite3", async () => {
		const vectorStore = await SQLiteVectorStore.fromBetterSqlite3('llamaindex_node_test');
		const client = vectorStore.client()
		expect(client).toBeDefined();
		client.close();
	})

	test('add and query', async () => {
		const nodes = [
			new Document({
				text: 'hello world',
				embedding: [0.1, 0.2, 0.3],
			}),
			new Document({
				text: 'hello world 2',
				embedding: [0.2, 0.3, 0.4],
			}),
		]
		const vectorStore = await SQLiteVectorStore.fromBetterSqlite3('llamaindex_node_test');
		await vectorStore.add(nodes);
		{
			const result = await vectorStore.query({
				mode: VectorStoreQueryMode.DEFAULT,
				similarityTopK: 1,
				queryEmbedding: [0.1, 0.2, 0.3]
			});
			expect(result.nodes).toHaveLength(1);
			expect(result.ids).toHaveLength(1);
			await vectorStore.delete(result.ids[0]!);
		}
		{
			const result = await vectorStore.query({
				mode: VectorStoreQueryMode.DEFAULT,
				similarityTopK: 1,
				queryEmbedding: [0.1, 0.2, 0.3]
			});
			console.log(result);
			expect(result.nodes).toHaveLength(0);
			expect(result.ids).toHaveLength(0);
		}
	})
});
