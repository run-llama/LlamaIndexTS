import _ from "lodash";
import { GenericFileSystem, exists } from "../FileSystem";
import {
  MetadataFilters,
  NodeWithEmbedding,
  VectorStore,
  VectorStoreQuery,
  VectorStoreQueryMode,
  VectorStoreQueryResult,
  VectorStoreQuerySpec,
} from "./types";
import {
  getTopKEmbeddings,
  getTopKEmbeddingsLearner,
  getTopKMMREmbeddings,
} from "../../Embedding";
import { DEFAULT_PERSIST_DIR, DEFAULT_FS } from "../constants";
import { DEFAULT_TEXT_KEY, nodeToMetadataDict, metadataDictToNode } from "./utils";
import {
  TextNode
} from "../../Node"; 

const DEFAULT_BATCH_SIZE = 100



function buildDict(inputBatch: number[][]): Record<string, any>[] {
  const sparseEmb: Record<string, any>[] = [];

  for (const tokenIds of inputBatch) {
    const indices: number[] = [];
    const values: number[] = [];

    // count tokenIds
    const counterDict: Record<string, number> = {}
    for (let tokenId of tokenIds) {
      if (tokenId in counterDict) {
        counterDict[tokenId] += 1;
      } else {
        counterDict[tokenId] = 1;
      }
    }

    for (const idx in counterDict) {
      indices.push(Number(idx));
      values.push(counterDict[idx]);
    }

    sparseEmb.push({ indices, values });
  }

  return sparseEmb;
}


function generateSparseVectors(
  contextBatch: string[],
  tokenizer: any
): Record<string, any>[] {
  let inputs = tokenizer(contextBatch)["input_ids"]
  
  let sparseEmbeds = buildDict(inputs)
  return sparseEmbeds
}


function toPineconeFilter(filters: MetadataFilters): Record<string, any> {
  let filter_dict: Record<string, any> = {};
  for (const filter of filters.filters) {
    filter_dict[filter.key] = filter.value;
  }
  return filter_dict;
}



export class PineconeVectorStore implements VectorStore {
  storesText: boolean = true;

  pineconeIndex?: any;
  indexName?: string;
  environment?: string;
  namespace?: string;
  insertKwargs?: { [key: string]: any };
  addSparseVector?: boolean;
  tokenizer?: any;
  textKey: string = DEFAULT_TEXT_KEY;
  batchSize: number = DEFAULT_BATCH_SIZE;

  constructor(
    pineconeIndex?: any, 
    indexName?: string, 
    environment?: string,
    namespace?: string,
    insertKwargs?: { [key: string]: any },
    addSparseVector?: boolean,
    tokenizer?: any,
    textKey: string = DEFAULT_TEXT_KEY,
    batchSize: number = DEFAULT_BATCH_SIZE,
    ...kwargs: any[]
  ) {
    const importErrMsg = '`pinecone` package not found, please run `pnpm install @pinecone-database/pinecone`';
    let pinecone_pkg;
    try {
      pinecone_pkg = require('@pinecone-database/pinecone');
    } catch (err) {
      throw new Error(importErrMsg);
    }
    let pinecone = pinecone_pkg.PineconeClient();
    let VectorOperationsApi = pinecone_pkg.VectorOperationsApi;

    this.indexName = indexName;
    this.environment = environment;
    this.namespace = namespace;
    if (pineconeIndex !== null) {
      this.pineconeIndex = pineconeIndex as VectorOperationsApi;
    } else {
      if (process.env.PINECONE_API_KEY === undefined) {
        throw new Error('Must specify PINECONE_API_KEY via env variable if not directly passing in client.');
      }
      if (indexName === null || environment === null) {
        throw new Error('Must specify index_name and environment if not directly passing in client.');
      }

      pinecone.init({ environment: environment});
      this.pineconeIndex = new pinecone.Index(indexName);
    }

    this.insertKwargs = insertKwargs || {};

    this.addSparseVector = addSparseVector;
    if (tokenizer === null) {
      tokenizer = get_default_tokenizer(); // Implement get_default_tokenizer function
    }
    this.tokenizer = tokenizer;
    this.textKey = textKey;
    this.batchSize = batchSize;
  }

