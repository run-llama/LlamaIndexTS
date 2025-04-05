import { Client } from "pg";
import { describe, expect, it, vi } from "vitest";
import { SimplePostgresReader } from "../src/SimplePostgresReader";

vi.mock("pg", () => {
  return {
    Client: vi.fn().mockImplementation(() => ({
      connect: vi.fn(),
      query: vi.fn().mockResolvedValue({
        rows: [
          {
            title: "Test Document",
            content: "This is a test document content.",
            author: "Test Author",
            created_at: new Date("2024-01-01"),
          },
        ],
      }),
      end: vi.fn(),
      on: vi.fn(),
    })),
  };
});

describe("SimplePostgresReader", () => {
  it("should read documents with fields and metadata", async () => {
    const client = new Client();
    const reader = new SimplePostgresReader({ client });

    const documents = await reader.loadData({
      query: "SELECT * FROM test_documents",
      fields: ["title", "content"],
      fieldSeparator: "\n",
      metadataFields: ["author", "created_at"],
    });

    expect(documents).toHaveLength(1);
    expect(documents[0].text).toBe(
      "Test Document\nThis is a test document content.",
    );
    expect(documents[0].metadata).toEqual({
      author: "Test Author",
      created_at: new Date("2024-01-01"),
    });
  });

  it("should read the column as specified in fields", async () => {
    const client = new Client();
    const reader = new SimplePostgresReader({ client });

    const documents = await reader.loadData({
      query: "SELECT content FROM test_documents",
      fields: ["content"],
    });

    expect(documents).toHaveLength(1);
    expect(documents[0].text).toBe("This is a test document content.");
  });

  it("should default to first column when no fields specified", async () => {
    const client = new Client();
    const reader = new SimplePostgresReader({ client });

    const documents = await reader.loadData({
      query: "SELECT content FROM test_documents",
    });

    expect(documents).toHaveLength(1);
    expect(documents[0].text).toBe("Test Document");
  });
});
