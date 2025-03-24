import type { Client } from "@elastic/elasticsearch";
import { Settings } from "@llamaindex/core/global";
import {
  Document,
  NodeRelationship,
  ObjectType,
} from "@llamaindex/core/schema";
import { VectorStoreQueryMode } from "@llamaindex/core/vector-store";
import { OpenAIEmbedding } from "@llamaindex/openai";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ElasticSearchVectorStore } from "../src";
import { getElasticSearchClient } from "../src/utils";

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL;
const ELASTICSEARCH_CLOUD_ID = process.env.ELASTICSEARCH_CLOUD_ID;
const ELASTICSEARCH_API_KEY = process.env.ELASTICSEARCH_API_KEY;
const ELASTICSEARCH_USERNAME = process.env.ELASTICSEARCH_USERNAME;
const ELASTICSEARCH_PASSWORD = process.env.ELASTICSEARCH_PASSWORD;

async function isElasticSearchAvailable(): Promise<boolean> {
  let elasticSearchClient: Client | undefined;

  try {
    elasticSearchClient = getElasticSearchClient({
      esCloudId: ELASTICSEARCH_CLOUD_ID,
      esApiKey: ELASTICSEARCH_API_KEY,
      esUsername: ELASTICSEARCH_USERNAME,
      esPassword: ELASTICSEARCH_PASSWORD,
    });

    await elasticSearchClient.info();
    return true;
  } catch (error) {
    return false;
  } finally {
    if (elasticSearchClient) {
      await elasticSearchClient.close();
    }
  }
}

describe("ElasticSearchVectorStore", async () => {
  if (!(await isElasticSearchAvailable())) {
    describe.skip(
      "Elastic search vector store test skipped ( Service not available )",
    );
    return;
  }

  let vectorStore: ElasticSearchVectorStore;
  let esClient: Client;

  beforeAll(async () => {
    Settings.embedModel = new OpenAIEmbedding({
      model: "text-embedding-3-small",
    });

    esClient = getElasticSearchClient({
      esCloudId: ELASTICSEARCH_CLOUD_ID,
      esApiKey: ELASTICSEARCH_API_KEY,
      esUsername: ELASTICSEARCH_USERNAME,
      esPassword: ELASTICSEARCH_PASSWORD,
    });

    vectorStore = new ElasticSearchVectorStore({
      esClient,
      indexName: "llama-index-test",
    });
  });

  afterAll(async () => {
    // await esClient.indices.delete({ index: "llama-index-test" });
    await esClient.close();
  });

  describe("initialization", () => {
    it("should initialize with esClient", () => {
      const vectorStore = new ElasticSearchVectorStore({
        esClient,
        indexName: "llama-index-test",
      });

      expect(vectorStore).toBeDefined();
      expect(vectorStore).toBeInstanceOf(ElasticSearchVectorStore);
    });

    it("should initialize with esUrl", () => {
      const vectorStore = new ElasticSearchVectorStore({
        esUrl: ELASTICSEARCH_URL!,
        indexName: "llama-index-test",
      });

      expect(vectorStore).toBeDefined();
      expect(vectorStore).toBeInstanceOf(ElasticSearchVectorStore);
    });

    it("should initialize with esCloudId", () => {
      const vectorStore = new ElasticSearchVectorStore({
        esCloudId: ELASTICSEARCH_CLOUD_ID!,
        indexName: "llama-index-test",
      });

      expect(vectorStore).toBeDefined();
      expect(vectorStore).toBeInstanceOf(ElasticSearchVectorStore);
    });
  });

  describe("elastic search operations", () => {
    it("should add document to vector store", async () => {
      const nodes = [
        new Document({ text: "doc1", id_: "id1", embedding: [0.1, 0.2, 0.3] }),
        new Document({ text: "doc2", id_: "id2", embedding: [0.4, 0.5, 0.6] }),
      ];

      const ids = await vectorStore.add(nodes);

      expect(ids).toEqual(["id1", "id2"]);

      const result = await vectorStore.query({
        mode: VectorStoreQueryMode.DEFAULT,
        similarityTopK: 1,
        queryEmbedding: [0.1, 0.2, 0.3],
      });

      expect(result.nodes).toEqual([nodes[0]]);
      expect(result.ids).toEqual(["id1"]);
      expect(result.similarities).toEqual([1]);
    });

    it("should  delete nodes, async ", async () => {
      const nodes = [
        new Document({
          text: "doc1",
          id_: "id1",
          embedding: [0.1, 0.2, 0.3],
        }),
        new Document({
          text: "doc2",
          id_: "id2",
          embedding: [0.4, 0.5, 0.6],
          relationships: {
            [NodeRelationship.SOURCE]: {
              nodeId: "id1",
              nodeType: ObjectType.DOCUMENT,
              metadata: { ref_doc_id: "id1" },
            },
          },
        }),
      ];

      await vectorStore.add(nodes);

      await vectorStore.delete(nodes[0]?.id_ ?? "");

      const result = await vectorStore.query({
        mode: VectorStoreQueryMode.DEFAULT,
        similarityTopK: 1,
        queryEmbedding: [0.4, 0.5, 0.6],
      });

      expect(result.nodes).toEqual([nodes[0]]);
      expect(result.ids).toEqual(["id1"]);
    });
  });
});
