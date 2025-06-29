import { QueryBundle } from "@llamaindex/core/query-engine";
import { BaseNode, MetadataMode, TextNode } from "@llamaindex/core/schema";
import {
  BaseDocumentStore,
  RefDocInfo,
  Serializer,
} from "@llamaindex/core/storage/doc-store";
import BM25 from "okapibm25";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { Bm25Retriever } from "../src/Bm25Retriever";

// Mock okapibm25
vi.mock("okapibm25", () => {
  return {
    default: vi.fn((documents, queryTerms) => {
      // Simple mock implementation that gives higher scores to documents containing query terms
      return documents.map((doc) => {
        const docTerms = doc.toLowerCase().split(/\s+/);
        const matchCount = queryTerms.filter((term) =>
          docTerms.includes(term),
        ).length;
        return matchCount / queryTerms.length;
      });
    }),
  };
});

// Mock document store
class MockDocumentStore implements BaseDocumentStore {
  private documents: Record<string, BaseNode>;

  constructor(documents: Record<string, BaseNode> = {}) {
    this.documents = documents;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serializer: Serializer<any>;
  persist(persistPath?: string): void {
    throw new Error("Method not implemented.");
  }
  documentExists(docId: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  setDocumentHash(docId: string, docHash: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getDocumentHash(docId: string): Promise<string | undefined> {
    throw new Error("Method not implemented.");
  }
  getAllDocumentHashes(): Promise<Record<string, string>> {
    throw new Error("Method not implemented.");
  }
  getAllRefDocInfo(): Promise<Record<string, RefDocInfo> | undefined> {
    throw new Error("Method not implemented.");
  }
  getRefDocInfo(refDocId: string): Promise<RefDocInfo | undefined> {
    throw new Error("Method not implemented.");
  }
  deleteRefDoc(refDocId: string, raiseError: boolean): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getNodes(nodeIds: string[], raiseError?: boolean): Promise<BaseNode[]> {
    throw new Error("Method not implemented.");
  }
  getNode(nodeId: string, raiseError?: boolean): Promise<BaseNode> {
    throw new Error("Method not implemented.");
  }
  getNodeDict(nodeIdDict: {
    [index: number]: string;
  }): Promise<Record<number, BaseNode>> {
    throw new Error("Method not implemented.");
  }
  deleteDocument(docId: string, raiseError = true): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async getDocument(docId: string, raiseError = true): Promise<BaseNode> {
    const doc = this.documents[docId];
    if (!doc && raiseError) {
      throw new Error(`Document with ID ${docId} not found`);
    }
    return doc;
  }

  async addDocuments(docs: BaseNode[], allowUpdate = true): Promise<void> {
    for (const doc of docs) {
      this.documents[doc.id_] = doc;
    }
  }

  async docs(): Promise<Record<string, BaseNode>> {
    return { ...this.documents };
  }
}

describe("Bm25Retriever", () => {
  let mockDocStore: MockDocumentStore;
  let nodes: BaseNode[];

  beforeEach(() => {
    nodes = [
      new TextNode({ text: "The quick brown fox jumps over the lazy dog" }),
      new TextNode({ text: "A quick brown dog outpaces the swift fox" }),
      new TextNode({ text: "Lazy cats sleep all day long" }),
      new TextNode({ text: "Brown foxes are known for their intelligence" }),
      new TextNode({ text: "Dogs are man's best friend" }),
    ];

    mockDocStore = new MockDocumentStore();
    mockDocStore.addDocuments(nodes);
  });

  test("should initialize with default values", () => {
    const retriever = new Bm25Retriever({ docStore: mockDocStore });
    expect(retriever).toBeInstanceOf(Bm25Retriever);
  });

  test("should initialize with custom values", () => {
    const retriever = new Bm25Retriever({
      docStore: mockDocStore,
      topK: 5,
      docIds: ["node1", "node2"],
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((retriever as any).topK).toBe(5);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((retriever as any).docIds).toEqual(["node1", "node2"]);
  });

  test("should retrieve documents with BM25 ranking", async () => {
    const retriever = new Bm25Retriever({ docStore: mockDocStore });

    const query: QueryBundle = { query: "quick fox" };
    const results = await retriever._retrieve(query);

    expect(BM25).toHaveBeenCalled();
    expect(results.length).toBeGreaterThan(0);
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].score).toBeDefined();
      expect(results[i].score).toBeGreaterThanOrEqual(
        results[i + 1].score || 0,
      );
    }
    const topResult = results[0];
    expect(
      topResult.node.getContent(MetadataMode.NONE).toLowerCase(),
    ).toContain("quick");
    expect(
      topResult.node.getContent(MetadataMode.NONE).toLowerCase(),
    ).toContain("fox");
  });

  test("should respect topK parameter", async () => {
    const topK = 2;
    const retriever = new Bm25Retriever({
      docStore: mockDocStore,
      topK,
    });

    const query: QueryBundle = { query: "brown" };
    const results = await retriever._retrieve(query);

    expect(results.length).toBe(topK);
  });

  test("should filter by docIds if provided", async () => {
    const docIds = [nodes[0].id_, nodes[1].id_];
    const retriever = new Bm25Retriever({
      docStore: mockDocStore,
      docIds,
    });

    const query: QueryBundle = { query: "lazy" };
    const results = await retriever._retrieve(query);
    const returnedIds = results.map((result) => result.node.id_);

    expect(returnedIds.every((id) => docIds.includes(id))).toBe(true);
    expect(returnedIds).toContain(nodes[0].id_);
    expect(returnedIds).toContain(nodes[1].id_);
  });

  test("should handle empty query", async () => {
    const retriever = new Bm25Retriever({ docStore: mockDocStore });

    const query: QueryBundle = { query: "" };
    const results = await retriever._retrieve(query);

    expect(results.length).toBeGreaterThan(0);
  });

  test("should handle non-existent docIds", async () => {
    const docIds = [nodes[0].id_, "nonexistent"];
    const retriever = new Bm25Retriever({
      docStore: mockDocStore,
      docIds,
    });

    const query: QueryBundle = { query: "fox" };
    const results = await retriever._retrieve(query);
    const returnedIds = results.map((result) => result.node.id_);

    expect(returnedIds).toContain(nodes[0].id_);
    expect(returnedIds).not.toContain("nonexistent");
  });
});
