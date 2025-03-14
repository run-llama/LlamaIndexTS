import { describe, expect, test } from "vitest";
import { fs } from "../src/fs/memory.js";

describe("memfs", () => {
  test("should be able to read and write files", async () => {
    await fs.writeFile("/foo", "bar");
    const content = await fs.readFile("/foo", "utf8");
    expect(content).toBe("bar");
  });
});
