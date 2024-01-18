import { MongoClient } from "mongodb";
import { Document, Metadata } from "../Node";
import { BaseReader } from "./base";

/**
 * Read in from MongoDB
 */
export class SimpleMongoReader implements BaseReader {
  private client: MongoClient;

  constructor(client: MongoClient) {
    this.client = client;
  }

  /**
   * Flattens an array of strings or string arrays into a single-dimensional array of strings.
   * @param texts - The array of strings or string arrays to flatten.
   * @returns The flattened array of strings.
   */
  private flatten(texts: Array<string | string[]>): string[] {
    return texts.reduce<string[]>(
      (result, text) => result.concat(text instanceof Array ? text : [text]),
      [],
    );
  }

  /**
   * Loads data from MongoDB collection
   * @param {string} dbName - The name of the database to load.
   * @param {string} collectionName - The name of the collection to load.
   * @param {string[]} fieldNames - An array of field names to retrieve from each document. Defaults to ["text"].
   * @param {string} separator - The separator to join multiple field values. Defaults to an empty string.
   * @param {Record<string, any>} filterQuery - Specific query, as specified by MongoDB NodeJS documentation.
   * @param {Number} maxDocs - The maximum number of documents to retrieve. Defaults to 0 (retrieve all documents).
   * @param {string[]} metadataNames - An optional array of metadata field names. If specified extracts this information as metadata.
   * @returns {Promise<Document[]>}
   * @throws If a field specified in fieldNames or metadataNames is not found in a MongoDB document.
   */
  // eslint-disable-next-line max-params
  public async loadData(
    dbName: string,
    collectionName: string,
    fieldNames: string[] = ["text"],
    separator: string = "",
    filterQuery: Record<string, any> = {},
    maxDocs: number = 0,
    metadataNames?: string[],
  ): Promise<Document[]> {
    const db = this.client.db(dbName);
    // Get items from collection
    const cursor = db
      .collection(collectionName)
      .find(filterQuery)
      .limit(maxDocs);

    const documents: Document[] = [];

    for await (const item of cursor) {
      try {
        const texts: Array<string | string[]> = fieldNames.map(
          (name) => item[name],
        );
        const flattenedTexts = this.flatten(texts);
        const text = flattenedTexts.join(separator);

        let metadata: Metadata = {};
        if (metadataNames) {
          // extract metadata if fields are specified
          metadata = Object.fromEntries(
            metadataNames.map((name) => [name, item[name]]),
          );
        }

        documents.push(new Document({ text, metadata }));
      } catch (err) {
        throw new Error(
          `Field not found in Mongo document: ${(err as Error).message}`,
        );
      }
    }
    return documents;
  }
}
