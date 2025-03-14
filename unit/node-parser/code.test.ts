import { CodeSplitter } from "@llamaindex/node-parser/code";
import Parser from "tree-sitter";
import JS from "tree-sitter-javascript";
import TS from "tree-sitter-typescript";
import { describe, expect, test } from "vitest";

describe("CodeSplitter", () => {
  test("basic split js", async () => {
    const parser = new Parser();
    parser.setLanguage(JS as Parser.Language);
    const codeSplitter = new CodeSplitter({
      maxChars: "const a = 1;".length,
      getParser: () => parser,
    });
    const result = codeSplitter.splitText(
      "const a = 1; const b = 2; const c = 3; const d = 4;",
    );
    expect(result).toEqual([
      "const a = 1;",
      "const b = 2;",
      "const c = 3;",
      "const d = 4;",
    ]);
  });
  test("basic split ts", async () => {
    const parser = new Parser();
    parser.setLanguage(TS.typescript as Parser.Language);
    const codeSplitter = new CodeSplitter({
      maxChars: "const a: number = 1;".length,
      getParser: () => parser,
    });
    const result = codeSplitter.splitText(
      "const a: number = 1; const b = 2; const c: number = 3; const d = 4;",
    );
    expect(result).toEqual([
      "const a: number = 1;",
      "const b = 2;",
      "const c: number = 3;",
      "const d = 4;",
    ]);
  });
});
