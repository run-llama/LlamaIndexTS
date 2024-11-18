import {
  AzureKeyCredential,
  IndexDocumentsBatch,
  KnownAnalyzerNames,
  KnownSearchFieldDataType,
  KnownVectorSearchAlgorithmKind,
  KnownVectorSearchAlgorithmMetric,
  KnownVectorSearchCompressionKind,
  type LexicalAnalyzerName,
  SearchClient,
  type SearchField,
  type SearchIndex,
  SearchIndexClient,
  type SearchOptions,
  type SearchResult,
  type SelectArray,
  type SelectFields,
  type SemanticConfiguration,
  type SemanticSearch,
  type SimpleField,
  type VectorSearch,
  type VectorSearchCompression,
} from "@azure/search-documents";

import { DefaultAzureCredential } from "@azure/identity";
import { type BaseNode, MetadataMode } from "@llamaindex/core/schema";
import { consoleLogger, getEnv } from "@llamaindex/env";
import {
  BaseVectorStore,
  FilterCondition,
  FilterOperator,
  type MetadataFilters,
  type VectorStoreBaseParams,
  type VectorStoreQuery,
  VectorStoreQueryMode,
  type VectorStoreQueryResult,
} from "../types.js";
import { metadataDictToNode, nodeToMetadata } from "../utils.js";
import {
  AzureAISearchVectorStoreConfig,
  type R,
} from "./AzureAISearchVectorStoreConfig.js";
import {
  type AzureQueryResultSearchBase,
  AzureQueryResultSearchDefault,
  AzureQueryResultSearchHybrid,
  AzureQueryResultSearchSemanticHybrid,
  AzureQueryResultSearchSparse,
} from "./AzureQueryResultSearch.js";

/**
 * Enumeration representing the supported index management operations
 */
export const enum IndexManagement {
  NO_VALIDATION = "NoValidation",
  VALIDATE_INDEX = "ValidateIndex",
  CREATE_IF_NOT_EXISTS = "CreateIfNotExists",
}

/**
 * Enumeration representing the supported types for metadata fields in an
 * Azure AI Search Index, corresponds with types supported in a flat
 * metadata dictionary.
 */
export const enum MetadataIndexFieldType {
  STRING = "Edm.String",
  BOOLEAN = "Edm.Boolean",
  INT32 = "Edm.Int32",
  INT64 = "Edm.Int64",
  DOUBLE = "Edm.Double",
  COLLECTION = "Collection(Edm.String)", // Adjust based on actual collection requirements
}

const createSearchRequest = <T extends R>(
  fieldMapping: Record<string, string>,
  filterStr: string,
  batchSize: number,
  offset: number,
): Partial<SearchOptions<T, SelectFields<T>>> | undefined => {
  return {
    filter: filterStr,
    top: batchSize,
    skip: offset,
    select: Object.keys(fieldMapping) as unknown as SelectArray<
      SelectFields<T>
    >,
  };
};

/**
 * Embeddings and documents are stored in an Azure AI Search index,
 * a merge or upload approach is used when adding embeddings.
 * When adding multiple embeddings the index is updated by this vector store
 * in batches of 10 documents, very large nodes may result in failure due to
 * the batch byte size being exceeded.
 */
export interface AzureAISearchOptions<T extends R> {
  userAgent?: string;
  credential?: AzureKeyCredential | DefaultAzureCredential;
  endpoint?: string;
  key?: string;
  serviceApiVersion?: string;
  indexName?: string;
  indexClient?: SearchIndexClient;
  indexManagement?: IndexManagement;
  searchClient?: SearchClient<T>;
  languageAnalyzer?: LexicalAnalyzerName;
  compressionType?: KnownVectorSearchCompressionKind;
  embeddingDimensionality?: number;
  vectorAlgorithmType?: KnownVectorSearchAlgorithmKind;
  /**
   * Index field storing the id
   */
  idFieldKey?: string | undefined;
  /**
   * Index field storing the node text
   */
  chunkFieldKey?: string | undefined;
  /**
   * Index field storing the embedding vector
   */
  embeddingFieldKey?: string | undefined;
  /**
   * Index field storing node metadata as a json string.
   * Schema is arbitrary, to filter on metadata values they must be stored
   * as separate fields in the index, use filterable_metadata_field_keys
   * to specify the metadata values that should be stored in these filterable fields
   */
  metadataStringFieldKey?: string | undefined;
  /**
   * Index field storing doc_id
   */
  docIdFieldKey?: string | undefined;
  /**
   * List of index fields that should be hidden from the client.
   * This is useful for fields that are not needed for retrieving,
   * but are used for similarity search, like the embedding field.
   */
  hiddenFieldKeys?: string[] | undefined;
  filterableMetadataFieldKeys?: FilterableMetadataFieldKeysType | undefined;
  /**
   * (Optional) function used to map document fields to the AI search index fields
   * If none is specified a default mapping is provided which uses
   *  the field keys. The keys in the enriched document are:
   *   `["id", "chunk", "embedding", "metadata"]`.
   *
   *   The default mapping is:
   *   - `"id"` to idFieldKey
   *   - `"chunk"` to chunkFieldKey
   *   - `"embedding"` to embeddingFieldKey
   *   - `"metadata"` to metadataFieldKey
   * @param enrichedDoc The enriched document
   * @param metadata The metadata of the document
   * @returns The mapped index document
   */
  indexMapping?: (
    enrichedDoc: BaseNode,
    metadata: Record<string, unknown>,
  ) => T;
}

