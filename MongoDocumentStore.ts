import { MongoClient } from 'mongodb';
import { KVDocumentStore } from './KVDocumentStore';
import { Document } from './types';
import { handleMongoError } from './utils';

export class MongoDocumentStore extends KVDocumentStore {
  private client: MongoClient;
  private dbName: string;

  constructor(connectionString: string, dbName: string) {
    super();
    this.client = new MongoClient(connectionString);
    this.dbName = dbName;
  }

  async get(key: string): Promise<Document | null> {
    try {
      const db = this.client.db(this.dbName);
      return await db.collection('documents').findOne({ key });
    } catch (error) {
      handleMongoError(error);
    }
  }

  async set(key: string, value: Document): Promise<void> {
    try {
      const db = this.client.db(this.dbName);
      await db.collection('documents').updateOne({ key }, { $set: { value } }, { upsert: true });
    } catch (error) {
      handleMongoError(error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const db = this.client.db(this.dbName);
      await db.collection('documents').deleteOne({ key });
    } catch (error) {
      handleMongoError(error);
    }
  }

  async keys(): Promise<string[]> {
    try {
      const db = this.client.db(this.dbName);
      const documents = await db.collection('documents').find({}, { projection: { key: 1 } }).toArray();
      return documents.map(document => document.key);
    } catch (error) {
      handleMongoError(error);
    }
  }
}
