import { BaseFileSystemKVStore, type SerializableValue } from './types';
import { fs } from '@llamaindex/env';
import {
	DEFAULT_COLLECTION,
	DEFAULT_COLLECTION_DATA_SUFFIX
} from '../../global';

export class SimpleKVStore<Value extends SerializableValue = SerializableValue> extends BaseFileSystemKVStore<Value> {
	data: Map<string, Map<string, Value>>

	constructor (
		initialData?: Record<string, Record<string, Value>> | Map<string, Map<string, Value>>
	) {
		super();
		if (initialData) {
			this.data = new Map(initialData ? Object.entries(initialData) : []);
		} else {
			this.data = new Map();
		}
	}

	persist (persistPath: string): Promise<void> {
		return fs.writeFile(persistPath, JSON.stringify(Object.fromEntries(this.data.entries())));
	}

	async put (key: string, val: Value, collection: string = DEFAULT_COLLECTION_DATA_SUFFIX) {
		const collectionData = this.data.get(collection) ?? new Map();
		collectionData.set(key, val);
		this.data.set(collection, collectionData);
	}

	async get (key: string, collection: string = DEFAULT_COLLECTION) {
		const collectionData = this.data.get(collection);
		if (!collectionData) {
			return null;
		}
		return collectionData.get(key) ?? null;
	}

	async getAll (collection: string = DEFAULT_COLLECTION) {
		return this.data.get(collection) ?? {};
	}

	async delete (key: string, collection: string = DEFAULT_COLLECTION) {
		const collectionData = this.data.get(collection);
		if (!collectionData) {
			return false;
		}
		return collectionData.delete(key);
	}

	static async fromPersistPath<Value extends SerializableValue = SerializableValue> (persistPath: string): Promise<SimpleKVStore<Value>> {
		const data = JSON.parse(await fs.readFile(persistPath, 'utf-8'));
		return new SimpleKVStore(data);
	}
}