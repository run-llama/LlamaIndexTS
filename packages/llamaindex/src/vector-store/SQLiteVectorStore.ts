import {
	VectorStoreBase,
	type VectorStoreNoEmbedModel,
	type VectorStoreQuery,
	type VectorStoreQueryResult
} from './types.js';

import type { BaseEmbedding } from '@llamaindex/core/embeddings';
import {
	type BaseNode,
	Document,
	type Metadata,
	MetadataMode
} from '@llamaindex/core/schema';
import {
	type StatementResultingChanges,
	type SupportedValueType
} from 'node:sqlite';

interface Statement {
	run (
		...anonymousParameters: SupportedValueType[]
	): StatementResultingChanges;

	get
	(
		...anonymousParameters: SupportedValueType[]
	): unknown;

	all (
		...anonymousParameters: SupportedValueType[]
	): unknown[];
}

// we use node.js version as standard
type Database = {
	close (): void;
	exec (sql: string): void;
	loadExtension: (path: string) => void;
	prepare: (sql: string) => Statement;
};

export type SQLiteVectorStoreConfig = {
	filename: string;
	tableName?: string | undefined;
	dimensions?: number | undefined;
	embedModel?: BaseEmbedding | undefined;
};

/**
 * Provides support for writing and querying vector data in SQLite.
 */
export class SQLiteVectorStore
	extends VectorStoreBase
	implements VectorStoreNoEmbedModel {
	storesText: boolean = true;

	readonly tableName: string = 'vector_data';
	readonly dimensions: number = 1536;
	private db?: Database;

	public readonly filename: string;

	constructor (config: SQLiteVectorStoreConfig) {
		super(config.embedModel);
		this.tableName = config.tableName ?? this.tableName;
		this.dimensions = config.dimensions ?? this.dimensions;
		this.filename = config.filename;
	}

	static async fromBetterSqlite3 (filename: string): Promise<SQLiteVectorStore> {
		const betterSqlite3 = await import('better-sqlite3');
		const Database = 'default' in betterSqlite3
			? betterSqlite3.default
			: betterSqlite3;
		const db = new Database(filename);
		const wrapper = {
			loadExtension (path: string) {
				db.loadExtension(path);
			},
			close () {
				db.close();
			},
			exec (sql: string) {
				db.exec(sql);
			},
			prepare (sql: string) {
				const statement = db.prepare(sql);
				return {
					run (...params: SupportedValueType[]) {
						return statement.run(...params);
					},
					get (...params: SupportedValueType[]) {
						return statement.get(...params);
					},
					all (...params: SupportedValueType[]) {
						return statement.all(...params);
					}
				};
			}
		};

		const vectorStore = new SQLiteVectorStore(
			{ filename, embedModel: undefined });
		vectorStore.db = wrapper;
		await vectorStore.initializeDatabase();
		return vectorStore;
	}

	client (): Database {
		if (!this.db) {
			throw new Error('Database connection is not initialized.');
		}
		return this.db;
	}

	async initializeDatabase () {
		if (!this.db) {
			throw new Error('Database connection is not initialized.');
		}
		this.db.prepare(`CREATE TABLE IF NOT EXISTS ${this.tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, document TEXT, metadata TEXT, embeddings float[${this.dimensions}])`).
			run();
	}

	async add (nodes: BaseNode<Metadata>[]): Promise<string[]> {
		if (!this.db) {
			throw new Error('Database connection is not initialized.');
		}

		const ids: string[] = [];

		for (const node of nodes) {
			this.db.prepare(`INSERT INTO ${this.tableName} (document, metadata, embeddings) VALUES (?, ?, ?)`).
				run(node.getContent(MetadataMode.NONE), JSON.stringify(node.metadata),
					JSON.stringify(node.embedding));
		}

		return ids;
	}

	async delete (id: string): Promise<void> {
		if (!this.db) {
			throw new Error('Database connection is not initialized.');
		}

		this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`).run(id);
	}

	async query (query: VectorStoreQuery): Promise<VectorStoreQueryResult> {
		if (!this.db) {
			throw new Error('Database connection is not initialized.');
		}

		const { queryEmbedding, similarityTopK } = query;
		const embedding = JSON.stringify(queryEmbedding);

		const results = this.db.prepare(`SELECT * FROM ${this.tableName} ORDER BY ((embeddings - ?) * (embeddings - ?)) ASC LIMIT ?`).
			all(embedding, embedding, similarityTopK);

		const nodes = results.map((row: any) => new Document({
			id_: row.id.toString(),
			text: row.document,
			metadata: JSON.parse(row.metadata),
			embedding: JSON.parse(row.embeddings)
		}));

		return {
			nodes,
			similarities: [],  // Calculating similarities would require additional logic
			ids: nodes.map(node => node.id_)
		};
	}

	persist (persistPath: string): Promise<void> {
		// No implementation needed for SQLite as changes are auto-committed
		return Promise.resolve();
	}
}