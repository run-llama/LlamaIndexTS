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

import { getEnv } from "@llamaindex/env";
import {
  BaseNode,
  BaseVectorStore,
  FilterCondition,
  FilterOperator,
  type MetadataFilters,
  MetadataMode,
  type VectorStoreQuery,
  VectorStoreQueryMode,
  type VectorStoreQueryResult,
} from "llamaindex";
import {
  type AzureQueryResultSearchBase,
  AzureQueryResultSearchDefault,
  AzureQueryResultSearchHybrid,
  AzureQueryResultSearchSemanticHybrid,
  AzureQueryResultSearchSparse,
} from "./AzureQueryResultSearch.js";

export const enum IndexManagement {
  NO_VALIDATION = "NoValidation",
  VALIDATE_INDEX = "ValidateIndex",
  CREATE_IF_NOT_EXISTS = "CreateIfNotExists",
}

enum MetadataIndexFieldType {
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
  filterableMetadataFieldKeys: FilterableMetadataFieldKeysType;
  indexMapping?: (
    enrichedDoc: Record<string, unknown>,
    metadata: Record<string, unknown>,
  ) => T;
}

const DEFAULT_MAX_BATCH_SIZE = 700;
const DEFAULT_MAX_MB_SIZE = 14 * 1024 * 1024; // 14MB in bytes
const USER_AGENT = "llamaindex-ts";

type ODataFiltersType = {
  odata_filters?: string;
};

// TODO: VectorStoreQueryMode does not provide a SEMANTIC_HYBRID mode,
// submit a PR to llamaindex to add this mode
const AzureAiSearchVectorStoreQueryMode = {
  ...VectorStoreQueryMode,
  SEMANTIC_HYBRID: "semantic_hybrid",
};
type AzureAiSearchVectorStoreQueryMode =
  (typeof AzureAiSearchVectorStoreQueryMode)[keyof typeof AzureAiSearchVectorStoreQueryMode];

type FilterableMetadataFieldKeysType =
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

// ported from https://github.com/run-llama/LlamaIndexTS/pull/6/files#diff-ade1c63e3d4df965988fecc83a556eecbb00693577fdfa7b1a7cac562127cce1R26
function nodeToMetadataDict(
  node: BaseNode,
  removeText: boolean = false,
  textField: string = "text",
  flatMetadata: boolean = false,
): Record<string, unknown> {
  const metadata: Record<string, unknown> = node.metadata;

  if (flatMetadata) {
    validateIsFlatDict(metadata);
  }

  // Store entire node as a JSON string - some minor text duplication
  // TODO: move off JSON.stringify to ensure compatibility with python
  const nodeDict = JSON.parse(JSON.stringify(node));
  if (removeText) {
    nodeDict[textField] = "";
  }

  // Remove embedding from nodeDict
  nodeDict["embedding"] = null;

  // Dump the remainder of nodeDict to a JSON string
  metadata["_nodeContent"] = JSON.stringify(nodeDict);

  // Store ref doc ID at the top level to allow metadata filtering
  metadata["refDocId"] = node.id_ || "None";

  return metadata;
}

export class AzureAISearchVectorStore<T extends R> extends BaseVectorStore {
  public storesText: boolean = true;
  public searchClient: SearchClient<T> | undefined;

  private _languageAnalyzer: LexicalAnalyzerName | undefined;
  private _embeddingDimensionality: number | undefined;
  private _vectorProfileName: string | undefined;
  private _compressionType: KnownVectorSearchCompressionKind | undefined;
  private _indexClient: SearchIndexClient | undefined;
  private _indexManagement: IndexManagement | undefined;
  private _indexName: string | undefined;
  private _fieldMapping: Record<string, string>;
  private _indexMapping: (
    enrichedDoc: Record<string, unknown>,
    metadata: Record<string, unknown>,
  ) => T;
  private _metadataToIndexFieldMap: Map<
    string,
    [string, MetadataIndexFieldType]
  > = new Map();
  flatMetadata = false;

