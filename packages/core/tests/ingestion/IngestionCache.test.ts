import { BaseNode, TextNode } from "llamaindex/Node";
import {
  IngestionCache,
  getTransformationHash,
} from "llamaindex/ingestion/IngestionCache";
import { TransformComponent } from "llamaindex/ingestion/index";
import { SimpleNodeParser } from "llamaindex/nodeParsers/index";
import { beforeAll, describe, expect, test } from "vitest";

describe("IngestionCache", () => {
  let cache: IngestionCache;
  const hash = "1";

  beforeAll(() => {
    cache = new IngestionCache();
  });
  test("should put and get", async () => {
    const nodes = [new TextNode({ text: "some text", id_: "some id" })];
    await cache.put(hash, nodes);
    const result = await cache.get(hash);
    expect(result).toEqual(nodes);
  });
  test("should return undefined if not found", async () => {
    const result = await cache.get("not found");
    expect(result).toBeUndefined();
  });
});

describe("getTransformationHash", () => {
  let nodes: BaseNode[], transform: TransformComponent;

  beforeAll(() => {
    nodes = [new TextNode({ text: "some text", id_: "some id" })];
    transform = new SimpleNodeParser({
      chunkOverlap: 10,
      chunkSize: 1024,
    });
  });
  test("should return a hash", () => {
    const result = getTransformationHash(nodes, transform);
    expect(typeof result).toBe("string");
  });
  test("should return the same hash for the same inputs", () => {
    const result1 = getTransformationHash(nodes, transform);
    const result2 = getTransformationHash(nodes, transform);
    expect(result1).toBe(result2);
  });
  test("should return the same hash for other instances with same inputs", () => {
    const result1 = getTransformationHash(
      [new TextNode({ text: "some text", id_: "some id" })],
      transform,
    );
    const result2 = getTransformationHash(nodes, transform);
    expect(result1).toBe(result2);
  });
  test("should return different hashes for different nodes", () => {
    const result1 = getTransformationHash(nodes, transform);
    const result2 = getTransformationHash(
      [new TextNode({ text: "some other text", id_: "some id" })],
      transform,
    );
    expect(result1).not.toBe(result2);
  });
  test("should return different hashes for different transforms", () => {
    const result1 = getTransformationHash(nodes, transform);
    const result2 = getTransformationHash(
      nodes,
      new SimpleNodeParser({
        chunkOverlap: 10,
        chunkSize: 512,
      }),
    );
    expect(result1).not.toBe(result2);
  });

  test("should not break with circular references", () => {
    const obj: any = { a: 1, b: 2 };
    obj["circular"] = obj;
    const result = getTransformationHash(nodes, obj);
    expect(typeof result).toBe("string");
  });
});
