import { Document } from "../Document";

describe("Document", () => {
  test("initializes", () => {
    const doc = new Document("text", "docId");
    expect(doc).toBeDefined();
  });
});
