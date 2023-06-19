import { SentenceSplitter } from "../TextSplitter";

describe("SentenceSplitter", () => {
  test("initializes", () => {
    const sentenceSplitter = new SentenceSplitter();
    expect(sentenceSplitter).toBeDefined();
  });

  test("splits paragraphs w/o effective chunk size", () => {
    const sentenceSplitter = new SentenceSplitter(
      undefined, undefined, undefined, undefined, "\n"
    );
    // generate the same line as above but correct syntax errors
    let splits = sentenceSplitter.getParagraphSplits("This is a paragraph.\nThis is another paragraph.", undefined);
    expect(splits).toEqual(["This is a paragraph.", "This is another paragraph."]);
  });

  test("splits paragraphs with effective chunk size", () => {
    const sentenceSplitter = new SentenceSplitter(
      undefined, undefined, undefined, undefined, "\n"
    );
    // generate the same line as above but correct syntax errors
    let splits = sentenceSplitter.getParagraphSplits("This is a paragraph.\nThis is another paragraph.", 1000);
    expect(splits).toEqual(["This is a paragraph.\nThis is another paragraph."]);
  });
  
  test("splits sentences", () => {
    const sentenceSplitter = new SentenceSplitter();
    let splits = sentenceSplitter.getSentenceSplits("This is a sentence. This is another sentence.", undefined);
    expect(splits).toEqual(["This is a sentence.", "This is another sentence."]);
  });

  test("overall split text", () => {
    let sentenceSplitter = new SentenceSplitter(5, 0);
    let splits = sentenceSplitter.splitText("This is a sentence. This is another sentence.");
    expect(splits).toEqual(["This is a sentence.", "This is another sentence."]);

    sentenceSplitter = new SentenceSplitter(1000);
    splits = sentenceSplitter.splitText("This is a sentence. This is another sentence.");
    expect(splits).toEqual(["This is a sentence. This is another sentence."]);
  });

});
