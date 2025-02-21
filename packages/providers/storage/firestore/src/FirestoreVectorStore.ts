import {
  CollectionReference,
  FieldValue,
  Filter,
  Firestore,
  type Settings,
  type VectorQuery,
  type WhereFilterOp,
} from "@google-cloud/firestore";
import type { BaseNode, Metadata } from "@llamaindex/core/schema";
import {
  BaseVectorStore,
  FilterOperator,
  metadataDictToNode,
  nodeToMetadata,
  type MetadataFilter,
  type MetadataFilters,
  type VectorStoreBaseParams,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "@llamaindex/core/vector-store";

enum DistanceMeasure {
  COSINE = "COSINE",
  EUCLIDEAN = "EUCLIDEAN",
  DOT_PRODUCT = "DOT_PRODUCT",
}

type FirestoreParams = {
  collectionName: string;
  client?: Firestore;
  clientOptions?: {
    credentials: Settings["credentials"];
    projectId: string;
    databaseId: string;
    ignoreUndefinedProperties: boolean;
  };
  batchSize?: number;
  embeddingKey?: string;
  textKey?: string;
  metadataKey?: string;
  distanceMeasure?: DistanceMeasure;
  customCollectionReference?: (
    rootCollection: CollectionReference,
  ) => CollectionReference;
} & VectorStoreBaseParams;

const DEFAULT_BATCH_SIZE = 500;

function toFirestoreOperator(operator: FilterOperator): WhereFilterOp {
  const operatorMap: Record<FilterOperator, WhereFilterOp> = {
    [FilterOperator.EQ]: "==",
    [FilterOperator.NE]: "!=",
    [FilterOperator.GT]: ">",
    [FilterOperator.GTE]: ">=",
    [FilterOperator.LT]: "<",
    [FilterOperator.LTE]: "<=",
    [FilterOperator.IN]: "in",
    [FilterOperator.NIN]: "not-in",
    [FilterOperator.CONTAINS]: "array-contains",
    [FilterOperator.TEXT_MATCH]: "==",
    [FilterOperator.ANY]: "array-contains-any",
    [FilterOperator.ALL]: "array-contains",
    [FilterOperator.IS_EMPTY]: "==",
  };

  const firestoreOp = operatorMap[operator];
  if (!firestoreOp) {
    throw new Error(`Operator ${operator} not supported in Firestore.`);
  }
  return firestoreOp;
}

function toFirestoreFilter(filters: MetadataFilters): Filter | undefined {
  if (!filters?.filters?.length) return undefined;

  const firestoreFilters = filters.filters.map((filter: MetadataFilter) => {
    const path = `${filter.key}`;
    const operator = toFirestoreOperator(filter.operator as FilterOperator);
    return Filter.where(path, operator, filter.value);
  });

  if (firestoreFilters.length === 1) {
    return firestoreFilters[0];
  }

  return filters.condition === "or"
    ? Filter.or(...firestoreFilters)
    : Filter.and(...firestoreFilters);
}

export class FirestoreVectorStore extends BaseVectorStore<Firestore> {
  storesText: boolean = true;
  isEmbeddingQuery?: boolean = false;
  flatMetadata: boolean = true;

  private firestoreClient: Firestore;
  private collectionName: string;
  private batchSize: number;
  private embeddingKey: string = "embedding";
  private metadataKey: string = "metadata";
  private distanceMeasure: DistanceMeasure = DistanceMeasure.COSINE;
  private customCollectionReference: (
    rootCollection: CollectionReference,
  ) => CollectionReference;

  constructor({
    collectionName = "vector_store",
    client,
    clientOptions,
    batchSize = DEFAULT_BATCH_SIZE,
    distanceMeasure = DistanceMeasure.COSINE,
    customCollectionReference,
    ...init
  }: FirestoreParams) {
    super(init);
    this.collectionName = collectionName;
    this.batchSize = batchSize;
    this.distanceMeasure = distanceMeasure;
    this.customCollectionReference =
      customCollectionReference ?? ((rootCollection) => rootCollection);

    if (client) {
      this.firestoreClient = client;
    } else {
      if (!clientOptions) {
        throw new Error("clientOptions are required");
      }
      if (!clientOptions.credentials) {
        throw new Error("clientOptions.credentials are required");
      }
      if (!clientOptions.projectId) {
        throw new Error("clientOptions.projectId is required");
      }
      this.firestoreClient = new Firestore({
        credentials: clientOptions.credentials,
        projectId: clientOptions.projectId,
        databaseId: clientOptions?.databaseId,
        ignoreUndefinedProperties:
          clientOptions.ignoreUndefinedProperties ?? false,
      });
    }
  }

  public client() {
    return this.firestoreClient;
  }

  /**
   * Adds nodes to the vector store
   * @param {BaseNode<Metadata>[]} nodes - Array of nodes to add to the vector store
   * @returns {Promise<string[]>} Array of node IDs that were added
   */
  async add(nodes: BaseNode<Metadata>[]): Promise<string[]> {
    const batch = this.firestoreClient.batch();
    const collection = this.customCollectionReference(
      this.firestoreClient.collection(this.collectionName),
    );

    const ids: string[] = [];

    for (const node of nodes) {
      const docRef = collection.doc(node.id_);
      const metadata = nodeToMetadata(
        node,
        !this.storesText,
        "text",
        this.flatMetadata,
      );
      const entry = {
        [this.embeddingKey]: FieldValue.vector(node.getEmbedding()),
        [this.metadataKey]: metadata,
      };

      batch.set(docRef, entry, { merge: true });

      ids.push(node.id_);

      // Commit batch when it reaches the size limit
      if (ids.length % this.batchSize === 0) {
        await batch.commit();
      }
    }

    // Commit any remaining documents
    if (nodes.length % this.batchSize !== 0) {
      await batch.commit();
    }

    return ids;
  }

  /**
   * Deletes all nodes from the vector store that match the given filename
   * @param {string} fileName - Name of the file whose nodes should be deleted
   * @returns {Promise<void>}
   */
  async delete(fileName: string): Promise<void> {
    const collection = this.customCollectionReference(
      this.firestoreClient.collection(this.collectionName),
    );
    const snapshot = await collection
      .where(`${this.metadataKey}.file_name`, "==", fileName)
      .get();

    const batch = this.firestoreClient.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  /**
   * Queries the vector store for similar nodes
   * @param {VectorStoreQuery} query - Query parameters including queryStr or queryEmbedding, filters, and similarityTopK
   * @param {object} [_options] - Optional parameters for the query
   * @returns {Promise<VectorStoreQueryResult>} Query results containing matching nodes, their similarities, and IDs
   * @throws {Error} When neither queryEmbedding nor queryStr is provided
   */
  async query(
    query: VectorStoreQuery,
    _options?: object,
  ): Promise<VectorStoreQueryResult> {
    if (!query.queryEmbedding) {
      throw new Error("No query embedding provided");
    }

    // Get documents with filters if any
    let baseQuery = this.firestoreClient.collection(this.collectionName);
    baseQuery = this.customCollectionReference(baseQuery);
    if (query.filters) {
      const filter = toFirestoreFilter(query.filters);
      if (filter) {
        baseQuery = baseQuery.where(filter) as CollectionReference;
      }
    }

    // Use Firestore's native vector search
    const vectorQuery = baseQuery.findNearest({
      vectorField: this.embeddingKey,
      queryVector: query.queryEmbedding,
      limit: query.similarityTopK,
      distanceMeasure: this.distanceMeasure,
      distanceResultField: "vector_distance",
    }) as VectorQuery;

    const snapshot = await vectorQuery.get();

    // Convert results to VectorStoreQueryResult format
    const topKIds: string[] = [];
    const topKNodes: BaseNode[] = [];
    const topKSimilarities: number[] = [];

    snapshot.forEach((doc) => {
      const distance = doc.get("vector_distance") as number;
      // Convert distance to similarity score (1 - normalized distance)
      const similarity =
        this.distanceMeasure === DistanceMeasure.DOT_PRODUCT
          ? distance // For dot product, higher is more similar
          : 1 / (1 + distance); // For EUCLIDEAN and COSINE, lower distance means more similar

      topKIds.push(doc.id);
      topKNodes.push(metadataDictToNode(doc.get(this.metadataKey)));
      topKSimilarities.push(similarity);
    });

    return {
      nodes: topKNodes,
      similarities: topKSimilarities,
      ids: topKIds,
    };
  }
}
