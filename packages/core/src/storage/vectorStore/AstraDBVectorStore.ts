import { AstraDB } from "@datastax/astra-db-ts";
import { Collection } from "@datastax/astra-db-ts/dist/collections";
import { BaseNode, MetadataMode } from "../../Node";
import {
  VectorStore,
  VectorStoreQuery,
  VectorStoreQueryMode,
  VectorStoreQueryResult,
} from "./types";
import { metadataDictToNode, nodeToMetadata } from "./utils";

const MAX_INSERT_BATCH_SIZE = 20;

export class AstraDBVectorStore implements VectorStore {
  storesText: boolean = true;
  flatMetadata: boolean = true;

  astraDBClient: AstraDB;
  collection: Collection | undefined;

  constructor() {
    const token = process.env.ASTRA_DB_APPLICATION_TOKEN;
    const dbId = process.env.ASTRA_DB_ID;
    const region = process.env.ASTRA_DB_REGION;
    const keyspace = process.env.ASTRA_DB_NAMESPACE;

    if (!dbId) {
      throw new Error("Must specify ASTRA_DB_ID via env variable.");
    }
    if (!token) {
      throw new Error(
        "Must specify ASTRA_DB_APPLICATION_TOKEN via env variable.",
      );
    }
    if (!region) {
      throw new Error("Must specify ASTRA_DB_REGION via env variable.");
    }
    this.astraDBClient = new AstraDB(token, dbId, region, keyspace);
  }

  async create(collection: string, options?: any): Promise<void> {
    await this.astraDBClient.createCollection(collection, options);
    console.debug("Created Astra DB collection");

    return;
  }

  async connect(collection: string): Promise<void> {
    this.collection = await this.astraDBClient.collection(collection);
    console.debug("Connected to Astra DB collection");

    return;
  }

  client(): AstraDB {
    return this.astraDBClient;
  }

  async add(nodes: BaseNode[]): Promise<string[]> {
    if (!this.collection) {
      throw new Error("Must connect to collection before adding.");
    }
    const collection = this.collection;

    if (!nodes || nodes.length === 0) {
      return [];
    }
    const dataToInsert = nodes.map((node) => {
      const metadata = nodeToMetadata(node, true, undefined, this.flatMetadata);

      return {
        _id: node.id_,
        $vector: node.getEmbedding(),
        content: node.getContent(MetadataMode.NONE) || "",
        metadata,
      };
    });

    console.debug(`Adding ${dataToInsert.length} rows to table`);

    // Perform inserts in steps of MAX_INSERT_BATCH_SIZE
    let batchData = [];

    for (let i = 0; i < dataToInsert.length; i += MAX_INSERT_BATCH_SIZE) {
      batchData.push(dataToInsert.slice(i, i + MAX_INSERT_BATCH_SIZE));
    }

    for (const batch of batchData) {
      console.debug(`Inserting batch of size ${batch.length}`);

      const result = await collection.insertMany(batch);
    }

    return dataToInsert.map((node) => node._id);
  }

  async delete(refDocId: string, deleteOptions?: any): Promise<void> {
    if (!this.collection) {
      throw new Error("Must connect to collection before deleting.");
    }
    const collection = this.collection;

    console.debug(`Deleting row with id ${refDocId}`);

    await this.collection.deleteOne(
      {
        _id: refDocId,
      },
      deleteOptions,
    );
  }

  async query(
    query: VectorStoreQuery,
    options?: any,
  ): Promise<VectorStoreQueryResult> {
    if (!this.collection) {
      throw new Error("Must connect to collection before querying.");
    }
    const collection = this.collection;

    const availableQueryModes = [
      VectorStoreQueryMode.DEFAULT,
      VectorStoreQueryMode.MMR,
    ];

    if (!availableQueryModes.includes(query.mode)) {
      throw new Error("Query mode must be one of: " + availableQueryModes);
    }

    const filters: Record<string, any> = {};
    query.filters?.filters?.forEach((f) => {
      filters[f.key] = f.value;
    });

    const cursor = await collection.find(filters, {
      sort: query.queryEmbedding
        ? { $vector: query.queryEmbedding }
        : undefined,
      limit: query.similarityTopK,
      includeSimilarity: true,
    });

    const nodes: BaseNode[] = [];
    const ids: string[] = [];
    const similarities: number[] = [];

    await cursor.forEach(async (doc: Record<string, any>) => {
      // console.log(doc);
      ids.push(doc._id);
      similarities.push(doc.$similarity);
      const node = metadataDictToNode({
        _node_content: JSON.stringify({ text: doc }),
      });
      delete doc.$vector;
      node.setContent(JSON.stringify(doc));
      nodes.push(node);
      // nodes.push(new Document({
      //   id_: doc._id,
      //   text: doc.document,
      //   metadata: row.metadata,
      //   embedding: doc.$vector,
      // }))
    });

    return {
      similarities,
      ids,
      nodes,
    };
  }
}
