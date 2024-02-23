import { Document } from "../Node";

describe("Document", () => {
  test("initializes", () => {
    const doc = new Document({ text: "text", id_: "docId" });
    expect(doc).toBeDefined();
  });
});
