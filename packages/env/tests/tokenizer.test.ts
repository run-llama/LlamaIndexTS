import { describe, expect, it } from "vitest";
import { tokenizers } from "../src/tokenizers/node.js";

describe("tokenizer", () => {
  it("should tokenize text", () => {
    const tokenizer = tokenizers.tokenizer();
    expect(tokenizer.decode(tokenizer.encode("hello world"))).toBe(
      "hello world",
    );
  });
});
