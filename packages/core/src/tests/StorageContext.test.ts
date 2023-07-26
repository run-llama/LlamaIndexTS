import { existsSync, rmSync } from "fs";
import {
  storageContextFromDefaults,
  StorageContext,
} from "../storage/StorageContext";

jest.spyOn(console, "error");

describe("StorageContext", () => {
  test("initializes", async () => {
    jest.mocked(console.error).mockImplementation(() => {}); // silence console.error

    const storageContext = await storageContextFromDefaults({
      persistDir: "/tmp/test_dir",
    });

    expect(existsSync("/tmp/test_dir")).toBe(true);
    expect(storageContext).toBeDefined();

    // cleanup
    rmSync("/tmp/test_dir", { recursive: true });
  });
});
