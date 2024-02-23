import nodeFS from "node:fs/promises";
import os from "os";
import path from "path";
import { defaultFS } from "../env";
import {
  GenericFileSystem,
  InMemoryFileSystem,
  exists,
  walk,
} from "../storage/FileSystem";

type FileSystemUnderTest = {
  name: string;
  prepare: () => Promise<any>;
  cleanup: () => Promise<any>;
  implementation: GenericFileSystem;
  tempDir: string;
};

const cases: FileSystemUnderTest[] = [
  {
    name: "InMemoryFileSystem",
    prepare: async () => {},
    cleanup: async function () {
      this.implementation = new InMemoryFileSystem();
    },
    implementation: new InMemoryFileSystem(),
    tempDir: "./",
  },
  {
    name: "Default fs",
    prepare: async function () {
      this.tempDir = await nodeFS.mkdtemp(path.join(os.tmpdir(), "jest-"));
    },
    cleanup: async function () {
      await nodeFS.rm(this.tempDir, { recursive: true });
    },
    implementation: defaultFS,
    tempDir: "./",
  },
];

describe.each<FileSystemUnderTest>(cases)("Test %s", (testParams) => {
  let testFS: GenericFileSystem;
  let tempDir: string;

  beforeEach(async () => {
    await testParams.prepare();
    testFS = testParams.implementation;
    tempDir = testParams.tempDir;
  });

  afterEach(async () => {
    await testParams.cleanup();
  });

  test("initializes", () => {
    expect(testFS).toBeTruthy();
  });

  describe("writeFile", () => {
    it("writes file to memory", async () => {
      await testFS.writeFile(`${tempDir}/test.txt`, "Hello, world!");
      expect(await testFS.readFile(`${tempDir}/test.txt`)).toBe(
        "Hello, world!",
      );
    });

    it("overwrites existing file", async () => {
      await testFS.writeFile(`${tempDir}/test.txt`, "Hello, world!");
      await testFS.writeFile(`${tempDir}/test.txt`, "Hello, again!");
      expect(await testFS.readFile(`${tempDir}/test.txt`)).toBe(
        "Hello, again!",
      );
    });
  });

  describe("readFile", () => {
    it("throws error for non-existing file", async () => {
      await expect(
        testFS.readFile(`${tempDir}/not_exist.txt`),
      ).rejects.toThrow();
    });
  });

  describe("exists", () => {
    it("returns true for existing file", async () => {
      await testFS.writeFile(`${tempDir}/test.txt`, "Hello, world!");
      expect(await exists(testFS, `${tempDir}/test.txt`)).toBe(true);
    });

    it("returns false for non-existing file", async () => {
      expect(await exists(testFS, `${tempDir}/not_exist.txt`)).toBe(false);
    });
  });

  describe("mkdir", () => {
    it("creates directory if it doesn't exist", async () => {
      await testFS.mkdir(`${tempDir}/testDir`);
      expect(await exists(testFS, `${tempDir}/testDir`)).toBe(true);
    });
  });
});

describe("Test walk for Node.js fs", () => {
  let tempDir: string;

  beforeAll(async () => {
    tempDir = await nodeFS.mkdtemp(path.join(os.tmpdir(), "jest-"));
    await nodeFS.writeFile(`${tempDir}/test.txt`, "Hello, world!");
    await nodeFS.mkdir(`${tempDir}/subDir`);
    await nodeFS.writeFile(`${tempDir}/subDir/test2.txt`, "Hello, again!");
  });

  it("walks directory", async () => {
    const expectedFiles = new Set([
      `${tempDir}/subDir/test2.txt`,
      `${tempDir}/test.txt`,
    ]);

    const actualFiles = new Set<string>();
    for await (let file of walk(nodeFS, tempDir)) {
      expect(file).toBeTruthy();
      actualFiles.add(file);
    }

    expect(expectedFiles).toEqual(actualFiles);
  });

  afterAll(async () => {
    await nodeFS.rm(tempDir, { recursive: true });
  });
});
