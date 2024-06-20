import { z } from 'zod';

export enum NodeRelationship {
	SOURCE = 'source',
	PREVIOUS = 'previous',
	NEXT = 'next',
	PARENT = 'parent',
	CHILD = 'child',
}

export enum ObjectType {
	TEXT = 'text',
	IMAGE = 'image',
	INDEX = 'index',
	DOCUMENT = 'document',
}

export enum MetadataMode {
	ALL = 'all',
	EMBED = 'embed',
	LLM = 'llm',
	NONE = 'none'
}

const relatedNodeInfoSchema = z.object({
	nodeId: z.string(),
	nodeType: z.string().optional(),
	metadata: z.record(z.any()).default({}),
	hash: z.string().optional()
});

export type RelatedNodeInfo = z.infer<typeof relatedNodeInfoSchema>

type RelatedNodeType = RelatedNodeInfo | RelatedNodeInfo[]

const baseNodeSchema = z.object({
	id_: z.string(),
	metadata: z.record(z.any()).default({}),
	excludedEmbedMetadataKeys: z.array(z.string()).default([]),
	excludedLlmMetadataKeys: z.array(z.string()).default([]),
	relationships: z.record(z.any()).default({}),
	hash: z.string().optional(),
	embedding: z.array(z.number()).optional()
})

export abstract class BaseNode {
	/**
	 * The unique ID of the Node/Document. The trailing underscore is here
	 * to avoid collisions with the id keyword in Python.
	 *
	 * Set to a UUID by default.
	 */
	id_: string;
	embedding?: number[];

	// Metadata fields
	metadata: T;
	excludedEmbedMetadataKeys: string[];
	excludedLlmMetadataKeys: string[];
	relationships: Partial<Record<NodeRelationship, RelatedNodeType<T>>>;

	accessor hash: string = "";

	protected constructor(init?: BaseNodeParams<T>) {
		const {
			id_,
			metadata,
			excludedEmbedMetadataKeys,
			excludedLlmMetadataKeys,
			relationships,
			hash,
			embedding,
		} = init || {};
		this.id_ = id_ ?? randomUUID();
		this.metadata = metadata ?? ({} as T);
		this.excludedEmbedMetadataKeys = excludedEmbedMetadataKeys ?? [];
		this.excludedLlmMetadataKeys = excludedLlmMetadataKeys ?? [];
		this.relationships = relationships ?? {};
		this.embedding = embedding;
	}

	abstract get type(): ObjectType;

	abstract getContent(metadataMode: MetadataMode): string;
	abstract getMetadataStr(metadataMode: MetadataMode): string;
	// todo: set value as a generic type
	abstract setContent(value: unknown): void;

	get sourceNode(): RelatedNodeInfo | undefined {
		const relationship = this.relationships[NodeRelationship.SOURCE];

		if (Array.isArray(relationship)) {
			throw new Error("Source object must be a single RelatedNodeInfo object");
		}

		return relationship;
	}

	get prevNode(): RelatedNodeInfo<T> | undefined {
		const relationship = this.relationships[NodeRelationship.PREVIOUS];

		if (Array.isArray(relationship)) {
			throw new Error(
				"Previous object must be a single RelatedNodeInfo object",
			);
		}

		return relationship;
	}

	get nextNode(): RelatedNodeInfo | undefined {
		const relationship = this.relationships[NodeRelationship.NEXT];

		if (Array.isArray(relationship)) {
			throw new Error("Next object must be a single RelatedNodeInfo object");
		}

		return relationship;
	}

	get parentNode(): RelatedNodeInfo | undefined {
		const relationship = this.relationships[NodeRelationship.PARENT];

		if (Array.isArray(relationship)) {
			throw new Error("Parent object must be a single RelatedNodeInfo object");
		}

		return relationship;
	}

	get childNodes(): RelatedNodeInfo[] | undefined {
		const relationship = this.relationships[NodeRelationship.CHILD];

		if (!Array.isArray(relationship)) {
			throw new Error(
				"Child object must be a an array of RelatedNodeInfo objects",
			);
		}

		return relationship;
	}

	abstract generateHash(): string;

	getEmbedding(): number[] {
		if (this.embedding === undefined) {
			throw new Error("Embedding not set");
		}

		return this.embedding;
	}

	asRelatedNodeInfo(): RelatedNodeInfo {
		return {
			nodeId: this.id_,
			metadata: this.metadata,
			hash: this.hash,
		};
	}

	/**
	 * Called by built in JSON.stringify (see https://javascript.info/json)
	 * Properties are read-only as they are not deep-cloned (not necessary for stringification).
	 * @see toMutableJSON - use to return a mutable JSON instead
	 */
	toJSON(): Record<string, any> {
		return {
			...this,
			type: this.type,
			// hash is an accessor property, so it's not included in the rest operator
			hash: this.hash,
		};
	}

	clone(): BaseNode {
		return jsonToNode(this.toMutableJSON()) as BaseNode;
	}

	/**
	 * Converts the object to a JSON representation.
	 * Properties can be safely modified as a deep clone of the properties are created.
	 * @return {Record<string, any>} - The JSON representation of the object.
	 */
	toMutableJSON(): Record<string, any> {
		return structuredClone(this.toJSON());
	}
}
