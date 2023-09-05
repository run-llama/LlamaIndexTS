import {Document} from "../Node";
import {BaseReader} from "./base";
import { MongoClient } from "mongodb";

/**
 * Read in from MongoDB
 */
export class MongoReader implements BaseReader {
    private client:MongoClient;

    constructor(client: MongoClient)
    {
        this.client = client;
    }
    async loadData(db_name: string,
        collection_name: string,
        max_docs?: number,
        //TODO: Think about whether we want to pass generic objects in...
        field_names?: object,
        query_dict?: object,
        query_options?: object,
        projection?: object
        ): Promise<Document[]> {

        //Make cursor
        const query: object = (query_dict) ? query_dict: {};
        const options: object = (query_options) ? query_options: {};
        const projections: object = (projection) ? projection: {};
        const limit: number = (max_docs) ? max_docs: Infinity;

        //Get items from collection using built-in functions
        const cursor: Partial<Document>[] = await this.client.db(db_name).collection(collection_name)
                                                                    .find(query, options)
                                                                    .limit(limit)
                                                                    .project(projections)
                                                                    .toArray();

        //Aggregate results and return
        const documents: Document[] = [];
        cursor.forEach((element: Partial<Document>)=> {documents.push(new Document(element))});
        return documents;
    }
}