  get client(): any {
    return this.pineconeIndex;
  }

  add(embeddingResults: NodeWithEmbedding[]): string[] {
    const ids: string[] = [];
    const entries: any[] = []; // Replace `any` with the actual type for `entries`

    for (const result of embeddingResults) {
      const nodeId = result.id;
      const node = result.node;
      const metadata = nodeToMetadataDict(
        node,
        false, // Replace `false` with the actual boolean value
        this.flatMetadata
      );

      const entry: any = {
        idKey: nodeId,
        vectorKey: result.embedding,
        metadataKey: metadata,
      };

      if (this.addSparseVector) {
        const sparseVector = generateSparseVectors(
          [node.getContent(metadataMode = MetadataMode.EMBED)],
          this.tokenizer
        )[0];
        entry.sparseVectorKey = sparseVector;
      }

      ids.push(nodeId);
      entries.push(entry);
    }

    this.pineconeIndex.upsert(
      entries,
      {
        namespace: this.namespace,
        batchSize: this.batchSize,
        ...this.insertKwargs,
      }
    );

    return ids;
  }

  delete(refDocId: string, ...deleteKwargs: any[]): void {
    // Delete by filtering on the docId metadata
    this.pineconeIndex._delete(
      {filter: { docId: { $eq: refDocId } }},
      this.namespace,
      ...deleteKwargs
    )
    // this.pineconeIndex.delete({
    //     filter: { docId: { $eq: refDocId } },
    //     namespace: this.namespace,
    //     ...deleteKwargs,
    // });
  }
  
  query(query: VectorStoreQuery, kwargs: any): VectorStoreQueryResult {
    /**
     * Query index for top k most similar nodes.
     *
     * @param query - The query object containing query details.
     * @param kwargs - Additional keyword arguments.
     * @returns A VectorStoreQueryResult object containing the query results.
     */

    let sparseVector: any = null;
    if (
        query.mode === VectorStoreQueryMode.SPARSE ||
        query.mode === VectorStoreQueryMode.HYBRID
    ) {
        if (query.queryStr === null) {
            throw new Error("queryStr must be specified if mode is SPARSE or HYBRID.");
        }
        let queryStr = query.queryStr as string;
        sparseVector = generateSparseVectors([queryStr], this.tokenizer)[0];
        if (query.alpha !== null) {
          let alpha = query.alpha as number;
          sparseVector = {
            indices: sparseVector.indices,
            values: sparseVector.values.map((v: number) => v * (1 - alpha)),
          };
        }
    }

    let queryEmbedding: number[] | null = null;
    if (
        query.mode === VectorStoreQueryMode.DEFAULT ||
        query.mode === VectorStoreQueryMode.HYBRID
    ) {
        queryEmbedding = query.queryEmbedding as number[];
        if (query.alpha !== null) {
          let alpha = query.alpha as number;
          queryEmbedding = queryEmbedding.map((v: number) => v * alpha);
        }
    }

    let filter: any = {};
    if (query.filters !== null) {
        if ("filter" in kwargs) {
            throw new Error(
                "Cannot specify filter via both query and kwargs. Use kwargs only for pinecone specific items that are not supported via the generic query interface."
            );
        }
        filter = toPineconeFilter(query.filters as MetadataFilters);
    } else {
        filter = kwargs.filter || {};
    }

    const response = this.pineconeIndex.query({
        vector: queryEmbedding,
        sparseVector: sparseVector,
        top_k: query.similarityTopK,
        include_values: true,
        include_metadata: true,
        namespace: this.namespace,
        filter: filter,
        ...kwargs,
    });

    const topKNodes: TextNode[] = [];
    const topKIds: string[] = [];
    const topKScores: number[] = [];

    for (const match of response.matches) {
        const node = metadataDictToNode(match.metadata);
        topKNodes.push(node);
        topKIds.push(match.id);
        topKScores.push(match.score);
    }

    return {
      nodes: topKNodes,
      similarities: topKScores,
      ids: topKIds,
    }
  }
  


  
}
