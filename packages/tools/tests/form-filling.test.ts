import fs from "fs";
import path from "path";
import { describe, expect, test, vi } from "vitest";
import { fillMissingCells } from "../src/tools/form-filling";

vi.mock("fs", () => ({
  default: {
    readFile: vi.fn(),
    promises: {
      readFile: vi.fn(),
    },
  },
}));

vi.mock("../src/helper", () => ({
  saveDocument: vi.fn(),
  getFileUrl: vi.fn().mockReturnValue("http://example.com/filled.csv"),
}));

describe("Form Filling Tools", () => {
  test("fillMissingCells fills cells with provided answers", async () => {
    // Mock CSV content
    const mockCsvContent = "Name,Age,City\nJohn,,Paris\nMary,,";
    vi.mocked(fs.promises.readFile).mockResolvedValue(mockCsvContent);

    const filler = fillMissingCells({
      outputDir: path.join(__dirname, "output"),
    });

    const result = await filler.call({
      filePath: "test.csv",
      cells: [
        {
          rowIndex: 1,
          columnIndex: 1,
          answer: "25",
        },
      ],
    });

    expect(result).toContain("Successfully filled missing cells");
    expect(result).toContain("http://example.com/filled.csv");
  });
});
