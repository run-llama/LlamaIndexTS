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
  type SelectFields,
  type SemanticConfiguration,
  type SemanticSearch,
  type SimpleField,
  type VectorSearch,
  type VectorSearchCompression,
} from "@azure/search-documents";

import { consoleLogger, getEnv } from "@llamaindex/env";
import {
  BaseNode,
  BaseVectorStore,
  FilterCondition,
  FilterOperator,
  type MetadataFilters,
  MetadataMode,
  type VectorStoreBaseParams,
  type VectorStoreQuery,
  VectorStoreQueryMode,
  type VectorStoreQueryResult,
} from "llamaindex";
import { nodeToMetadata } from "../utils.js";
import {
  type AzureQueryResultSearchBase,
  AzureQueryResultSearchDefault,
  AzureQueryResultSearchHybrid,
  AzureQueryResultSearchSemanticHybrid,
  AzureQueryResultSearchSparse,
} from "./AzureQueryResultSearch.js";

// define constants
const DEFAULT_MAX_BATCH_SIZE = 700;
const DEFAULT_MAX_MB_SIZE = 14 * 1024 * 1024; // 14MB in bytes
const USER_AGENT_PREFIX = "llamaindex-ts";
const AZURE_API_DEFAULT_VERSION = "2024-09-01-preview";

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

type R = Record<
  "id" | "content" | "embedding" | "doc_id" | "metadata",
  unknown
>;
interface AzureAISearchOptions<T extends R> {
  userAgent?: string;
  credentials?: AzureKeyCredential;
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
  idFieldKey: string;
  chunkFieldKey: string;
  embeddingFieldKey: string;
  metadataStringFieldKey: string;
  docIdFieldKey: string;
  hiddenFiledKeys?: string[] | undefined;
  filterableMetadataFieldKeys: FilterableMetadataFieldKeysType;
  indexMapping?: (
    enrichedDoc: BaseNode,
    metadata: Record<string, unknown>,
  ) => T;
}

type ODataFiltersType = {
  odata_filters?: string;
};

export type FilterableMetadataFieldKeysType =
  | Array<string>
  | Map<string, string>
  | Map<string, [string, MetadataIndexFieldType]>;

function validateIsFlatDict(metadataDict: Record<string, unknown>): void {
  for (const [key, val] of Object.entries(metadataDict)) {
    if (typeof key !== "string") {
      throw new Error("Metadata key must be a string!");
    }
    if (
      typeof val !== "string" &&
      typeof val !== "number" &&
      typeof val !== "boolean" &&
      val !== null
    ) {
      throw new Error(
        `Value for metadata '${key}' must be one of (string, number, boolean, null)`,
      );
    }
  }
}

