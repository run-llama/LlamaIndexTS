import { Settings } from "@llamaindex/core/global";
import { TextNode } from "@llamaindex/core/schema";
import { env } from "process";
import { afterEach, describe, expect, test, vi } from "vitest";
describe("chunkSizeCheck", () => {
  afterEach(() => {
    Settings.chunkSize = undefined;
    env.ENABLE_CHUNK_SIZE_CHECK = undefined;
  });

  test("should warn when content is larger than chunk size", () => {
    env.ENABLE_CHUNK_SIZE_CHECK = "true";

    let message = "";
    vi.spyOn(console, "warn").mockImplementation(
      (msg) => (message += msg + "\n"),
    );

    Settings.chunkSize = 0;

    const node = new TextNode();
    expect(message).toEqual("");
    node.setContent("a".repeat(1024));
    expect(message).toBe("");
    node.getContent();
    expect(message).toContain("is larger than chunk size");
  });
});
