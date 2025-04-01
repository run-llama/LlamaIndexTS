/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, FileReader } from "@llamaindex/core/schema";
import { fs, path } from "@llamaindex/env";
import { TextDecoder, TextEncoder } from "util";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Mock implementation of FileReader for testing
class TestFileReader extends FileReader<Document> {
  async loadDataAsContent(
    fileContent: Uint8Array,
    filename?: string,
  ): Promise<Document[]> {
    const text = new TextDecoder().decode(fileContent);
    return [new Document({ text, metadata: { filename } })];
  }
}

describe("FileReader", () => {
  let reader: TestFileReader;
  let mockFetch: any;
  let mockFsReadFile: any;

  beforeEach(() => {
    reader = new TestFileReader();

    // Mock fetch for URL tests
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Mock fs.readFile for local file tests
    mockFsReadFile = vi.spyOn(fs, "readFile");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("loadData should load content from a local file", async () => {
    const testFilePath = "/path/to/test.txt";
    const testContent = "Test file content";
    const testContentBuffer = new TextEncoder().encode(testContent);

    mockFsReadFile.mockResolvedValue(testContentBuffer);

    const result = await reader.loadData(testFilePath);

    expect(mockFsReadFile).toHaveBeenCalledWith(testFilePath);
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Document);
    expect(result[0]?.getText()).toBe(testContent);
    expect(result[0]?.metadata.file_path).toBe(path.resolve(testFilePath));
    expect(result[0]?.metadata.file_name).toBe("test.txt");
  });

  test("loadData should load content from a URL", async () => {
    const testUrl = "https://example.com/test.txt";
    const testContent = "Test URL content";
    const testContentBuffer = new TextEncoder().encode(testContent);

    // Mock fetch response
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(testContentBuffer.buffer),
    });

    const result = await reader.loadData(testUrl);

    expect(mockFetch).toHaveBeenCalledWith(testUrl);
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Document);
    expect(result[0]?.getText()).toBe(testContent);
    expect(result[0]?.metadata.file_path).toBe(path.resolve(testUrl));
    expect(result[0]?.metadata.file_name).toBe("test.txt");
  });

  test("loadData should throw an error for failed URL fetch", async () => {
    const testUrl = "https://example.com/not-found.txt";

    // Mock failed fetch response
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(reader.loadData(testUrl)).rejects.toThrow(
      `Failed to fetch URL: ${testUrl}, status: 404`,
    );

    expect(mockFetch).toHaveBeenCalledWith(testUrl);
  });
});
