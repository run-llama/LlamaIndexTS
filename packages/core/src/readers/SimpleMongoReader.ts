import {Document} from "../Node";
import {BaseReader} from "./base";
import { MongoClient } from "mongodb";

/**
 * Read in from MongoDB
 */
export class SimpleMongoReader implements BaseReader {
    private client:MongoClient;

    constructor(client: MongoClient)
    {
        this.client = client;
    }
    async loadData(db_name: string,
        collection_name: string,
        max_docs = Infinity,
        //TODO: Think about whether we want to pass generic objects in...
        query_dict = {},
        query_options = {},
        projection = {}
        ): Promise<Document[]> {

        //Make cursor
        const query: object = (query_dict) ? query_dict: {};
        const options: object = (query_options) ? query_options: {};
        const projections: object = (projection) ? projection: {};
        const limit: number = (max_docs) ? max_docs: Infinity;

        //Get items from collection using built-in functions
        const cursor: Partial<Document>[] = await this.client.db(db_name).collection(collection_name)
                                                                    .find(query_dict, query_options)
                                                                    .limit(max_docs)
                                                                    .project(projection)
                                                                    .toArray();

        //Aggregate results and return
        const documents: Document[] = [];
        cursor.forEach((element: Partial<Document>)=> {documents.push(new Document({text: JSON.stringify(element)}))});
        return documents;
    }
}

