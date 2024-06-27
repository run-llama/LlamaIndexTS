import { PDFReader } from "llamaindex";
import { describe, expect, test } from "vitest";

describe("pdf reader", () => {
  const reader = new PDFReader();
  test("basic.pdf", async () => {
    const documents = await reader.loadData("../../../examples/data/basic.pdf");
    expect(documents.length).toBe(1);
    expect(documents[0].metadata).toMatchObject({
      file_path: expect.any(String),
      file_name: "basic.pdf",
      page_number: 1,
      total_pages: 1,
    });
    await expect(documents[0].text).toMatchFileSnapshot(
      "./.snap/basic.pdf.snap",
    );
  });
  test("brk-2022.pdf", async () => {
    const documents = await reader.loadData(
      "../../../examples/data/brk-2022.pdf",
    );
    expect(documents.length).toBe(140);
  });
  test("manga.pdf", async () => {
    const documents = await reader.loadData("../../../examples/data/manga.pdf");
    expect(documents.length).toBe(4);
  });
});
