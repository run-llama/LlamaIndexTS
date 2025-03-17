import { describe, expect, test, vi } from "vitest";
import {
  imageGenerator,
  type ImgGeneratorToolOutput,
} from "../src/tools/img-gen";

vi.mock("got", () => ({
  default: {
    post: vi.fn().mockReturnValue({
      buffer: vi.fn().mockResolvedValue(Buffer.from("mock-image-data")),
    }),
  },
}));

describe("Image Generator Tool", () => {
  test("generates image from prompt", async () => {
    const imgTool = imageGenerator({
      apiKey: process.env.STABILITY_API_KEY!,
      outputDir: "output",
      fileServerURLPrefix: "http://localhost:3000",
    });

    const result = (await imgTool.call({
      prompt: "a cute cat playing with yarn",
    })) as ImgGeneratorToolOutput;

    expect(result.isSuccess).toBe(true);
    expect(result.imageUrl).toBeDefined();
    expect(result.errorMessage).toBeUndefined();
  });
});