  constructor(options: AzureAISearchOptions<T>) {
    super();

    // set default values
    options.vectorAlgorithmType ||=
      KnownVectorSearchAlgorithmKind.ExhaustiveKnn;
    options.languageAnalyzer ||= KnownAnalyzerNames.EnLucene;
    options.indexManagement ||= IndexManagement.NO_VALIDATION;
    options.embeddingDimensionality ||= 1536;

    // set props
    this._languageAnalyzer = options.languageAnalyzer;
    this._compressionType = options.compressionType;
    this._embeddingDimensionality = options.embeddingDimensionality;
    this._indexManagement = options.indexManagement;
    this._indexName = options.indexName;

    this._setVectorProfileName(options.vectorAlgorithmType);
    this._valideSearchOrIndexClient(options);

    // Default field mapping
    this._fieldMapping = {
      ["id" as keyof T]: options.idFieldKey,
      ["chunk" as keyof T]: options.chunkFieldKey,
      ["embedding" as keyof T]: options.embeddingFieldKey,
      ["metadata" as keyof T]: options.metadataStringFieldKey,
      ["doc_id" as keyof T]: options.docIdFieldKey,
    } as Record<SelectFields<T>, string>;

    this._indexMapping = options.indexMapping || this._defaultIndexMapping;

    // Normalizing metadata to index fields
    this._metadataToIndexFieldMap = this._normalizeMetadataToIndexFields(
      options.filterableMetadataFieldKeys,
    );

    const baseUserAgent = USER_AGENT;
    const userAgentString = (userAgent?: string) =>
      userAgent ? `${baseUserAgent} ${userAgent}` : baseUserAgent;
  }

  // private

