import type { CosmosClient, SqlQuerySpec } from "@azure/cosmos";
import type { Metadata } from "@llamaindex/core/schema";
import { type BaseReader, Document } from "@llamaindex/core/schema";

export type SimpleCosmosDBReaderLoaderConfig = {
  /**
   * The name of the database to read.
   */
  databaseName: string;
  /**
   * The name of the container to read.
   */
  containerName: string;
  /**
   * An array of field names to retrieve from each document. Defaults to ["text"].
   */
  fields?: string[];
  /**
   * The separator to join multiple field values. Defaults to an empty string.
   */
  fieldSeparator?: string;
  /**
   * A custom query to filter the documents. Defaults to `SELECT * FROM c`.
   */
  query?: string | SqlQuerySpec;
  /**
   * An optional array of metadata field names. If specified extracts this information as metadata.
   */
  metadataFields?: string[];
};

/**
 * Read data from CosmosDB.
 */
export class SimpleCosmosDBReader implements BaseReader {
  /**
   * The CosmosDB client.
   */
  private client: CosmosClient;

  constructor(client: CosmosClient) {
    this.client = client;
  }

  /**
   * Loads data from a Cosmos DB container
   * @returns {Promise<Document[]>}
   */
  public async loadData(
    config: SimpleCosmosDBReaderLoaderConfig,
  ): Promise<Document[]> {
    if (!config.databaseName || !config.containerName) {
      throw new Error("databaseName and containerName are required");
    }
    const database = this.client.database(config.databaseName);
    const container = database.container(config.containerName);
    const query = config.query || "SELECT * FROM c";
    const fields = config.fields || ["text"];
    const fieldSeparator = config.fieldSeparator || "";
    const metadataFields = config.metadataFields;

    try {
      let res = await container.items.query(query).fetchAll();
      const documents: Document[] = [];

      for (const item of res.resources) {
        const texts: Array<string | string[]> = fields.map(
          (name) => item[name],
        );
        const flattenedTexts = texts.flat();
        const text = flattenedTexts.join(fieldSeparator);

        let metadata: Metadata = {};
        if (metadataFields) {
          metadata = Object.fromEntries(
            metadataFields.map((name) => [name, item[name]]),
          );
        }
        documents.push(new Document({ id_: item.id, text, metadata }));
      }

      return documents;
    } catch (error) {
      throw new Error(`Error loading data from Cosmos DB: ${error}`);
    }
  }
}
