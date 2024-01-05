import { HuggingFaceEmbedding } from "../../embeddings";

describe("HuggingFaceEmbedding", () => {
  let huggingFaceEmbedding: HuggingFaceEmbedding;

  beforeEach(() => {
    huggingFaceEmbedding = new HuggingFaceEmbedding();
  });

  test("getExtractor method should return a valid extractor", async () => {
    const extractor = await huggingFaceEmbedding.getExtractor();
    expect(extractor).toBeTruthy();
    expect(typeof extractor).toBe("function");
  });

  test("getTextEmbedding should return valid embedding", async () => {
    const text = "Hello World!";
    const embedding = await huggingFaceEmbedding.getTextEmbedding(text);
    expect(embedding).toBeInstanceOf(Array);
  });
});
