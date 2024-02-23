import { OpenAIEmbedding, similarity, SimilarityType } from "../embeddings";
import { mockEmbeddingModel } from "./utility/mockOpenAI";

// Mock the OpenAI getOpenAISession function during testing
jest.mock("../llm/open_ai", () => {
  return {
    getOpenAISession: jest.fn().mockImplementation(() => null),
  };
});

describe("similarity", () => {
  test("throws error on mismatched lengths", () => {
    const embedding1 = [1, 2, 3];
    const embedding2 = [4, 5];
    expect(() => similarity(embedding1, embedding2)).toThrow();
  });

  test("throws error on unknown mode", () => {
    const embedding1 = [1, 2, 3];
    const embedding2 = [4, 5, 6];
    expect(() =>
      similarity(embedding1, embedding2, "unknown" as SimilarityType),
    ).toThrow();
  });

  test("calculates dot product", () => {
    const embedding1 = [1, 2, 3];
    const embedding2 = [4, 5, 6];
    expect(
      similarity(embedding1, embedding2, SimilarityType.DOT_PRODUCT),
    ).toEqual(32);
  });

  test("calculates cosine similarity", () => {
    const embedding1 = [1, 0];
    const embedding2 = [0, 1];
    expect(similarity(embedding1, embedding2, SimilarityType.DEFAULT)).toEqual(
      0.0,
    );
  });

  test("calculates euclidean similarity", () => {
    const queryEmbedding = [1, 0];
    const docEmbedding1 = [0, 1]; // farther from query, distance 1.414
    const docEmbedding2 = [1, 1]; // closer to query distance 1
    expect(
      similarity(queryEmbedding, docEmbedding1, SimilarityType.EUCLIDEAN),
    ).toBeLessThan(
      similarity(queryEmbedding, docEmbedding2, SimilarityType.EUCLIDEAN),
    );
  });
});

describe("[OpenAIEmbedding]", () => {
  let embedModel: OpenAIEmbedding;

  beforeAll(() => {
    let openAIEmbedding = new OpenAIEmbedding();

    mockEmbeddingModel(openAIEmbedding);

    embedModel = openAIEmbedding;
  });

  test("getTextEmbedding", async () => {
    const embedding = await embedModel.getTextEmbedding("hello");
    expect(embedding.length).toEqual(6);
  });

  test("getTextEmbeddings", async () => {
    const texts = ["hello", "world"];
    const embeddings = await embedModel.getTextEmbeddings(texts);
    expect(embeddings.length).toEqual(2);
  });

  test("getTextEmbeddingsBatch", async () => {
    const texts = ["hello", "world"];
    const embeddings = await embedModel.getTextEmbeddingsBatch(texts);
    expect(embeddings.length).toEqual(2);
  });
});
