import { Document } from './types';

export interface MongoDocumentStore {
  constructor(connectionString: string, dbName: string): void;
  get(key: string): Promise<Document | null>;
  set(key: string, value: Document): Promise<void>;
  delete(key: string): Promise<void>;
  keys(): Promise<string[]>;
}
