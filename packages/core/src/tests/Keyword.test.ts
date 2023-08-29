import {
  rakeExtractKeywords,
  simpleExtractKeywords,
} from "../indices/keyword/utils";
describe("SimpleExtractKeywords", () => {
  test("should extract unique keywords", () => {
    const text = "apple banana apple cherry";
    const result = simpleExtractKeywords(text);
    expect(result).toEqual(new Set(["apple", "banana", "cherry"]));
  });

  test("should handle empty string", () => {
    const text = "";
    const result = simpleExtractKeywords(text);
    expect(result).toEqual(new Set());
  });

  test("should handle case sensitivity", () => {
    const text = "Apple apple";
    const result = simpleExtractKeywords(text);
    expect(result).toEqual(new Set(["apple"]));
  });

  test("should order keywords by frequency", () => {
    const text = "apple banana apple cherry banana apple";
    const result = simpleExtractKeywords(text);
    expect([...result]).toEqual(["apple", "banana", "cherry"]);
  });

  test("should respect the maxKeywords parameter", () => {
    const text = "apple banana apple cherry banana apple orange";
    const result = simpleExtractKeywords(text, 2);
    expect(result).toEqual(new Set(["apple", "banana"]));
  });

  test("should handle non-alphabetic characters", () => {
    const text = "apple! banana... apple? cherry, orange;";
    const result = simpleExtractKeywords(text);
    expect(result).toEqual(new Set(["apple", "banana", "cherry", "orange"]));
  });
});

describe("RakeExtractKeywords", () => {
  const sampleText = `Before college the two main things I worked on, outside of school, were writing and programming. I didn't write essays. I wrote what beginning writers were supposed to write then, and probably still are: short stories. My stories were awful. They had hardly any plot, just characters with strong feelings, which I imagined made them deep.`;
  test("should return all keywords if maxKeywords is not provided", () => {
    const result = rakeExtractKeywords(sampleText);
    expect(result).toEqual(
      new Set([
        "write then",
        "write essays",
        "short stories",
        "worked on",
        "strong feelings",
        "main things",
        "imagined made",
      ]),
    );
  });

  test("should respect the maxKeywords parameter", () => {
    const result = rakeExtractKeywords(sampleText, 2);
    expect(result).toEqual(new Set(["write then", "write essays"]));
  });

  test("should handle empty return from rake", () => {
    const result = rakeExtractKeywords("");
    expect(result).toEqual(new Set());
  });
});
