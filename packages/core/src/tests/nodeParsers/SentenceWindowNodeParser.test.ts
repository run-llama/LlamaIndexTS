import { Document, MetadataMode } from "../../Node";
import {
  DEFAULT_WINDOW_METADATA_KEY,
  SentenceWindowNodeParser,
} from "../../nodeParsers";

describe("Tests for the SentenceWindowNodeParser class", () => {
  test("testing the constructor", () => {
    const sentenceWindowNodeParser = new SentenceWindowNodeParser();
    expect(sentenceWindowNodeParser).toBeDefined();
  });
  test("testing the getNodesFromDocuments method", () => {
    const sentenceWindowNodeParser = SentenceWindowNodeParser.fromDefaults({
      windowSize: 1,
    });
    const doc = new Document({ text: "Hello. Cat Mouse. Dog." });
    const resultingNodes = sentenceWindowNodeParser.getNodesFromDocuments([
      doc,
    ]);
    expect(resultingNodes.length).toEqual(3);
    expect(resultingNodes.map((n) => n.getContent(MetadataMode.NONE))).toEqual([
      "Hello.",
      "Cat Mouse.",
      "Dog.",
    ]);
    expect(
      resultingNodes.map((n) => n.metadata[DEFAULT_WINDOW_METADATA_KEY]),
    ).toEqual([
      "Hello. Cat Mouse.",
      "Hello. Cat Mouse. Dog.",
      "Cat Mouse. Dog.",
    ]);
  });
});
