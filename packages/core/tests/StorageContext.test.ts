import { storageContextFromDefaults } from "llamaindex/storage/StorageContext";
import { existsSync, rmSync } from "node:fs";
import { describe, expect, test, vi, vitest } from "vitest";

vitest.spyOn(console, "error");

describe("StorageContext", () => {
  test("initializes", async () => {
    vi.mocked(console.error).mockImplementation(() => {}); // silence console.error

    const storageContext = await storageContextFromDefaults({
      persistDir: "/tmp/test_dir",
    });

    expect(existsSync("/tmp/test_dir")).toBe(true);
    expect(storageContext).toBeDefined();

    // cleanup
    rmSync("/tmp/test_dir", { recursive: true });
  });
});
