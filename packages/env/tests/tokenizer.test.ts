import { tokenizers } from "@llamaindex/env";
import { describe, expect, it } from "vitest";

describe("tokenizer", () => {
  it("should tokenize text", () => {
    const tokenizer = tokenizers.tokenizer();
    expect(tokenizer.decode(tokenizer.encode("hello world"))).toBe(
      "hello world",
    );
  });
});
