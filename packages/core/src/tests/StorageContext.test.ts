import { existsSync, rmSync } from "fs";
import { storageContextFromDefaults, StorageContext } from "../storage/StorageContext";
import { Document } from "../Node";
import { VectorStoreIndex } from "../indices";
import { ListIndex } from "../indices";

describe("StorageContext", () => {
  test("initializes", async () => {
    const storageContext = await storageContextFromDefaults({ persistDir: "/tmp/test_dir" });

    expect(existsSync("/tmp/test_dir")).toBe(true);
    expect(storageContext).toBeDefined();

    // cleanup
    rmSync("/tmp/test_dir", { recursive: true });
  });
});
