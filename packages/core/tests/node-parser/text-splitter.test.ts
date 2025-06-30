import {
  SentenceSplitter,
  splitBySentenceTokenizer,
} from "@llamaindex/core/node-parser";
import { Document } from "@llamaindex/core/schema";
import { Tokenizers, tokenizers } from "@llamaindex/env/tokenizers";
import { describe, expect, test } from "vitest";

describe("sentence splitter", () => {
  test("initializes", () => {
    const sentenceSplitter = new SentenceSplitter();
    expect(sentenceSplitter).toBeDefined();
  });

  test("chunk size should less than chunk", async () => {});

  test("splits paragraphs w/o effective chunk size", () => {
    const sentenceSplitter = new SentenceSplitter({
      chunkSize: 9,
      chunkOverlap: 0,
    });
    // generate the same line as above but correct syntax errors
    const splits = sentenceSplitter.splitText(
      "This is a paragraph.\n\n\nThis is another paragraph.",
    );
    expect(splits).toEqual([
      "This is a paragraph.",
      "This is another paragraph.",
    ]);
  });

  test("splits paragraphs with effective chunk size", () => {
    const sentenceSplitter = new SentenceSplitter({
      paragraphSeparator: "\n",
    });
    // generate the same line as above but correct syntax errors
    const splits = sentenceSplitter.splitText(
      "This is a paragraph.\nThis is another paragraph.",
    );
    expect(splits).toEqual([
      "This is a paragraph.\nThis is another paragraph.",
    ]);
  });

  test("splits sentences", () => {
    const sentenceSplitter = new SentenceSplitter({
      chunkSize: 9,
      chunkOverlap: 0,
    });
    const splits = sentenceSplitter.splitText(
      "This is a sentence. This is another sentence.",
    );
    expect(splits).toEqual([
      "This is a sentence.",
      "This is another sentence.",
    ]);
  });

  test("overall split text", () => {
    let sentenceSplitter = new SentenceSplitter({
      chunkSize: 5,
      chunkOverlap: 0,
    });
    let splits = sentenceSplitter.splitText(
      "This is a sentence. This is another sentence.",
    );
    expect(splits).toEqual([
      "This is a sentence.",
      "This is another sentence.",
    ]);

    sentenceSplitter = new SentenceSplitter({ chunkSize: 1000 });
    splits = sentenceSplitter.splitText(
      "This is a sentence. This is another sentence.",
    );
    expect(splits).toEqual(["This is a sentence. This is another sentence."]);
  });

  test("keep the space, if there's no split", () => {
    const text = "The short sentence. The long long long long sentence.";
    const sentenceSplitter = new SentenceSplitter({
      chunkSize: 1024,
      chunkOverlap: 0,
    });
    const splits = sentenceSplitter.splitText(text);
    expect(splits).toEqual([text]);
  });

  test("split at tokenizer limit", () => {
    const tokenizer = tokenizers.tokenizer(Tokenizers.CL100K_BASE);
    const text = "The short sentence. The long long long long sentence.";
    const sentenceSplitter = new SentenceSplitter({
      tokenizer,
      chunkSize: tokenizer.encode(text).length,
      chunkOverlap: 0,
    });
    const splits = sentenceSplitter.splitText(text + " " + text);
    expect(splits).toEqual([text, text]);
  });

  test("doesn't split decimals", () => {
    const sentenceSplitter = new SentenceSplitter({
      chunkSize: 5,
      chunkOverlap: 0,
    });
    const splits = sentenceSplitter.splitText(
      "This is a sentence. This is another sentence. 1.0",
    );

    expect(splits).toEqual([
      "This is a sentence.",
      "This is another sentence.",
      "1.0",
    ]);
  });

  test("doesn't split basic abbreviations", () => {
    const sentenceSplitter = new SentenceSplitter({
      chunkSize: 15,
      chunkOverlap: 0,
    });
    const splits = sentenceSplitter.splitText(
      "This is a sentence of Broda Noel. This is the sentence of Sr. Broda Noel. This is a sentence of somebody else",
    );

    expect(splits).toEqual([
      "This is a sentence of Broda Noel.",
      "This is the sentence of Sr. Broda Noel.",
      "This is a sentence of somebody else",
    ]);
  });

  test("doesn't split extra abbreviations", () => {
    const sentenceSplitter = new SentenceSplitter({
      chunkSize: 10,
      chunkOverlap: 0,
      extraAbbreviations: ["S.A."],
    });
    const splits = sentenceSplitter.splitText(
      "This is a sentence. The S.A. Broda Company. This is another sentence",
    );

    expect(splits).toEqual([
      "This is a sentence.",
      "The S.A. Broda Company.",
      "This is another sentence",
    ]);
  });

  test("splits cjk", () => {
    const sentenceSplitter = new SentenceSplitter({
      chunkSize: 30,
      chunkOverlap: 0,
      secondaryChunkingRegex:
        '.*?([﹒﹔﹖﹗．；。！？]["’”」』]{0,2}|：(?=["‘“「『]{1,2}|$))',
    });

    const splits = sentenceSplitter.splitText(
      "此后如竟没有炬火：我便是唯一的光。倘若有了炬火，出了太阳，我们自然心悦诚服的消失。不但毫无不平，而且还要随喜赞美这炬火或太阳；因为他照了人类，连我都在内。",
    );
    expect(splits).toEqual([
      "此后如竟没有炬火：我便是唯一的光。",
      "倘若有了炬火，出了太阳，我们自然心悦诚服的消失。",
      "不但毫无不平，而且还要随喜赞美这炬火或太阳；",
      "因为他照了人类，连我都在内。",
    ]);
  });

  test("issue 1087 - edge case when input with brackets", () => {
    const text =
      "A card must be of uniform thickness and made of unfolded and uncreased paper or cardstock of approximately the quality and weight of a stamped card (i.e., a card available from USPS).";
    const split = splitBySentenceTokenizer();
    expect(split(text)).toEqual([text]);
  });

  test("split nodes with UUID IDs and correct relationships", () => {
    const UUID_REGEX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const sentenceSplitter = new SentenceSplitter();
    const docId = "test-doc-id";
    const doc = new Document({
      id_: docId,
      text: "This is a test sentence. This is another test sentence.",
    });

    const nodes = sentenceSplitter.getNodesFromDocuments([doc]);
    nodes.forEach((node) => {
      // test node id should match uuid regex
      expect(node.id_).toMatch(UUID_REGEX);

      // test source reference to the doc ID
      const source = node.relationships?.SOURCE;
      expect(source).toBeDefined();
      expect(source).toHaveProperty("nodeId");
      expect((source as { nodeId: string }).nodeId).toEqual(docId);
    });
  });
});
