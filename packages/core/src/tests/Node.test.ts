import { TextNode } from "../Node";

describe("TextNode", () => {
  let node: TextNode;

  beforeEach(() => {
    node = new TextNode({ text: "Hello World" });
  });

  test("should generate a hash", () => {
    expect(node.hash).toBe("nTSKdUTYqR52MPv/brvb4RTGeqedTEqG9QN8KSAj2Do=");
  });

  test("clone should have the same hash", () => {
    const hash = node.hash;
    const clone = node.clone();
    expect(clone.hash).toBe(hash);
  });
});
