import { Tokenizers, tokenizers } from "@llamaindex/env";
import { describe, expect, test } from "vitest";
import { truncateMaxTokens } from "../../src/embeddings/tokenizer.js";

describe("truncateMaxTokens", () => {
  const tokenizer = tokenizers.tokenizer(Tokenizers.CL100K_BASE);

  test("should not truncate if less or equal to max tokens", () => {
    const text = "Hello".repeat(40);
    const t = truncateMaxTokens(Tokenizers.CL100K_BASE, text, 40);
    expect(t.length).toEqual(text.length);
  });

  test("should truncate if more than max tokens", () => {
    const text = "Hello".repeat(40);
    const t = truncateMaxTokens(Tokenizers.CL100K_BASE, text, 20);
    expect(tokenizer.encode(t).length).toBe(20);
  });

  test("should work with UTF8-boundaries", () => {
    // "爨" has two tokens in CL100K_BASE
    const text = "爨".repeat(40);
    // truncate at utf-8 boundary
    const t = truncateMaxTokens(Tokenizers.CL100K_BASE, text, 39);
    // has to remove one token to keep the boundary
    expect(tokenizer.encode(t).length).toBe(38);
    expect(t.includes("�")).toBe(false);
  });
});