/**
 * Azure AI Search vector store.
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
  #fieldMapping: Record<string, string>;
  #metadataToIndexFieldMap: Map<string, [string, MetadataIndexFieldType]> =
    new Map();
  flatMetadata = false;
  #idFieldKey: string | undefined;
  #chunkFieldKey: string | undefined;
  #embeddingFieldKey: string | undefined;
  #docIdFieldKey: string | undefined;
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
    options.hiddenFiledKeys ||= [];

    // set props
    this.#serviceApiVersion =
      options.serviceApiVersion || AZURE_API_DEFAULT_VERSION;
    this.#languageAnalyzer = options.languageAnalyzer;
    this.#compressionType = options.compressionType;
    this.#embeddingDimensionality = options.embeddingDimensionality;
    this.#indexManagement = options.indexManagement;
    this.#indexName = options.indexName;
    this.#idFieldKey = options.idFieldKey;
    this.#docIdFieldKey = options.docIdFieldKey;
    this.#chunkFieldKey = options.chunkFieldKey;
    this.#embeddingFieldKey = options.embeddingFieldKey;
    this.#hiddenFiledKeys = options.hiddenFiledKeys;

    this.#setVectorProfileName(options.vectorAlgorithmType);
    this.#valideSearchOrIndexClient(options);

    // Default field mapping
    this.#fieldMapping = {
      ["id" as keyof T]: options.idFieldKey,
      ["chunk" as keyof T]: options.chunkFieldKey,
      ["embedding" as keyof T]: options.embeddingFieldKey,
      ["metadata" as keyof T]: options.metadataStringFieldKey,
      ["doc_id" as keyof T]: options.docIdFieldKey,
    } as Record<SelectFields<T>, string>;

    this.#indexMapping = options.indexMapping || this.#defaultIndexMapping;

    // Normalizing metadata to index fields
    this.#metadataToIndexFieldMap = this.#normalizeMetadataToIndexFields(
      options.filterableMetadataFieldKeys,
    );

    const baseUserAgent = USER_AGENT_PREFIX;
    const userAgentString = (userAgent?: string) =>
      userAgent ? `${baseUserAgent} ${userAgent}` : baseUserAgent;
  }

  // private

  #normalizeMetadataToIndexFields(
    filterableMetadataFieldKeys?: FilterableMetadataFieldKeysType,
  ) {
    const indexFieldSpec: Map<string, [string, MetadataIndexFieldType]> =
      new Map();

    if (Array.isArray(filterableMetadataFieldKeys)) {
      filterableMetadataFieldKeys.forEach((field) => {
        indexFieldSpec.set(field, [field, MetadataIndexFieldType.STRING]);
      });
    } else if (typeof filterableMetadataFieldKeys === "object") {
      Object.entries(filterableMetadataFieldKeys).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          indexFieldSpec.set(k, [k, MetadataIndexFieldType.COLLECTION]);
        } else if (typeof v === "boolean") {
          indexFieldSpec.set(k, [k, MetadataIndexFieldType.BOOLEAN]);
        } else if (typeof v === "number" && Number.isInteger(v)) {
          indexFieldSpec.set(k, [k, MetadataIndexFieldType.INT32]);
        } else if (typeof v === "number") {
          indexFieldSpec.set(k, [k, MetadataIndexFieldType.DOUBLE]);
        } else if (typeof v === "string") {
          indexFieldSpec.set(k, [k, MetadataIndexFieldType.STRING]);
        } else {
          indexFieldSpec.set(k, [v as string, MetadataIndexFieldType.STRING]);
        }
      });
    }

    return indexFieldSpec;
  }

  #defaultIndexMapping(node: BaseNode, metadata: Record<string, unknown>): T {
    return {
      [this.#embeddingFieldKey as string]: node.getEmbedding(),
      [this.#idFieldKey as string]: node.id_,
      [this.#docIdFieldKey as string]: node.id_,
      [this.#chunkFieldKey as string]: node.getContent(MetadataMode.NONE),
      metadata: JSON.stringify(metadata),
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

  #createMetadataIndexFields(): Array<SimpleField | SearchField> {
    const indexFields: Array<SimpleField | SearchField> = [];

    Object.values(this.#metadataToIndexFieldMap.entries()).forEach(
      ([fieldName, fieldType]) => {
        if (Object.values(this.#fieldMapping).includes(fieldName)) return;

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
      },
    );

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
        retrievable: true,
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
      },
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
          name: "myHnsw",
          kind: KnownVectorSearchAlgorithmKind.Hnsw,
          parameters: {
            m: 4,
            efConstruction: 400,
            efSearch: 500,
            metric: KnownVectorSearchAlgorithmMetric.Cosine,
          },
        },
        {
          name: "myExhaustiveKnn",
          kind: KnownVectorSearchAlgorithmKind.ExhaustiveKnn,
          parameters: {
            metric: KnownVectorSearchAlgorithmMetric.Cosine,
          },
        },
      ],
      compressions,
      profiles: [
        {
          name: "myHnswProfile",
          algorithmConfigurationName: "myHnsw",
          compressionName: compressions?.[0]?.compressionName as string,
        },
        {
          name: "myExhaustiveKnnProfile",
          algorithmConfigurationName: "myExhaustiveKnn",
        },
      ],
    };

    consoleLogger.log(`Configuring ${indexName} semantic search`);

    const semanticConfig: SemanticConfiguration = {
      name: "mySemanticConfig",
      prioritizedFields: {
        contentFields: [
          {
            name: this.#fieldMapping["chunk"] as string,
          },
        ],
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

  #getCompressions(): Array<VectorSearchCompression> {
    const compressions: VectorSearchCompression[] = [];
    if (
      this.#compressionType ===
      KnownVectorSearchCompressionKind.BinaryQuantization
    ) {
      compressions.push({
        compressionName: "myBinaryCompression",
        kind: KnownVectorSearchCompressionKind.BinaryQuantization,
      });
    } else if (
      this.#compressionType ===
      KnownVectorSearchCompressionKind.ScalarQuantization
    ) {
      compressions.push({
        compressionName: "myScalarCompression",
        kind: KnownVectorSearchCompressionKind.ScalarQuantization,
      });
    }
    return compressions;
  }

  #valideSearchOrIndexClient(options: AzureAISearchOptions<T>): void {
    if (options.searchClient) {
      if (options.searchClient instanceof SearchClient) {
        consoleLogger.log("Using provided Azure Search client");
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
    let { credentials, key, endpoint, indexName } = options;

    // validate and use credentials
    if (credentials) {
      // if credentials are provided, ensure they are an instance of AzureKeyCredential
      if (!(credentials instanceof AzureKeyCredential)) {
        throw new Error(
          "options.credentials must be an instance of AzureKeyCredential",
        );
      }
    }
    // if credentials are not provided, instantiate AzureKeyCredential with key
    else {
      key ??= getEnv("AZURE_AI_SEARCH_KEY");
      if (!key) {
        throw new Error(
          "options.key must be provided or set as an environment variable: AZURE_AI_SEARCH_KEY",
        );
      }

      consoleLogger.log("Using provided Azure Search key");
      credentials = new AzureKeyCredential(key);
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

    return { credentials, endpoint, indexName };
  }

  #createSearchIndexClient(options: AzureAISearchOptions<T>): void {
    const { credentials, endpoint, indexName } =
      this.#buildCredentials(options);

    consoleLogger.log(
      `Creating Azure Search index client for index ${indexName}`,
    );
    this.#indexClient = new SearchIndexClient(
      endpoint,
      credentials as AzureKeyCredential,
      {
        serviceVersion: this.#serviceApiVersion as string,
        userAgentOptions: {
          userAgentPrefix: options.userAgent ?? USER_AGENT_PREFIX,
        },
      },
    );
  }

  #createSearchClient(options: AzureAISearchOptions<T>): void {
    const { credentials, endpoint, indexName } =
      this.#buildCredentials(options);

    consoleLogger.log(`Creating Azure Search client for index ${indexName}`);
    this.searchClient = new SearchClient<T>(
      endpoint,
      indexName,
      credentials as AzureKeyCredential,
      {
        serviceVersion: this.#serviceApiVersion as string,
        userAgentOptions: {
          userAgentPrefix: options.userAgent ?? USER_AGENT_PREFIX,
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
   * @param node
   * @returns
   */
  #createIndexDocument(node: BaseNode): T {
    consoleLogger.log(`Mapping indexed document: ${node.id_}`);

    const metadata = nodeToMetadata(
      node,
      true,
      this.#chunkFieldKey,
      this.flatMetadata,
    );

    const mappedDoc = this.#indexMapping(node, metadata);
    consoleLogger.log({ mappedDoc });

    return mappedDoc;
  }

  #createOdataFilter(metadataFilters: MetadataFilters): string {
    const odataFilter: string[] = [];

    for (const subfilter of metadataFilters.filters) {
      const metadataMapping = this.#metadataToIndexFieldMap.get(subfilter.key);

      if (!metadataMapping) {
        throw new Error(
          `Metadata field '${subfilter.key}' is missing a mapping to an index field. Please provide an entry in 'filterableMetadataFieldKeys' for this vector store.`,
        );
      }

      const indexField = metadataMapping[0];

      if (subfilter.operator === FilterOperator.IN) {
        const valueStr = (subfilter.value as string[])
          .map((value) =>
            typeof value === "string" ? `t eq '${value}'` : `t eq ${value}`,
          )
          .join(" or ");
        odataFilter.push(`${indexField}/any(t: ${valueStr})`);
      } else if (subfilter.operator === FilterOperator.EQ) {
        const escapedValue =
          typeof subfilter.value === "string"
            ? (subfilter.value as string).replace(/'/g, "''")
            : subfilter.value;
        odataFilter.push(`${indexField} eq '${escapedValue}'`);
      } else {
        throw new Error(`Unsupported filter operator ${subfilter.operator}`);
      }
    }

    const odataExpr =
      metadataFilters.condition === FilterCondition.AND
        ? odataFilter.join(" and ")
        : metadataFilters.condition === FilterCondition.OR
          ? odataFilter.join(" or ")
          : (() => {
              throw new Error(
                `Unsupported filter condition ${metadataFilters.condition}`,
              );
            })();

    consoleLogger.log(`OData filter: ${odataExpr}`);
    return odataExpr;
  }

  // public

  client() {
    return this.searchClient;
  }

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
    const maxSize = DEFAULT_MAX_MB_SIZE;
    const maxDocs = DEFAULT_MAX_BATCH_SIZE;

    for (const node of nodes) {
      consoleLogger.log(`Processing embedding: ${node.id_}`);

      const indexDocument = this.#createIndexDocument(node);

      const documentSize = JSON.stringify(indexDocument).length; // in bytes
      documents.push(indexDocument);
      accumulatedSize += documentSize;

      consoleLogger.log({ accumulatedSize, maxSize, maxDocs });
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
      const searchResults = await this.searchClient.search("*", {
        filter: filterExpr,
        top: batchSize,
      });

      consoleLogger.log(`Searching with filter ${filterExpr}`);

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
        break;
      }
    }
  }

  async query(
    query: VectorStoreQuery,
    options: ODataFiltersType = {},
  ): Promise<VectorStoreQueryResult> {
    let odataFilter: string | undefined;

    // Use user-provided OData filters if present, otherwise generate from query filters
    const odataFilters = options["odata_filters"];
    if (odataFilters) {
      odataFilter = odataFilters;
    } else if (query.filters) {
      odataFilter = this.#createOdataFilter(query.filters);
    }

    consoleLogger.log(`Querying with OData filter: ${odataFilter}`);
    consoleLogger.log({
      query,
      _fieldMapping: this.#fieldMapping,
      odataFilter,
      options,
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
