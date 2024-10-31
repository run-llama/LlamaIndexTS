import { BaseDocumentStore } from './types';
import { BaseNode } from '../../schema';
import type { BaseKVStore } from '../kvstore';
import { DEFAULT_BATCH_SIZE } from '../../global';
import { path } from '@llamaindex/env';
import { type DocJson, jsonToDoc } from './utils';

// The default namespace prefix for the document store.
export const DEFAULT_NAMESPACE = 'docstore';
// The nodes collection contains the content of each node, along with metadata specific
// to each node, including associated attributes like excluded metadata and relationships.
export const DEFAULT_COLLECTION_DATA_SUFFIX = '/data';
// Contains mappings from each document to the list of node IDs that belong to it
// including the document's metadata.
export const DEFAULT_REF_DOC_COLLECTION_SUFFIX = '/ref_doc_info';
// Contains references from each node to its corresponding document,
// including the node's document hash and reference document ID.
export const DEFAULT_METADATA_COLLECTION_SUFFIX = '/metadata';

export class KVDocumentStore extends BaseDocumentStore {
	private kvStore: BaseKVStore<DocJson<unknown>>;
	#namespace: string;
	#nodeCollectionSuffix: string;
	#refDocCollectionSuffix: string;
	#metadataCollectionSuffix: string;
	#nodeCollection: string;
	#refDocCollection: string;
	#metadataCollection: string;
	#batchSize: number;

	constructor (
		kvStore: BaseKVStore<DocJson>,
		namespace: string = DEFAULT_NAMESPACE,
		batchSize: number = DEFAULT_BATCH_SIZE,
		nodeCollectionSuffix: string = DEFAULT_COLLECTION_DATA_SUFFIX,
		refDocCollectionSuffix: string = DEFAULT_REF_DOC_COLLECTION_SUFFIX,
		metadataCollectionSuffix: string = DEFAULT_METADATA_COLLECTION_SUFFIX
	) {
		super();
		this.kvStore = kvStore;
		this.#namespace = namespace;
		this.#nodeCollectionSuffix = nodeCollectionSuffix;
		this.#refDocCollectionSuffix = refDocCollectionSuffix;
		this.#metadataCollectionSuffix = metadataCollectionSuffix;
		this.#nodeCollection = path.join(this.#namespace,
			this.#nodeCollectionSuffix);
		this.#refDocCollection = path.join(this.#namespace,
			this.#refDocCollectionSuffix);
		this.#metadataCollection = path.join(this.#namespace,
			this.#metadataCollectionSuffix);
		this.#batchSize = batchSize;
	}

	get docs (): Promise<Map<string, BaseNode>> {
		return this.kvStore.getAll(this.#nodeCollection).then(jsonDict => {
			const docs = new Map<string, BaseNode>();
			for (const [key, json] of Object.entries(jsonDict)) {
				docs.set(key, jsonToDoc(json, this.serializer));
			}
			return docs;
		});
	}

	#prepareKVPair(
		key: string,
		val: DocJson<unknown>,
		collection: string | undefined
	) {

	}

	async addDocuments (
		docs: BaseNode[], allowUpdate: boolean,
		batchSize?: number,
		storeText?: boolean
	) {
		batchSize = batchSize || this.#batchSize;

	}
}