export type FilterableMetadataFieldKeysType =
  | Array<string>
  | Map<string, string>
  | Map<string, [string, MetadataIndexFieldType]>;

/**
 * Azure AI Search vector store.
 *
 * @example
```typescript
import { DefaultAzureCredential, getBearerTokenProvider} from "@azure/identity";
import {KnownAnalyzerNames, KnownVectorSearchAlgorithmKind } from "@azure/search-documents";

// 1- Setup Azure OpenAI
const azureADTokenProvider = getBearerTokenProvider(
  new DefaultAzureCredential(),
  "https://cognitiveservices.azure.com/.default",
);

// IMPORTANT: You need to deploy your own embedding model as well as your own chat completion model
// NOTE: You can use whatever embedding model and language model that is supported in LlamaIndex
const azure = {
  azureADTokenProvider,
  deployment: process.env.AZURE_DEPLOYMENT_NAME,
};
Settings.llm = new OpenAI({ azure });
Settings.embedModel = new OpenAIEmbedding({
  model: process.env.EMBEDDING_MODEL,
  azure: {
    ...azure,
    deployment: process.env.EMBEDDING_MODEL,
  },
});

// ---------------------------------------------------------
// 2- Setup Azure AI Search
// Define env variables in .env file
// AZURE_AI_SEARCH_ENDPOINT=
// AZURE_AI_SEARCH_KEY=
// AZURE_OPENAI_ENDPOINT=
// EMBEDDING_MODEL=text-embedding-ada-002
// AZURE_DEPLOYMENT_NAME=gpt-4
// AZURE_API_VERSION=2024-09-01-preview

// Define index name
const indexName = "llamaindex-vector-store";

// ---------------------------------------------------------
// 3a- Create Index (if it does not exist)
// id:	      Edm.String
// chunk:	    Edm.String
// embedding:	Collection(Edm.Single)
// metadata:	Edm.String
// doc_id:	  Edm.String
// author:	  Edm.String
// theme:	    Edm.String
// director:	Edm.String

// Define metadata fields with their respective configurations
const metadataFields = {
  author: "author",
  theme: ["theme", MetadataIndexFieldType.STRING],
  director: "director",
};

// Define index parameters and vector store configuration
// Index validation:
// - IndexManagement.VALIDATE_INDEX: will validate before creating emnbedding index and will throw a runtime error if the index does not exist
// - IndexManagement.NO_VALIDATION: will try to access the index and will throw a runtime error if the index does not exist
// - IndexManagement.CREATE_IF_NOT_EXISTS: will create the index if it does not exist

const vectorStore = new AzureAISearchVectorStore({
  filterableMetadataFieldKeys:
    metadataFields as unknown as FilterableMetadataFieldKeysType,
  indexName,
  indexManagement: IndexManagement.CREATE_IF_NOT_EXISTS,
  idFieldKey: "id",
  chunkFieldKey: "chunk",
  embeddingFieldKey: "embedding",
  metadataStringFieldKey: "metadata",
  docIdFieldKey: "doc_id",
  embeddingDimensionality: 1536,
  hiddenFieldKeys: ["embedding"],
  languageAnalyzer: KnownAnalyzerNames.EnLucene,
  // store vectors on disk
  vectorAlgorithmType: KnownVectorSearchAlgorithmKind.ExhaustiveKnn,

  // Optional: Set to "scalar" or "binary" if using HNSW
  compressionType: KnownVectorSearchCompressionKind.BinaryQuantization,
});

// ---------------------------------------------------------
// 3a- Loading documents
// Load the documents stored in the data/paul_graham/ using the SimpleDirectoryReader
// NOTE: You can use whatever reader that is supported in LlamaIndex

// Load documents using a directory reader
const documents = await new SimpleDirectoryReader().loadData(
  "data/paul_graham/",
);
const storageContext = await storageContextFromDefaults({ vectorStore });

// Create index from documents with the specified storage context
const index = await VectorStoreIndex.fromDocuments(documents, {
  storageContext,
  docStoreStrategy: DocStoreStrategy.UPSERTS,
});

const queryEngine = index.asQueryEngine();
const response = await queryEngine.query({
  query: "What did the author do growing up?",
  similarityTopK: 3,
} as any);
console.log({ response });
 */
export class AzureAISearchVectorStore<T extends R> extends BaseVectorStore {
  storesText = true;
  searchClient: SearchClient<T> | undefined;

