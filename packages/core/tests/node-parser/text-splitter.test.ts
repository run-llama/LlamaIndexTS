import {
  SentenceSplitter,
  splitBySentenceTokenizer,
} from "@llamaindex/core/node-parser";
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
});
