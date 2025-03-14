import { describe, expect, it } from "vitest";
import { tokenizers as fallbackTokenizers } from "../src/internal/tokenizers/js.js";
import { tokenizers as nodeTokenizers } from "../src/internal/tokenizers/node.js";

describe("node tokenizer", () => {
  it("should tokenize text", () => {
    const tokenizer = nodeTokenizers.tokenizer();
    expect(tokenizer.decode(tokenizer.encode("hello world"))).toBe(
      "hello world",
    );
  });

  it("should have same result as fallback tokenizer", () => {
    const nodeTokenizer = nodeTokenizers.tokenizer();
    const fallbackTokenizer = fallbackTokenizers.tokenizer();
    const text = "hello world";
    expect(nodeTokenizer.decode(nodeTokenizer.encode(text))).toBe(
      fallbackTokenizer.decode(fallbackTokenizer.encode(text)),
    );
  });
});