  #languageAnalyzer: LexicalAnalyzerName | undefined;
  #embeddingDimensionality: number | undefined;
  #vectorProfileName: string | undefined;
  #compressionType: KnownVectorSearchCompressionKind | undefined;
  #indexClient: SearchIndexClient | undefined;
  #indexManagement: IndexManagement | undefined;
  #indexName: string | undefined;
  #fieldMapping: Record<string, SelectFields<T>>;
  #metadataToIndexFieldMap: Map<string, [string, MetadataIndexFieldType]> =
    new Map();
  flatMetadata = true;
  #idFieldKey: string | undefined;
  #chunkFieldKey: string | undefined;
  #embeddingFieldKey: string | undefined;
  #docIdFieldKey: string | undefined;
  #metadataStringFieldKey?: string | undefined;
  #serviceApiVersion: string | undefined;
  #indexMapping: (
    enrichedDoc: BaseNode,
    metadata: Record<string, unknown>,
  ) => T;
  #hiddenFiledKeys: string[] | undefined;

  constructor(options: AzureAISearchOptions<T> & VectorStoreBaseParams) {
    super(options);

    // set default values
    options.vectorAlgorithmType ||=
      KnownVectorSearchAlgorithmKind.ExhaustiveKnn;
    options.languageAnalyzer ||= KnownAnalyzerNames.EnLucene;
    options.indexManagement ||= IndexManagement.NO_VALIDATION;
    options.embeddingDimensionality ||= 1536;
    options.serviceApiVersion ||= getEnv("AZURE_API_VERSION") as string;
    options.hiddenFieldKeys ||= [];

    // set props
    this.#serviceApiVersion =
      options.serviceApiVersion ||
      AzureAISearchVectorStoreConfig.DEFAULT_AZURE_API_VERSION;
    this.#languageAnalyzer = options.languageAnalyzer;
    this.#compressionType = options.compressionType;
    this.#embeddingDimensionality = options.embeddingDimensionality;
    this.#indexManagement = options.indexManagement;
    this.#indexName = options.indexName;
    this.#idFieldKey = options.idFieldKey;
    this.#docIdFieldKey = options.docIdFieldKey;
    this.#chunkFieldKey = options.chunkFieldKey;
    this.#embeddingFieldKey = options.embeddingFieldKey;
    this.#metadataStringFieldKey = options.metadataStringFieldKey;
    this.#hiddenFiledKeys = options.hiddenFieldKeys;
    this.#indexMapping = options.indexMapping || this.#defaultIndexMapping;

    // Default field mapping
    this.#fieldMapping = {
      ["id" as keyof T]: options.idFieldKey,
      ["doc_id" as keyof T]: options.docIdFieldKey,
      ["chunk" as keyof T]: options.chunkFieldKey,
      ["embedding" as keyof T]: options.embeddingFieldKey,
      ["metadata" as keyof T]: options.metadataStringFieldKey,
    } as Record<string, SelectFields<T>>;

    this.#setVectorProfileName(options.vectorAlgorithmType);
    this.#valideSearchOrIndexClient(options);

    // Normalizing metadata to index fields
    this.#metadataToIndexFieldMap = this.#normalizeMetadataToIndexFields(
      options.filterableMetadataFieldKeys,
    );
  }

  // private

  #normalizeMetadataToIndexFields(
    filterableMetadataFieldKeys?: FilterableMetadataFieldKeysType,
  ) {
    const indexFieldSpec: Map<string, [string, MetadataIndexFieldType]> =
      new Map();

    if (Array.isArray(filterableMetadataFieldKeys)) {
      // if filterableMetadataFieldKeys is an array, use the field name as the index field name
      // eg. [
      //  "author",
      //  "theme",
      //  "director"
      // ] => {
      //  "author": ["author", "Edm.String"],
      //  "theme": ["theme", "Edm.String"],
      //  "director": ["director", "Edm.String"]
      // }
      filterableMetadataFieldKeys.forEach((field) => {
        indexFieldSpec.set(field, [field, MetadataIndexFieldType.STRING]);
      });
    } else if (typeof filterableMetadataFieldKeys === "object") {
      // if filterableMetadataFieldKeys is an object, use the key as the index field name
      // and the value as the metadata field name
      // eg. {
      //  "author": "author",
      //  "theme": ["topic", MetadataIndexFieldType.STRING],
      //  "director": "director"
      // } => {
      //  "author": ["author", "Edm.String"],
      //  "theme": ["topic", "Edm.String"],
      //  "director": ["director", "Edm.String"]
      // }
      // we also support specifying the metadata field type
      // MetadataIndexFieldType.INT32 --> "Edm.Int32"
      // MetadataIndexFieldType.INT64 --> "Edm.Int64"
      // MetadataIndexFieldType.DOUBLE --> "Edm.Double"
      // MetadataIndexFieldType.BOOLEAN --> "Edm.Boolean"
      // MetadataIndexFieldType.COLLECTION --> "Collection(Edm.String)"

      Object.entries(filterableMetadataFieldKeys).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          indexFieldSpec.set(k, [v[0], v[1]]);
        } else {
          switch (v) {
            case MetadataIndexFieldType.STRING:
              indexFieldSpec.set(k, [
                v as string,
                MetadataIndexFieldType.STRING,
              ]);
              break;
            case MetadataIndexFieldType.INT32:
              indexFieldSpec.set(k, [
                v as string,
                MetadataIndexFieldType.INT32,
              ]);
              break;
            case MetadataIndexFieldType.INT64:
              indexFieldSpec.set(k, [
                v as string,
                MetadataIndexFieldType.INT64,
              ]);
              break;
            case MetadataIndexFieldType.DOUBLE:
              indexFieldSpec.set(k, [
                v as string,
                MetadataIndexFieldType.DOUBLE,
              ]);
              break;
            case MetadataIndexFieldType.BOOLEAN:
              indexFieldSpec.set(k, [
                v as string,
                MetadataIndexFieldType.BOOLEAN,
              ]);
              break;
            case MetadataIndexFieldType.COLLECTION:
              indexFieldSpec.set(k, [
                v as string,
                MetadataIndexFieldType.COLLECTION,
              ]);
              break;
            default:
              // Index field name and metadata field name may differ
              // Use String as the default index field type
              indexFieldSpec.set(k, [
                v as string,
                MetadataIndexFieldType.STRING,
              ]);
              break;
          }
        }
      });
    }

    return indexFieldSpec;
  }

  #defaultIndexMapping(node: BaseNode, metadata: Record<string, unknown>): T {
    // include metadata fields in the index document
    const filterableMetadata = {} as Record<string, unknown>;
    for (const [
      fieldName,
      _fieldType,
    ] of this.#metadataToIndexFieldMap.values()) {
      filterableMetadata[fieldName] = metadata[fieldName];
    }

    return {
      [this.#embeddingFieldKey as string]: node.getEmbedding(),
      [this.#idFieldKey as string]: node.id_,
      [this.#docIdFieldKey as string]: node.id_,
      [this.#chunkFieldKey as string]: node.getContent(MetadataMode.NONE),
      [this.#metadataStringFieldKey as string]: JSON.stringify(metadata),
      ...filterableMetadata,
    } as unknown as T;
  }

  #setVectorProfileName(
    vectorAlgorithmType?: KnownVectorSearchAlgorithmKind,
  ): void {
    if (vectorAlgorithmType === KnownVectorSearchAlgorithmKind.ExhaustiveKnn) {
      this.#vectorProfileName = "myExhaustiveKnnProfile";
    } else if (vectorAlgorithmType === KnownVectorSearchAlgorithmKind.Hnsw) {
      this.#vectorProfileName = "myHnswProfile";
    } else {
      throw new Error(
        "Only 'exhaustiveKnn' and 'hnsw' are supported for vectorAlgorithmType",
      );
    }
  }

  /**
   * Create a list of index fields for storing metadata values.
   * @returns List of index fields for storing metadata values
   */
  #createMetadataIndexFields(): Array<SimpleField | SearchField> {
    const indexFields: Array<SimpleField | SearchField> = [];

    for (const [
      fieldName,
      fieldType,
    ] of this.#metadataToIndexFieldMap.values()) {
      if (this.#fieldMapping[fieldName]) {
        consoleLogger.log(
          `Skipping metadata field ${fieldName} as it is already mapped to an index field`,
        );
        continue;
      }

      let indexFieldType:
        | KnownSearchFieldDataType
        | `Collection(${KnownSearchFieldDataType})`;
      switch (fieldType) {
        case MetadataIndexFieldType.STRING:
          indexFieldType = KnownSearchFieldDataType.String;
          break;
        case MetadataIndexFieldType.INT32:
          indexFieldType = KnownSearchFieldDataType.Int32;
          break;
        case MetadataIndexFieldType.INT64:
          indexFieldType = KnownSearchFieldDataType.Int64;
          break;
        case MetadataIndexFieldType.DOUBLE:
          indexFieldType = KnownSearchFieldDataType.Double;
          break;
        case MetadataIndexFieldType.BOOLEAN:
          indexFieldType = KnownSearchFieldDataType.Boolean;
          break;
        case MetadataIndexFieldType.COLLECTION:
          indexFieldType = `Collection(${KnownSearchFieldDataType.String})`;
          break;
        default:
          throw new Error(`Unsupported field type: ${fieldType}`);
      }

      indexFields.push({
        name: fieldName,
        type: indexFieldType,
        filterable: true,
      });
    }
    return indexFields;
  }

  // index management

  async #indexExists(indexName?: string) {
    if (!indexName) {
      throw new Error(`IndexName is invalid`);
    }

    const availableIndexNames = await this.#indexClient?.listIndexesNames();
    if (!availableIndexNames) {
      return false;
    }

    let listOfIndexNames = await availableIndexNames.next();
    const indexNames: string[] = [];
    while (!listOfIndexNames.done) {
      indexNames.push(listOfIndexNames.value);
      listOfIndexNames = await availableIndexNames.next();
    }
    return indexNames.includes(indexName);
  }

  async #createIndexIfNotExists(indexName: string): Promise<void> {
    const indexExists = await this.#indexExists(indexName);
    if (!indexExists) {
      consoleLogger.log(
        `Index ${indexName} does not exist in Azure AI Search, creating index`,
      );
      await this.#createIndex(indexName);
    }
  }

  /**
   * Creates a default index based on the supplied index name, key field names and
   * metadata filtering keys.
   * @param indexName The name of the index to create
   */
  async #createIndex(indexName: string) {
    consoleLogger.log(`Configuring ${indexName} fields for Azure AI Search`);

    const fields: Array<SimpleField | SearchField> = [
      {
        name: this.#fieldMapping["id"] as string,
        type: KnownSearchFieldDataType.String,
        hidden: this.#hiddenFiledKeys?.includes(
          this.#fieldMapping["id"] as string,
        ) as boolean,
        key: true,
        filterable: true,
        retrievable: true,
        searchable: true,
      } as SearchField,
      {
        name: this.#fieldMapping["chunk"] as string,
        type: KnownSearchFieldDataType.String,
        hidden: this.#hiddenFiledKeys?.includes(
          this.#fieldMapping["chunk"] as string,
        ) as boolean,
        analyzerName: this.#languageAnalyzer as LexicalAnalyzerName,
        searchable: true,
      },
      {
        name: this.#fieldMapping["embedding"] as string,
        type: `Collection(${KnownSearchFieldDataType.Single})`,
        vectorSearchDimensions: this.#embeddingDimensionality as number,
        vectorSearchProfileName: this.#vectorProfileName as string,
        hidden: this.#hiddenFiledKeys?.includes(
          this.#fieldMapping["embedding"] as string,
        ) as boolean,
        searchable: true,
      },
      {
        name: this.#fieldMapping["metadata"] as string,
        hidden: this.#hiddenFiledKeys?.includes(
          this.#fieldMapping["metadata"] as string,
        ) as boolean,
        type: KnownSearchFieldDataType.String,
      },
      {
        name: this.#fieldMapping["doc_id"] as string,
        type: KnownSearchFieldDataType.String,
        hidden: this.#hiddenFiledKeys?.includes(
          this.#fieldMapping["doc_id"] as string,
        ) as boolean,
        filterable: true,
        retrievable: true,
        searchable: true,
      } as SearchField,
    ];

    consoleLogger.log(`Configuring ${indexName} metadata fields`);
    const metadataIndexFields = this.#createMetadataIndexFields();
    fields.push(...metadataIndexFields);

    consoleLogger.log(`Configuring ${indexName} vector search`);

    const compressions = this.#getCompressions();
    consoleLogger.log(
      `Configuring ${indexName} vector search with ${this.#compressionType} compression`,
    );

    const vectorSearch: VectorSearch = {
      algorithms: [
        {
          name: AzureAISearchVectorStoreConfig.ALGORITHM_HNSW_NAME,
          kind: KnownVectorSearchAlgorithmKind.Hnsw,
          parameters: {
            m: 4,
            efConstruction: 400,
            efSearch: 500,
            metric: KnownVectorSearchAlgorithmMetric.Cosine,
          },
        },
        {
          name: AzureAISearchVectorStoreConfig.ALGORITHM_EXHAUSTIVE_KNN_NAME,
          kind: KnownVectorSearchAlgorithmKind.ExhaustiveKnn,
          parameters: {
            metric: KnownVectorSearchAlgorithmMetric.Cosine,
          },
        },
      ],
      compressions,
      profiles: [
        {
          name: AzureAISearchVectorStoreConfig.PROFILE_HNSW_NAME,
          algorithmConfigurationName:
            AzureAISearchVectorStoreConfig.ALGORITHM_HNSW_NAME,
          compressionName: compressions?.[0]?.compressionName as string,
        },
        {
          name: AzureAISearchVectorStoreConfig.PROFILE_EXHAUSTIVE_KNN_NAME,
          algorithmConfigurationName:
            AzureAISearchVectorStoreConfig.ALGORITHM_EXHAUSTIVE_KNN_NAME,
        },
      ],
    };

    consoleLogger.log(`Configuring ${indexName} semantic search`);

    const semanticConfig: SemanticConfiguration = {
      name: AzureAISearchVectorStoreConfig.SEMANTIC_CONFIG_NAME,
      prioritizedFields: {
        contentFields: [
          {
            name: this.#fieldMapping["chunk"] as string,
          },
        ],
        keywordsFields: [
          {
            name: this.#fieldMapping["metadata"] as string,
          },
        ],
        titleField: {
          name: this.#fieldMapping["id"] as string,
        },
      },
    };

    const semanticSearch: SemanticSearch = {
      configurations: [semanticConfig],
    };

    const index: SearchIndex = {
      name: indexName,
      fields: fields,
      vectorSearch: vectorSearch,
      semanticSearch: semanticSearch,
    };

    consoleLogger.log(`Creating ${indexName} search index with configuration:`);
    consoleLogger.log({ index });
    await this.#indexClient?.createIndex(index);
  }

  /**
   * Get the compressions for the vector search
   * @returns Array of compressions. See {@link VectorSearchCompression}
   */
  #getCompressions(): Array<VectorSearchCompression> {
    const compressions: VectorSearchCompression[] = [];
    if (
      this.#compressionType ===
      KnownVectorSearchCompressionKind.BinaryQuantization
    ) {
      compressions.push({
        compressionName: AzureAISearchVectorStoreConfig.COMPRESSION_TYPE_BINARY,
        kind: KnownVectorSearchCompressionKind.BinaryQuantization,
      });
    } else if (
      this.#compressionType ===
      KnownVectorSearchCompressionKind.ScalarQuantization
    ) {
      compressions.push({
        compressionName: AzureAISearchVectorStoreConfig.COMPRESSION_TYPE_SCALAR,
        kind: KnownVectorSearchCompressionKind.ScalarQuantization,
      });
    }
    return compressions;
  }

  #valideSearchOrIndexClient(options: AzureAISearchOptions<T>): void {
    if (options.searchClient) {
      if (options.searchClient instanceof SearchClient) {
        consoleLogger.log("Using provided Azure SearchClient");
        this.searchClient = options.searchClient;

        if (options.indexName) {
          throw new Error(
            "options.indexName cannot be supplied if using options.searchClient",
          );
        }
      } else {
        throw new Error(
          "options.searchClient must be an instance of SearchClient",
        );
      }
    } else {
      this.#createSearchClient(options);
    }

    if (options.indexClient) {
      if (options.indexClient instanceof SearchIndexClient) {
        if (!options.indexName) {
          throw new Error(
            "options.indexName must be supplied if using options.indexClient",
          );
        }

        this.#indexClient = options.indexClient;
      } else {
        throw new Error(
          "options.indexClient must be an instance of SearchIndexClient",
        );
      }
    } else {
      this.#createSearchIndexClient(options);
    }

    if (
      options.indexManagement === IndexManagement.CREATE_IF_NOT_EXISTS &&
      !this.#indexClient
    ) {
      throw new Error(
        "IndexManagement.CREATE_IF_NOT_EXISTS requires options.indexClient",
      );
    }

    if (!this.searchClient && !this.#indexClient) {
      throw new Error(
        "Either options.searchClient or options.indexClient must be supplied",
      );
    }
  }

  #buildCredentials(options: AzureAISearchOptions<T>) {
    let { credential: credential, key, endpoint, indexName } = options;

    // validate and use credential
    if (credential) {
      // if credential are provided, ensure they are an instance of AzureKeyCredential
      if (
        !(
          credential instanceof AzureKeyCredential ||
          credential instanceof DefaultAzureCredential
        )
      ) {
        throw new Error(
          "options.credential must be an instance of AzureKeyCredential or DefaultAzureCredential",
        );
      }
    }
    // if credential are not provided, instantiate AzureKeyCredential with key
    else {
      key ??= getEnv("AZURE_AI_SEARCH_KEY");
      if (key) {
        consoleLogger.log("Using provided Azure Search key");
        credential = new AzureKeyCredential(key);
      } else {
        // if key wasn't provided, try using DefaultAzureCredential
        consoleLogger.log("Using Azure Managed identity");
        credential = new DefaultAzureCredential();
      }
    }

    // validate and use endpoint
    endpoint ??= getEnv("AZURE_AI_SEARCH_ENDPOINT");
    if (!endpoint) {
      throw new Error(
        "options.endpoint must be provided or set as an environment variable: AZURE_AI_SEARCH_ENDPOINT",
      );
    }

    // validate and use indexName
    indexName ??= this.#indexName;
    if (!indexName) {
      throw new Error("options.indexName must be provided");
    }

    return { credential, endpoint, indexName };
  }

  #createSearchIndexClient(options: AzureAISearchOptions<T>): void {
    const { credential, endpoint, indexName } = this.#buildCredentials(options);
    this.#indexClient = new SearchIndexClient(
      endpoint,
      credential as AzureKeyCredential | DefaultAzureCredential,
      {
        serviceVersion: this.#serviceApiVersion as string,
        userAgentOptions: {
          userAgentPrefix:
            options.userAgent ??
            AzureAISearchVectorStoreConfig.DEFAULT_USER_AGENT_PREFIX,
        },
      },
    );
  }

  #createSearchClient(options: AzureAISearchOptions<T>): void {
    const { credential, endpoint, indexName } = this.#buildCredentials(options);
    this.searchClient = new SearchClient<T>(
      endpoint,
      indexName,
      credential as AzureKeyCredential | DefaultAzureCredential,
      {
        serviceVersion: this.#serviceApiVersion as string,
        userAgentOptions: {
          userAgentPrefix:
            options.userAgent ??
            AzureAISearchVectorStoreConfig.DEFAULT_USER_AGENT_PREFIX,
        },
      },
    );
  }

  async #validateIndex(indexName?: string) {
    if (
      this.#indexClient &&
      indexName &&
      !(await this.#indexExists(indexName))
    ) {
      throw new Error(`Validation failed, index ${indexName} does not exist.`);
    }
  }

  /**
   * Create AI Search index document from embedding result.
   * @param node The node to create the index document from
   * @returns The mapped index document from the node
   */
  #createIndexDocument(node: BaseNode): T {
    consoleLogger.log(`Mapping indexed document: ${node.id_}`);

    const metadata = nodeToMetadata(
      node,
      true,
      this.#chunkFieldKey,
      this.flatMetadata,
    );

    return this.#indexMapping(node, metadata);
  }

  /**
   * Generate an OData filter string using supplied metadata filters.
   * @param metadataFilters
   * @returns
   */
  #createOdataFilter(metadataFilters: MetadataFilters): string {
    const odataFilter: string[] = [];

    for (const subfilter of metadataFilters.filters) {
      // Join values with ' or ' to create an OR condition inside the any function
      const metadataMapping = this.#metadataToIndexFieldMap.get(subfilter.key);

      if (!metadataMapping) {
        throw new Error(
          `Metadata field '${subfilter.key}' is missing a mapping to an index field. Please provide an entry in 'filterableMetadataFieldKeys' for this vector store.`,
        );
      }

      const indexField = metadataMapping[0];

      if (subfilter.operator === FilterOperator.IN) {
        let valueStr: string;
        if (Array.isArray(subfilter.value)) {
          valueStr = (subfilter.value as string[])
            .map((value) =>
              typeof value === "string" ? `t eq '${value}'` : `t eq ${value}`,
            )
            .join(" or ");
        } else {
          valueStr =
            typeof subfilter.value === "string"
              ? `t eq '${subfilter.value}'`
              : `t eq ${subfilter.value}`;
        }
        odataFilter.push(`${indexField}/any(t: ${valueStr})`);
      } else if (subfilter.operator === FilterOperator.EQ) {
        const escapedValue =
          typeof subfilter.value === "string"
            ? (subfilter.value as string).replace(/'/g, "''")
            : subfilter.value;
        odataFilter.push(`${indexField} eq '${escapedValue}'`);
      } else {
        throw new Error(
          `Unsupported filter operator ${subfilter.operator}. Supported operators are 'IN' and 'EQ'`,
        );
      }
    }

    let odataExpr = "";
    if (metadataFilters.condition === FilterCondition.AND) {
      odataExpr = odataFilter.join(" and ");
    } else if (metadataFilters.condition === FilterCondition.OR) {
      odataExpr = odataFilter.join(" or ");
    } else {
      throw new Error(
        `Unsupported filter condition ${metadataFilters.condition}. Supported conditions are 'AND' and 'OR'`,
      );
    }

    consoleLogger.log(`OData filter: ${odataExpr}`);
    return odataExpr;
  }

  #createNodeFromResult(
    result: SearchResult<T, SelectFields<T>>,
    fieldMapping: Record<string, SelectFields<T>>,
  ): BaseNode {
    const { document } = result;
    const metadataStr = document[fieldMapping["metadata"] as keyof T] as string;
    const metadata = metadataStr ? JSON.parse(metadataStr) : {};

    try {
      const node = metadataDictToNode(metadata);
      node.setContent(document[fieldMapping["chunk"] as keyof T] as string);
      node.embedding = document[
        fieldMapping["embedding"] as keyof T
      ] as number[];
      return node;
    } catch (error) {
      throw new Error(`Failed to create node from search result`);
    }
  }

  #buildFilterString(
    fieldMapping: Record<string, SelectFields<T>>,
    nodeIds?: string[],
    filters?: MetadataFilters,
  ): string {
    let filterStr = "";

    if (nodeIds && nodeIds.length > 0) {
      filterStr = nodeIds
        .map((nodeId) => `${fieldMapping["id"]} eq '${nodeId}'`)
        .join(" or ");
    }

    if (filters) {
      const metadataFilter = this.#createOdataFilter(filters);
      if (filterStr) {
        filterStr = `(${filterStr}) or (${metadataFilter})`;
      } else {
        filterStr = metadataFilter;
      }
    }

    return filterStr;
  }

  #processBatchResults(
    batchNodes: BaseNode[],
    nodes: BaseNode[],
    batchSize: number,
    limit?: number,
  ): [BaseNode[], boolean] {
    if (batchNodes.length === 0) {
      return [nodes, false];
    }

    nodes = [...nodes, ...batchNodes];

    // If we've hit the requested limit, stop
    if (limit && nodes.length >= limit) {
      return [nodes.slice(0, limit), false];
    }

    // If we got fewer results than batch size, we've hit the end
    if (batchNodes.length < batchSize) {
      return [nodes, false];
    }

    return [nodes, true];
  }

  // public
  /**
   * Get search client
   * @returns Azure AI Search client. See {@link SearchClient}
   */
  client() {
    return this.searchClient;
  }

  /**
   * Add nodes to index associated with the configured search client.
   * @param nodes List of nodes with embeddings to add to the index
   * @returns List of node IDs that were added to the index
   */
  async add(nodes: BaseNode[]): Promise<string[]> {
    if (!this.searchClient) {
      throw new Error("Async Search client not initialized");
    }

    if (!nodes || nodes.length === 0) {
      return [];
    }

    if (nodes.length > 0) {
      if (
        this.#indexManagement === IndexManagement.CREATE_IF_NOT_EXISTS &&
        this.#indexName
      ) {
        await this.#createIndexIfNotExists(this.#indexName);
      }
      if (this.#indexManagement === IndexManagement.VALIDATE_INDEX) {
        await this.#validateIndex(this.#indexName);
      }
    }

    const accumulator = new IndexDocumentsBatch<T>();
    let documents: T[] = [];
    const ids: string[] = [];
    let accumulatedSize = 0;
    const maxSize = AzureAISearchVectorStoreConfig.DEFAULT_MAX_MB_SIZE;
    const maxDocs = AzureAISearchVectorStoreConfig.DEFAULT_MAX_BATCH_SIZE;

    for (const node of nodes) {
      consoleLogger.log(`Processing embedding: ${node.id_}`);

      const indexDocument = this.#createIndexDocument(node);

      const documentSize = JSON.stringify(indexDocument).length; // in bytes
      documents.push(indexDocument);
      accumulatedSize += documentSize;
      accumulator.upload(documents);

      if (documents.length >= maxDocs || accumulatedSize >= maxSize) {
        consoleLogger.log(
          `Uploading batch of size ${documents.length}, current progress ${ids.length} of ${nodes.length}, accumulated size ${(accumulatedSize / (1024 * 1024)).toFixed(2)} MB`,
        );
        await this.searchClient.indexDocuments(accumulator);

        documents = [];
        accumulatedSize = 0;
      }

      ids.push(node.id_);
    }

    if (documents.length > 0) {
      consoleLogger.log(
        `Uploading remaining batch of size ${documents.length}, current progress ${ids.length} of ${nodes.length}, accumulated size ${(accumulatedSize / (1024 * 1024)).toFixed(2)} MB`,
      );
      await this.searchClient.indexDocuments(accumulator);
    }

    return ids;
  }

  /**
   * Delete documents from the AI Search Index with docIdFieldKey (doc_id) field equal to refDocId.
   * @param refDocId The reference document ID to delete from the index
   */
  async delete(refDocId: string) {
    // Check if index exists
    if (!(await this.#indexExists(this.#indexName))) {
      return;
    }

    if (!this.searchClient) {
      throw new Error("searchClient is not initialized");
    }

    // Define filter and batch size
    const filterExpr = `${this.#fieldMapping["doc_id"]} eq '${refDocId}'`;
    const batchSize = 1000;

    while (true) {
      // Search for documents to delete
      consoleLogger.log(`Searching with filter ${filterExpr}`);
      const searchResults = await this.searchClient.search("*", {
        filter: filterExpr,
        top: batchSize,
      });

      // Collect document IDs to delete
      const docsToDelete = [] as T[];
      for await (const result of searchResults.results) {
        const { document } = result;
        docsToDelete.push(document);
      }

      // Delete documents if found
      if (docsToDelete.length > 0) {
        consoleLogger.log(`Deleting ${docsToDelete.length} documents`);
        await this.searchClient.deleteDocuments(docsToDelete);
      } else {
        consoleLogger.log("No documents found to delete");
        break;
      }
    }
  }

  /**
   * Get nodes asynchronously from the Azure AI Search index.
   * @param nodeIds List of node IDs to retrieve from the index
   * @param filters Metadata filters to apply to the search
   * @param limit Maximum number of nodes to retrieve
   * @returns List of nodes retrieved from the index
   */
  async getNodes(
    nodeIds?: string[],
    filters?: MetadataFilters,
    limit?: number,
  ): Promise<BaseNode[]> {
    if (!this.searchClient) {
      throw new Error("SearchClient not initialized");
    }

    const filterStr = this.#buildFilterString(
      this.#fieldMapping,
      nodeIds,
      filters,
    );
    const nodes: BaseNode[] = [];
    const batchSize = 1000; // Azure Search batch size limit

    while (true) {
      try {
        const searchRequest = createSearchRequest<T>(
          this.#fieldMapping,
          filterStr,
          batchSize,
          nodes.length,
        ) as SearchOptions<T, SelectFields<T>>;
        const results = await this.searchClient.search("*", searchRequest);

        const batchNodes: BaseNode[] = [];
        for await (const result of results.results) {
          batchNodes.push(
            this.#createNodeFromResult(result, this.#fieldMapping),
          );
        }

        const [updatedNodes, continueFetching] = this.#processBatchResults(
          batchNodes,
          nodes,
          batchSize,
          limit,
        );
        nodes.push(...updatedNodes);

        if (!continueFetching) {
          break;
        }
      } catch (error) {
        throw new Error(`Failed to get nodes from Azure AI Search: ${error}`);
      }
    }

    return nodes;
  }

  async query(
    query: VectorStoreQuery & {
      queryStr: string;
    },
  ): Promise<VectorStoreQueryResult> {
    let odataFilter: string | undefined;

    if (query.filters) {
      odataFilter = this.#createOdataFilter(query.filters);
    }

    consoleLogger.log(`Querying with OData filter: ${odataFilter}`);
    consoleLogger.log({
      query,
    });

    // Define base AzureQueryResultSearch object based on query mode
    let azureQueryResultSearch: AzureQueryResultSearchBase<T> =
      new AzureQueryResultSearchDefault(
        query,
        this.#fieldMapping,
        odataFilter,
        this.searchClient,
      );

    switch (query.mode) {
      case VectorStoreQueryMode.SPARSE:
        azureQueryResultSearch = new AzureQueryResultSearchSparse(
          query,
          this.#fieldMapping,
          odataFilter,
          this.searchClient,
        );
        break;
      case VectorStoreQueryMode.HYBRID:
        azureQueryResultSearch = new AzureQueryResultSearchHybrid(
          query,
          this.#fieldMapping,
          odataFilter,
          this.searchClient,
        );
        break;
      case VectorStoreQueryMode.SEMANTIC_HYBRID:
        azureQueryResultSearch = new AzureQueryResultSearchSemanticHybrid(
          query,
          this.#fieldMapping,
          odataFilter,
          this.searchClient,
        );
        break;
    }

    // Execute the search and return the result
    return await azureQueryResultSearch.search();
  }
}
