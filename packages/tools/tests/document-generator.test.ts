import path from "path";
import { describe, expect, test, vi } from "vitest";
import { documentGenerator } from "../src/tools/document-generator";

// Mock the helper functions
vi.mock("../src/helper", () => ({
  saveDocument: vi.fn().mockResolvedValue(undefined),
  getFileUrl: vi.fn().mockReturnValue("http://example.com/test-doc.html"),
}));

describe("Document Generator Tool", () => {
  test("converts markdown to html document", async () => {
    const docGen = documentGenerator({
      outputDir: path.join(__dirname, "output"),
    });

    const result = await docGen.call({
      originalContent: "# Hello World\nThis is a test",
      fileName: "test-doc",
    });

    expect(result).toBe("URL: http://example.com/test-doc.html");
  });
});