  private _normalizeMetadataToIndexFields(
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

  private _defaultIndexMapping(
    enrichedDoc: Record<string, unknown>,
    metadata: Record<string, unknown>,
  ): T {
    const indexDoc = {} as Record<string, unknown>;

    // Map fields from enriched document based on field mapping
    for (const field in this._fieldMapping) {
      const value = enrichedDoc[field];
      if (value) {
        const mappedKey = this._fieldMapping[field];
        if (mappedKey) {
          indexDoc[mappedKey] = value;
        }
      }
    }

    // Map metadata fields to index fields based on metadata-to-index mapping
    for (const [
      metadataFieldName,
      [indexFieldName],
    ] of this._metadataToIndexFieldMap.entries()) {
      const metadataValue = metadata[metadataFieldName];
      if (metadataValue) {
        indexDoc[indexFieldName] = metadataValue;
      }
    }

    return indexDoc as T;
  }

  private _setVectorProfileName(
    vectorAlgorithmType?: KnownVectorSearchAlgorithmKind,
  ): void {
    if (vectorAlgorithmType === KnownVectorSearchAlgorithmKind.ExhaustiveKnn) {
      this._vectorProfileName = "myExhaustiveKnnProfile";
    } else if (vectorAlgorithmType === KnownVectorSearchAlgorithmKind.Hnsw) {
      this._vectorProfileName = "myHnswProfile";
    } else {
      throw new Error(
        "Only 'exhaustiveKnn' and 'hnsw' are supported for vectorAlgorithmType",
      );
    }
  }

  private _createMetadataIndexFields(): SimpleField[] {
    const indexFields: SimpleField[] = [];

    Object.values(this._metadataToIndexFieldMap.entries()).forEach(
      ([fieldName, fieldType]) => {
        if (Object.values(this._fieldMapping).includes(fieldName)) return;

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

  private async _indexExists(indexName?: string) {
    if (!indexName) {
      throw new Error(`IndexName is invalid`);
    }

    const availableIndexNames = await this._indexClient?.listIndexesNames();
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

  private async _createIndexIfNotExists(indexName: string): Promise<void> {
    const indexExists = await this._indexExists(indexName);
    if (!indexExists) {
      console.info(
        `Index ${indexName} does not exist in Azure AI Search, creating index`,
      );
      await this._createIndex(indexName);
    }
  }

  private async _createIndex(indexName: string) {
    console.log(`Configuring ${indexName} fields for Azure AI Search`);

    const fields: SearchField[] = [
      {
        name: "id",
        type: KnownSearchFieldDataType.String,
        key: true,
      },
      {
        name: "chunk",
        type: KnownSearchFieldDataType.String,
        analyzerName: this._languageAnalyzer as LexicalAnalyzerName,
      },
      {
        name: "embedding",
        type: `Collection(${KnownSearchFieldDataType.Single})`,
        searchable: true,
        vectorSearchDimensions: this._embeddingDimensionality as number,
        vectorSearchProfileName: this._vectorProfileName as string,
      },
      {
        name: "metadata",
        type: KnownSearchFieldDataType.String,
      },
      {
        name: "doc_id",
        type: KnownSearchFieldDataType.String,
        filterable: true,
      },
    ];

    console.log(`Configuring ${indexName} vector search`);

    const compressions = this._getCompressions();
    console.log(
      `Configuring ${indexName} vector search with ${this._compressionType} compression`,
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
      compressions: compressions,
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

    console.log(`Configuring ${indexName} semantic search`);

    const semanticConfig: SemanticConfiguration = {
      name: "mySemanticConfig",
      prioritizedFields: {
        contentFields: [
          {
            name: "chunk",
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

    console.debug(`Creating ${indexName} search index`);
    await this._indexClient?.createIndex(index);
  }

  private _getCompressions(): Array<VectorSearchCompression> {
    const compressions: VectorSearchCompression[] = [];
    if (
      this._compressionType ===
      KnownVectorSearchCompressionKind.BinaryQuantization
    ) {
      compressions.push({
        compressionName: "myBinaryCompression",
        kind: KnownVectorSearchCompressionKind.BinaryQuantization,
      });
    } else if (
      this._compressionType ===
      KnownVectorSearchCompressionKind.ScalarQuantization
    ) {
      compressions.push({
        compressionName: "myScalarCompression",
        kind: KnownVectorSearchCompressionKind.ScalarQuantization,
      });
    }
    return compressions;
  }

  private _valideSearchOrIndexClient(options: AzureAISearchOptions<T>): void {
    if (options.searchClient) {
      if (options.searchClient instanceof SearchClient) {
        this.searchClient = options.searchClient;

        if (options.indexName) {
          throw new Error("indexName cannot be supplied if using SearchClient");
        }
      } else {
        throw new Error("searchClient must be an instance of SearchClient");
      }
    } else {
      this._createSearchClient(options);
    }

    if (options.indexClient) {
      if (options.indexClient instanceof SearchIndexClient) {
        if (!options.indexName) {
          throw new Error(
            "indexName must be supplied if using SearchIndexClient",
          );
        }

        this._indexClient = options.indexClient;
        // this.searchClient = this._indexClient.getSearchClient(
        //   options.indexName,
        // );
      } else {
        throw new Error("indexClient must be an instance of SearchIndexClient");
      }
    }

    if (
      options.indexManagement === IndexManagement.CREATE_IF_NOT_EXISTS &&
      !this._indexClient
    ) {
      throw new Error(
        "IndexManagement.CREATE_IF_NOT_EXISTS requires a SearchIndexClient",
      );
    }

    if (!this.searchClient && !this._indexClient) {
      throw new Error("Either searchClient or indexClient must be supplied");
    }
  }

  private _createSearchClient(options: AzureAISearchOptions<T>): void {
    let { credentials, key, endpoint, indexName } = options;

    // validate and use credentials
    if (credentials) {
      // if credentials are provided, ensure they are an instance of AzureKeyCredential
      if (credentials instanceof AzureKeyCredential) {
        throw new Error(
          "credentials must be an instance of AzureKeyCredential, not SearchClient",
        );
      }
      // if credentials are not provided, instantiate AzureKeyCredential with key
      else if (!credentials) {
        key ??= getEnv("AZURE_AI_SEARCH_KEY");
        if (!key) {
          throw new Error(
            "key must be provided in options or set as an environment variable",
          );
        }

        credentials = new AzureKeyCredential(key);
      }
    }

    // validate and use endpoint
    endpoint ??= getEnv("AZURE_AI_SEARCH_ENDPOINT");
    if (!endpoint) {
      throw new Error(
        "endpoint must be provided in options or set as an environment variable",
      );
    }

    // validate and use indexName
    indexName ??= this._indexName;
    if (!indexName) {
      throw new Error("indexName must be provided in options");
    }

    this.searchClient = new SearchClient<T>(
      endpoint,
      indexName,
      credentials as AzureKeyCredential,
      {
        userAgentOptions: {
          userAgentPrefix: "llamaindex",
        },
      },
    );
  }

  private async _validateIndex(indexName?: string) {
    if (
      this._indexClient &&
      indexName &&
      !(await this._indexExists(indexName))
    ) {
      throw new Error(`Validation failed, index ${indexName} does not exist.`);
    }
  }

  /**
   * Create AI Search index document from embedding result.
   * @param node
   * @returns
   */
  private _createIndexDocument(node: BaseNode<T>): T {
    const doc = {
      id: node.id_,
      doc_id: node.id_,
      chunk: node.getContent(MetadataMode.NONE),
      embedding: node.getEmbedding(),
      metadata: node.metadata,
    };

    const nodeMetadata = nodeToMetadataDict(
      node,
      true,
      "text",
      this.flatMetadata,
    );

    // TODO: figure out if/how to store metadata in the index
    doc.metadata = nodeMetadata as T;

    return this._indexMapping(doc, nodeMetadata);
  }

  private createOdataFilter(metadataFilters: MetadataFilters): string {
    const odataFilter: string[] = [];

    for (const subfilter of metadataFilters.filters) {
      const metadataMapping = this._metadataToIndexFieldMap.get(subfilter.key);

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

    console.info(`OData filter: ${odataExpr}`);
    return odataExpr;
  }

  // public

  client() {
    return this.searchClient;
  }

  async add(nodes: BaseNode<T>[]): Promise<string[]> {
    if (!this.searchClient) {
      throw new Error("Async Search client not initialized");
    }

    if (nodes.length > 0) {
      if (
        this._indexManagement === IndexManagement.CREATE_IF_NOT_EXISTS &&
        this._indexName
      ) {
        await this._createIndexIfNotExists(this._indexName);
      }
      if (this._indexManagement === IndexManagement.VALIDATE_INDEX) {
        await this._validateIndex(this._indexName);
      }
    }

    const accumulator = new IndexDocumentsBatch<T>();
    let documents: T[] = [];
    const ids: string[] = [];
    let accumulatedSize = 0;
    const maxSize = DEFAULT_MAX_MB_SIZE;
    const maxDocs = DEFAULT_MAX_BATCH_SIZE;

    for (const node of nodes) {
      console.debug(`Processing embedding: ${node.id_}`);
      ids.push(node.id_);

      const indexDocument = this._createIndexDocument(node);
      const documentSize = JSON.stringify(indexDocument).length;
      documents.push(indexDocument);
      accumulatedSize += documentSize;

      accumulator.upload(documents);

      if (documents.length >= maxDocs || accumulatedSize >= maxSize) {
        console.info(
          `Uploading batch of size ${documents.length}, current progress ${ids.length} of ${nodes.length}, accumulated size ${(accumulatedSize / (1024 * 1024)).toFixed(2)} MB`,
        );
        await this.searchClient.indexDocuments(accumulator);

        // Todo: gc
        // accumulator = null;
        documents = [];
        accumulatedSize = 0;
      }
    }

    if (documents.length > 0) {
      console.info(
        `Uploading remaining batch of size ${documents.length}, current progress ${ids.length} of ${nodes.length}, accumulated size ${(accumulatedSize / (1024 * 1024)).toFixed(2)} MB`,
      );
      await this.searchClient.indexDocuments(accumulator);
    }

    return ids;
  }

  async delete(refDocId: string) {
    // Check if index exists
    if (!(await this._indexExists(this._indexName))) {
      return;
    }

    if (!this.searchClient) {
      throw new Error("searchClient is not initialized");
    }

    // Define filter and batch size
    const filterExpr = `${this._fieldMapping["doc_id"]} eq '${refDocId}'`;
    const batchSize = 1000;

    while (true) {
      // Search for documents to delete
      const searchResults = await this.searchClient.search("*", {
        filter: filterExpr,
        top: batchSize,
      });

      console.debug(`Searching with filter ${filterExpr}`);

      // Collect document IDs to delete
      const docsToDelete = [] as T[];
      for await (const result of searchResults.results) {
        const { document } = result;
        docsToDelete.push(document);
      }

      // Delete documents if found
      if (docsToDelete.length > 0) {
        console.debug(`Deleting ${docsToDelete.length} documents`);
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
      odataFilter = this.createOdataFilter(query.filters);
    }

    // Define base AzureQueryResultSearch object based on query mode
    let azureQueryResultSearch: AzureQueryResultSearchBase<T> =
      new AzureQueryResultSearchDefault(
        query,
        this._fieldMapping,
        odataFilter,
        this.searchClient,
      );

    switch (query.mode as AzureAiSearchVectorStoreQueryMode) {
      case AzureAiSearchVectorStoreQueryMode.SPARSE:
        azureQueryResultSearch = new AzureQueryResultSearchSparse(
          query,
          this._fieldMapping,
          odataFilter,
          this.searchClient,
        );
        break;
      case AzureAiSearchVectorStoreQueryMode.HYBRID:
        azureQueryResultSearch = new AzureQueryResultSearchHybrid(
          query,
          this._fieldMapping,
          odataFilter,
          this.searchClient,
        );
        break;
      case AzureAiSearchVectorStoreQueryMode.SEMANTIC_HYBRID:
        azureQueryResultSearch = new AzureQueryResultSearchSemanticHybrid(
          query,
          this._fieldMapping,
          odataFilter,
          this.searchClient,
        );
        break;
    }

    // Execute the search and return the result
    return await azureQueryResultSearch.search();
  }
}
