import { DocxReader } from "../../readers/DocxReader";

describe("DocxReader", () => {
  let docxReader: DocxReader;

  beforeEach(() => {
    docxReader = new DocxReader();
  });

  describe("loadData", () => {
    it("should load data from a docx file, return an array of documents and contain text", async () => {
      const filePath = "../../examples/data/stars.docx";
      const docs = await docxReader.loadData(filePath);
      const docContent = docs.map((doc) => doc.text).join("");

      expect(docs).toBeInstanceOf(Array);
      expect(docContent).toContain("Venturing into the zodiac");
    });
  });
});
