import { Settings } from "@llamaindex/core/global";
import { Document } from "@llamaindex/core/schema";
import {
  FilterOperator,
  MetadataFilters,
  VectorStoreQueryMode,
} from "@llamaindex/core/vector-store";
import { OpenAIEmbedding } from "@llamaindex/openai";
import { createClient } from "@supabase/supabase-js";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { SupabaseVectorStore } from "../src";

async function isSupabaseAvailable(): Promise<boolean> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    return false;
  }
  return true;
}

describe("SupabaseVectorStore", async () => {
  if (!(await isSupabaseAvailable())) {
    describe.skip(
      "Supabase vector store test skipped ( Service not available )",
    );
    return;
  }
  beforeAll(async () => {
    Settings.embedModel = new OpenAIEmbedding({
      model: "text-embedding-3-small",
    });
  });
  it("should be able to create a vector store", async () => {
    const vectorStore = new SupabaseVectorStore({
      supabaseUrl: process.env.SUPABASE_URL!,
      supabaseKey: process.env.SUPABASE_KEY!,
      table: "test",
    });

    expect(vectorStore).toBeDefined();
    expect(vectorStore).toBeInstanceOf(SupabaseVectorStore);
  });

  it("should create instance if client provided", async () => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!,
    );
    const vectorStore = new SupabaseVectorStore({
      client: supabase,
      table: "test",
    });
    expect(vectorStore).toBeDefined();
    expect(vectorStore).toBeInstanceOf(SupabaseVectorStore);
  });

  describe("query", () => {
    let supabase: ReturnType<typeof createClient>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let rpcSpy: any;
    let vectorStore: SupabaseVectorStore;
    let mockEmbedding: number[];

    beforeEach(() => {
      supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_KEY!,
      );

      rpcSpy = vi.spyOn(supabase, "rpc").mockImplementation(() => {
        return {
          data: [],
          error: null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      });

      vectorStore = new SupabaseVectorStore({
        client: supabase,
        table: "test",
      });

      mockEmbedding = new Array(1536).fill(0.1);
    });

    afterEach(() => {
      rpcSpy.mockRestore();
    });

    it("should query without filters", async () => {
      const doc = new Document({
        text: "Test document",
      });
      doc.embedding = mockEmbedding;

      await vectorStore.query({
        queryEmbedding: doc.embedding!,
        similarityTopK: 5,
        mode: VectorStoreQueryMode.DEFAULT,
      });

      expect(rpcSpy).toHaveBeenCalledWith("match_documents", {
        query_embedding: doc.embedding,
        match_count: 5,
        filter: {},
      });
    });

    it("should pass filters to the match_documents RPC call", async () => {
      const doc = new Document({
        text: "Test document",
        metadata: { category: "test" },
      });
      doc.embedding = mockEmbedding;

      const filters: MetadataFilters = {
        filters: [
          {
            key: "category",
            value: "test",
            operator: FilterOperator.EQ,
          },
        ],
      };

      await vectorStore.query({
        queryEmbedding: doc.embedding!,
        similarityTopK: 5,
        filters,
        mode: VectorStoreQueryMode.DEFAULT,
      });

      expect(rpcSpy).toHaveBeenCalledWith("match_documents", {
        query_embedding: doc.embedding,
        match_count: 5,
        filter: { category: "test" },
      });
    });
  });
});
