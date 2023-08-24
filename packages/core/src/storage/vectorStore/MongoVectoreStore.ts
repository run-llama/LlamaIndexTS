import { Collection, MongoClient } from "mongodb";
import { BaseNode, MetadataMode, TextNode } from "../../Node";
import {
  MetadataFilters,
  VectorStore,
  VectorStoreQuery,
  VectorStoreQueryResult,
} from "./types";

type KeyValue = Record<string, any>;

interface MongoDBAtlasVectorSearchOptions {
  mongodbClient: MongoClient;
  collection?: string;
  indexName?: string;
  embeddingKey?: string;
  idKey?: string;
  textKey?: string;
  metadataKey?: string;
  insertKwargs?: KeyValue;
  dbName?: string;
}

const DEFAULT_TEXT_KEY = "text";

function nodeToMetadataDict(
  node: BaseNode,
  removeText: boolean = false,
  textField: string = DEFAULT_TEXT_KEY,
): Record<string, any> {
  const metadata: Record<string, any> = node.metadata;

  // Store entire node as a JSON string - some minor text duplication
  const nodeDict = node.toJSON();
  if (removeText) {
    nodeDict[textField] = "";
  }
  nodeDict["embedding"] = null;
  metadata["node_content"] = JSON.stringify(nodeDict);
  metadata["ref_doc_id"] = node.id_;
  return metadata;
}

function metadataDictToNode(metadata: KeyValue) {
  const nodeJson: KeyValue = JSON.parse(metadata["node_content"]);
  return new TextNode(nodeJson);
}

function toMongodbFilter(standardFilters: MetadataFilters): KeyValue {
  const { filters } = standardFilters;
  return filters.reduce((acc, cur) => {
    acc[cur.key] = cur.value;
    return acc;
  }, {} as KeyValue);
}

export class MongoVectoreStore implements VectorStore {
  private _mongodbClient: MongoClient;
  private _collection: Collection;
  private _indexName: string;
  private _embeddingKey: string;
  private _idKey: string;
  private _textKey: string;
  private _metadataKey: string;
  private _insertKwargs: KeyValue;
  storesText: boolean = true;
  flatMetadata: boolean = true;
  constructor(options: MongoDBAtlasVectorSearchOptions) {
    const {
      mongodbClient,
      dbName,
      collection = "default_collection",
      indexName = "default",
      idKey = "id",
      embeddingKey = "embedding",
      textKey = "text",
      metadataKey = "metadata",
      insertKwargs = {},
      ...kwargs
    } = options;

    this._mongodbClient = mongodbClient;
    this._collection = this._mongodbClient.db(dbName).collection(collection);
    this._indexName = indexName;
    this._embeddingKey = embeddingKey;
    this._idKey = idKey;
    this._textKey = textKey;
    this._metadataKey = metadataKey;
    this._insertKwargs = insertKwargs;
  }

  async add(embeddingResults: BaseNode[]): Promise<string[]> {
    const ids: string[] = [];
    const dataToInsert: KeyValue[] = [];
    for (let result of embeddingResults) {
      const nodeId = result.id_;
      const metadata = nodeToMetadataDict(result, true);
      const entry: KeyValue = {
        [this._idKey]: nodeId,
        [this._embeddingKey]: result.embedding,
        [this._textKey]: result.getContent(MetadataMode.NONE) || "",
        [this._metadataKey]: metadata,
      };
      dataToInsert.push(entry);
      ids.push(nodeId);
    }
    const insertResult = this._collection.insertMany(
      dataToInsert,
      this._insertKwargs,
    );
    return ids;
  }

  async delete(refDocId: string, delete_kwargs: KeyValue): Promise<void> {
    this._collection.deleteOne(
      { [`${this._metadataKey}.ref_doc_id`]: refDocId },
      delete_kwargs,
    );
  }

  get client(): any {
    return this._mongodbClient;
  }

  async query(query: VectorStoreQuery): Promise<VectorStoreQueryResult> {
    const knnBeta: KeyValue = {
      vector: query.queryEmbedding,
      path: this._embeddingKey,
      k: query.similarityTopK,
    };

    if (query.filters) {
      knnBeta.filter = toMongodbFilter(query.filters);
    }

    const pipeline: KeyValue[] = [
      {
        $search: {
          index: this._indexName,
          knnBeta,
        },
      },
      {
        $project: {
          score: { $meta: "searchScore" },
          [this._embeddingKey]: 0,
        },
      },
    ];

    const docs = await this._collection.aggregate(pipeline).toArray();

    const topKNodes: BaseNode[] = [];
    const topKIds: string[] = [];
    const topKScores: number[] = [];

    for (const doc of docs) {
      const score = doc.score;
      const id = doc[this._idKey];
      const metadataDict = doc[this._metadataKey];
      const node = metadataDictToNode(metadataDict);
      topKIds.push(id);
      topKNodes.push(node);
      topKScores.push(score);
    }

    const result: VectorStoreQueryResult = {
      nodes: topKNodes,
      similarities: topKScores,
      ids: topKIds,
    };

    return result;
  }
}
