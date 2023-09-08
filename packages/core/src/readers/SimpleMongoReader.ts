import { MongoClient } from "mongodb";
import { Document } from "../Node";
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
   * Loads data from MongoDB collection
   * @param {string} db_name - The name of the database to load.
   * @param {string} collection_name - The name of the collection to load.
   * @param {Number} [max_docs = 0] - Maximum number of documents to return. 0 means no limit.
   * @param {object} [query_dict={}] - Specific query, as specified by MongoDB NodeJS documentation.
   * @param {object} [query_options={}] - Specific query options, as specified by MongoDB NodeJS documentation.
   * @param {projection} [projection = {}] - Projection options, as specified by MongoDB NodeJS documentation.
   * @returns {Promise<Document[]>}
   */
  async loadData(
    db_name: string,
    collection_name: string,
    max_docs = 0,
    //For later: Think about whether we want to pass generic objects in...
    query_dict = {},
    query_options = {},
    projection = {},
  ): Promise<Document[]> {
    //Get items from collection using built-in functions
    const cursor: Partial<Document>[] = await this.client
      .db(db_name)
      .collection(collection_name)
      .find(query_dict, query_options)
      .limit(max_docs)
      .project(projection)
      .toArray();

    //Aggregate results and return
    const documents: Document[] = [];
    cursor.forEach((element: Partial<Document>) => {
      //For later: Metadata filtering
      documents.push(new Document({ text: JSON.stringify(element) }));
    });
    return documents;
  }
}
