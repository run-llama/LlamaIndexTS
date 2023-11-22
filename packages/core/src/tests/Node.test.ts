import { TextNode } from "../Node";

describe("TextNode", () => {
  let node: TextNode;

  beforeEach(() => {
    node = new TextNode({ text: "Hello World" });
  });

  describe("generateHash", () => {
    it("should generate a hash", () => {
      expect(node.hash).toBe("nTSKdUTYqR52MPv/brvb4RTGeqedTEqG9QN8KSAj2Do=");
    });
  });
});
