import { Document, MetadataMode } from "@llamaindex/core/schema";
import { MongoClient, type DriverInfo } from "mongodb";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";
import { MongoDocumentStore } from "../docStore/MongoDBDocumentStore";
import { setupTestDb } from "./setuptTestDb";

describe("MongoDocumentStore", () => {
  let cleanup: () => Promise<void>;
  let mongoClient: MongoClient;
  let documentStore: MongoDocumentStore;
  let mongoUri: string;
  let appendMetadataSpy: MockInstance<(driverInfo: DriverInfo) => void>;

  beforeAll(async () => {
    const testDb = await setupTestDb();
    cleanup = testDb.cleanup;
    mongoClient = testDb.mongoClient;
    appendMetadataSpy = vi.spyOn(mongoClient, "appendMetadata");
    mongoUri = testDb.mongoUri;
    documentStore = MongoDocumentStore.fromMongoClient(mongoClient);
  }, 120000);

  afterAll(async () => {
    await cleanup();
  });

  describe("constructor", () => {
    it("should create instance with mongoClient", () => {
      const store = MongoDocumentStore.fromMongoClient(mongoClient);
      expect(store).toBeInstanceOf(MongoDocumentStore);
      expect(appendMetadataSpy).toHaveBeenCalledWith({
        name: "LLAMAINDEX_MONGODB_DOC_STORE",
      });
    });

    it("should create instance with custom namespace", () => {
      const store = MongoDocumentStore.fromMongoClient(
        mongoClient,
        "custom",
        "namespace",
      );
      expect(store).toBeInstanceOf(MongoDocumentStore);
      expect(appendMetadataSpy).toHaveBeenCalledWith({
        name: "LLAMAINDEX_MONGODB_DOC_STORE",
      });
    });
  });

  describe("static constructors", () => {
    it("should create instance from connection string", () => {
      const store = MongoDocumentStore.fromConnectionString(mongoUri);
      expect(store).toBeInstanceOf(MongoDocumentStore);
    });

    it("should create instance from MongoClient", () => {
      const store = MongoDocumentStore.fromMongoClient(mongoClient);
      expect(store).toBeInstanceOf(MongoDocumentStore);
      expect(appendMetadataSpy).toHaveBeenCalledWith({
        name: "LLAMAINDEX_MONGODB_DOC_STORE",
      });
    });
  });

  describe("document operations", () => {
    beforeEach(async () => {
      await mongoClient.db("test").collection("test").deleteMany({});
    });

    it("should store and retrieve a document", async () => {
      const doc = new Document({ text: "test document", id_: "test_id" });
      await documentStore.addDocuments([doc]);
      const retrievedDoc = await documentStore.getDocument("test_id");
      const text = retrievedDoc?.getContent(MetadataMode.ALL);
      expect(text).toBe(doc.text);
    });

    it("should store and retrieve multiple documents", async () => {
      const docs = [
        new Document({ text: "doc1", id_: "id1" }),
        new Document({ text: "doc2", id_: "id2" }),
      ];
      await documentStore.addDocuments(docs);
      const retrievedDocs = await documentStore.getNodes(["id1", "id2"]);
      expect(retrievedDocs.map((d) => d?.getContent(MetadataMode.ALL))).toEqual(
        docs.map((d) => d.text),
      );
    });

    it("should handle missing documents", async () => {
      const doc = await documentStore.getDocument("non_existent_id", false);
      expect(doc).toBeUndefined();
    });
  });

  describe("document updates", () => {
    it("should update existing document when allowUpdate is true", async () => {
      const doc1 = new Document({ text: "original", id_: "test_id" });
      const doc2 = new Document({ text: "updated", id_: "test_id" });
      await documentStore.addDocuments([doc1]);
      await documentStore.addDocuments([doc2], true);

      const retrieved = await documentStore.getDocument("test_id");
      const text = retrieved?.getContent(MetadataMode.ALL);
      expect(text).toBe("updated");
    });

    it("should throw error when updating with allowUpdate false", async () => {
      const doc1 = new Document({ text: "original", id_: "test_id" });
      await documentStore.addDocuments([doc1]);

      const doc2 = new Document({ text: "updated", id_: "test_id" });
      await expect(documentStore.addDocuments([doc2], false)).rejects.toThrow(
        /doc_id.*already exists/,
      );
    });
  });

  describe("document deletion", () => {
    it("should delete a document", async () => {
      const doc = new Document({ text: "test document", id_: "test_id" });
      await documentStore.addDocuments([doc]);
      await documentStore.deleteDocument("test_id");
      const retrieved = await documentStore.getDocument("test_id", false);
      expect(retrieved).toBeUndefined();
    });

    it("should handle deleting non-existent document", async () => {
      await expect(
        documentStore.deleteDocument("non_existent_id"),
      ).resolves.not.toThrow();
    });
  });

  describe("document existence", () => {
    it("should check if document exists", async () => {
      const doc = new Document({ text: "test document", id_: "test_id" });
      await documentStore.addDocuments([doc]);
      const exists = await documentStore.documentExists("test_id");
      expect(exists).toBe(true);
    });

    it("should return false for non-existent document", async () => {
      const exists = await documentStore.documentExists("non_existent_id");
      expect(exists).toBe(false);
    });
  });

  describe("document hash", () => {
    it("should get document hash", async () => {
      const doc = new Document({ text: "test document", id_: "test_id" });
      await documentStore.addDocuments([doc]);
      const hash = await documentStore.getDocumentHash("test_id");
      expect(hash).toBe(doc.hash);
    });

    it("should return null for non-existent document hash", async () => {
      const hash = await documentStore.getDocumentHash("non_existent_id");
      expect(hash).toBeUndefined();
    });
  });
});
