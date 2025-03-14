import { beforeEach, describe, expect, test, vi } from "vitest";
import type { LLMMetadata } from "../../llms/dist/index.js";
import { getResponseSynthesizer } from "../../response-synthesizers/dist/index.js";
import { Document } from "../../schema/dist/index.js";

const mockLllm = () => ({
  complete: vi.fn().mockImplementation(({ stream }) => {
    const response = { text: "unimportant" };
    if (!stream) {
      return response;
    }

    return {
      [Symbol.asyncIterator]: function* gen() {
        // yield a few times to make sure each chunk has the sourceNodes
        yield response;
        yield response;
        yield response;
      },
    };
  }),
  chat: vi.fn(),
  metadata: {} as unknown as LLMMetadata,
});

describe("refine response synthesizer", () => {
  let synthesizer: ReturnType<typeof getResponseSynthesizer<"refine">>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAsyncIterable = (obj: any): boolean =>
    obj[Symbol.asyncIterator] !== undefined;

  beforeEach(() => {
    synthesizer = getResponseSynthesizer("refine", {
      llm: mockLllm(),
    });
  });

  describe("getResponse", () => {
    test("should return async iterable of EngineResponse when stream is true and sourceNodes are empty", async () => {
      const response = await synthesizer.getResponse(
        "unimportant query",
        [],
        true,
      );

      expect(isAsyncIterable(response)).toBe(true);
      for await (const chunk of response) {
        expect(chunk.message.content).toEqual("");
      }
    });

    test("should return non async iterable when stream is false and sourceNodes are empty", async () => {
      const response = await synthesizer.getResponse(
        "unimportant query",
        [],
        false,
      );

      expect(isAsyncIterable(response)).toBe(false);
      expect(response.message.content).toEqual("");
    });
  });
});

describe("compact and refine response synthesizer", () => {
  let synthesizer: ReturnType<typeof getResponseSynthesizer<"compact">>;

  beforeEach(() => {
    synthesizer = getResponseSynthesizer("compact", {
      llm: mockLllm(),
    });
  });

  describe("synthesize", () => {
    test("should return original sourceNodes with response when stream = false", async () => {
      const sourceNode = { node: new Document({}), score: 1 };

      const response = await synthesizer.synthesize(
        {
          query: "test",
          nodes: [sourceNode],
        },
        false,
      );

      expect(response.sourceNodes).toEqual([sourceNode]);
    });

    test("should return original sourceNodes with response when stream = true", async () => {
      const sourceNode = { node: new Document({}), score: 1 };

      const response = await synthesizer.synthesize(
        {
          query: "test",
          nodes: [sourceNode],
        },
        true,
      );

      for await (const chunk of response) {
        expect(chunk.sourceNodes).toEqual([sourceNode]);
      }
    });
  });
});
