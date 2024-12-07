import { describe, expect, test, vi } from "vitest";
import type { LLMMetadata } from "../../llms/dist/index.js";
import { getResponseSynthesizer } from "../../response-synthesizers/dist/index.js";
import { Document } from "../../schema/dist/index.js";

const mockLllm = () => ({
  complete: vi.fn().mockImplementation(({ stream }) => {
    const response = { text: "unimportant" };
    if (!stream) {
      return response;
    }

    function* gen() {
      // yield a few times to make sure each chunk has the sourceNodes
      yield response;
      yield response;
      yield response;
    }

    return gen();
  }),
  chat: vi.fn(),
  metadata: {} as unknown as LLMMetadata,
});

describe("compact and refine response synthesizer", () => {
  describe("synthesize", () => {
    test("should return original sourceNodes with response when stream = false", async () => {
      const synthesizer = getResponseSynthesizer("compact", {
        llm: mockLllm(),
      });

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
      const synthesizer = getResponseSynthesizer("compact", {
        llm: mockLllm(),
      });

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
