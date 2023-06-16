import { Document } from "../Document";

describe("Document", () => {
  test("initializes", () => {
    const doc = new Document("docId", "text");
    expect(doc).toBeDefined();
  });
});
