import {
  SentenceSplitter,
  splitBySentenceTokenizer,
} from "@llamaindex/core/node-parser";
import { describe, expect, test } from "vitest";

describe("SentenceSplitter", () => {
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

  test("split long text using tokenizer", () => {
    const text =
      "file_name: 101.pdf\nfile_path: /Users/marcus/1/test-filters/data/101.pdf\npage_number: 5\nprivate: false\ntotal_pages: 8\n\nDomestic Mail Manual • Updated 7-9-23\n101101.6.2.9\nRetail Mail: Physical Standards for Letters, Cards, Flats, and Parcels\n6.2.3 Other Cards\nA card that does not meet the applicable standards in 6.2 must not bear the\nwords “Postcard” or “Double Postcard.”\n6.2.4 Paper or Card Stock\nA card must be of uniform thickness and made of unfolded and uncreased paper\nor cardstock of approximately the quality and weight of a stamped card (i.e., a\ncard available from USPS). A card must be formed either of one piece of paper or\ncardstock or of two pieces of paper permanently and uniformly bonded together.\nThe stock used for a card may be of any color or surface that permits the legible\nprinting of the address, postmark, and any required markings.\n6.2.5 Acceptable Attachments\nA card may bear an attachment that is the following:\na. A paper label, such as a wafer seal or decal affixed with permanent adhesive\nto the back side of the card, or within the message area on the address side\n(see Exhibit 202.2.1), or to the left of the address block.\nb. A label affixed with permanent adhesive for showing the delivery or return\naddress.\nc. A small reusable seal or decal prepared with pressure-sensitive and\nnonremovable adhesive that is intended to be removed from the first half of\na double card and applied to the reply half.\n6.2.6 Unacceptable Attachment\nA card may not bear an attachment that is the following:\na. Other than paper.\nb. Not totally adhered to the card surface.\nc. An encumbrance to postal processing.\n6.2.7 Tearing Guides\nA card may have perforations or tearing guides if they do not eliminate or\ninterfere with any address element, postage, marking, or endorsement and do\nnot impair the physical integrity of the card.\n6.2.8 Address Side of Cards\nThe address side of a card is the side bearing the delivery address and postage.\nThe address side may be formatted to contain a message area. Cards that do\nnot contain a message area on the address side are subject to the applicable\nstandards for the price claimed. For the purposes of 6.2, miscellaneous graphics\nor printing, such as symbols, logos, or characters, that appear on the address\nside of cards not containing a message area are generally acceptable provided\nthe items are not intended to convey a message.\n6.2.9 Double Cards\nA double card (a double stamped card or double postcard) consists of two\nattached cards, one of which is designed to be detached by the recipient and\nreturned by mail as a single card. Double cards are subject to these standards:";
    splitBySentenceTokenizer()(text);
  });
});
