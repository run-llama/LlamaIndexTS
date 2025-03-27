import { Settings } from "@llamaindex/core/global";
import { OpenAIEmbedding } from "@llamaindex/openai";
import { createClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";
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
});
