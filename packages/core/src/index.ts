import { z } from "zod";
import type { refDocInfoSchema } from "./schema";

export type RefDocInfo = z.infer<typeof refDocInfoSchema>;

interface Doc {}
interface Retriever {}
interface QueryEngine {}

export interface ReadableDocStore {
  asRetriever(): Retriever;
  asQueryEngine(): QueryEngine;
}

export interface WritableDocStore extends ReadableDocStore {
  addDocuments(docs: Doc[], allowUpdate: boolean): Promise<void>;

  getDocument(docId: string): Promise<Doc | null>;

  deleteDocument(docId: string): Promise<void>;

  documentExists(docId: string): Promise<boolean>;
}
