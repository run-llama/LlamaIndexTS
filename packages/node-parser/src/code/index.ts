import { Settings } from "@llamaindex/core/global";
import { TextSplitter } from "@llamaindex/core/node-parser";
import type NodeParser from "tree-sitter";
import type { SyntaxNode as NodeSyntaxNode } from "tree-sitter";
import type WebParser from "web-tree-sitter";
import type { SyntaxNode as WebSyntaxNode } from "web-tree-sitter";

type SyntaxNode = NodeSyntaxNode | WebSyntaxNode;
type Parser = NodeParser | WebParser;

export type CodeSplitterParam = {
  getParser: () => Parser;
  maxChars?: number;
};

export const DEFAULT_MAX_CHARS = 1500;

export class CodeSplitter extends TextSplitter {
  maxChars: number = DEFAULT_MAX_CHARS;

  #parser: Parser;

  constructor(params: CodeSplitterParam) {
    super();
    this.#parser = params.getParser();
    if (params.maxChars) {
      this.maxChars = params.maxChars;
    }
  }

  #chunkNode(node: SyntaxNode, text: string, lastEnd: number = 0): string[] {
    let newChunks: string[] = [];
    let currentChunk: string = "";

    for (const child of node.children) {
      if (child.endIndex - child.startIndex > this.maxChars) {
        // Child is too big, recursively chunk the child
        if (currentChunk.length > 0) {
          newChunks.push(currentChunk.trim());
          currentChunk = "";
        }
        newChunks = newChunks.concat(this.#chunkNode(child, text, lastEnd));
      } else if (
        currentChunk.length + (child.endIndex - child.startIndex) >
        this.maxChars
      ) {
        // Child would make the current chunk too big, so start a new chunk
        newChunks.push(currentChunk.trim());
        currentChunk = text.slice(lastEnd, child.endIndex);
      } else {
        currentChunk += text.slice(lastEnd, child.endIndex);
      }
      lastEnd = child.endIndex;
    }

    if (currentChunk.length > 0) {
      newChunks.push(currentChunk.trim());
    }

    return newChunks;
  }

  splitText(text: string): string[] {
    const callbackManager = Settings.callbackManager;
    callbackManager.dispatchEvent("chunking-start", { text: [text] });
    const tree = this.#parser.parse(text);
    const rootNode = tree.rootNode;
    if (
      rootNode.children.length === 0 ||
      rootNode.children[0]?.type === "ERROR"
    ) {
      throw new Error("Could not parse code with language");
    } else {
      const chunks = this.#chunkNode(rootNode, text);
      callbackManager.dispatchEvent("chunking-end", { chunks });
      return chunks;
    }
  }
}
