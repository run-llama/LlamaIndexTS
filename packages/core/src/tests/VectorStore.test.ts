import { Client } from "pg";
import { Document, MetadataMode } from "../Node";
import { PGVectorStore } from "../storage";
import {
  metadataDictToNode,
  nodeToMetadata,
} from "../storage/vectorStore/utils";

function getConnectionString(databaseName: string) {
  return `postgresql://postgres:mark90@localhost:5432/${databaseName}`;
}

const DATABASE_NAME = "test_database";

describe("Testing VectorStore utils", () => {
  let node: Document;

  beforeEach(() => {
    node = new Document({
      text: "text",
      metadata: { meta1: "Some metadata" },
    });
  });

  test("nodeToMetadata should not modify a node's metadata", () => {
    nodeToMetadata(node, true);
    expect(node.metadata).toEqual({ meta1: "Some metadata" });
  });
  test("metadataDictToNode should reconstructs node and remove text (except embedding)", () => {
    const metadata = nodeToMetadata(node, true);
    const newNode = metadataDictToNode(metadata);
    expect(newNode.metadata).toEqual({ meta1: "Some metadata" });
    expect(() => newNode.getEmbedding()).toThrow();
    expect(newNode.getContent(MetadataMode.NONE)).toEqual("");
  });
  test("metadataDictToNode should reconstructs node (except embedding)", () => {
    const metadata = nodeToMetadata(node, false);
    const newNode = metadataDictToNode(metadata);
    expect(newNode.metadata).toEqual({ meta1: "Some metadata" });
    expect(newNode.getContent(MetadataMode.NONE)).toEqual("text");
    expect(() => newNode.getEmbedding()).toThrow();
  });
  test("metadataDictToNode should not allow deep metadata if flatMetadata is true", () => {
    node.metadata = { meta: { meta: "meta" } };
    expect(() => nodeToMetadata(node, false, "text", true)).toThrow();
  });
  test("metadataDictToNode should throw an error when node content not found in metadata", () => {
    const faultyMetadata = {
      _node_type: "IndexNode",
    };
    expect(() => {
      metadataDictToNode(faultyMetadata);
    }).toThrow();
  });
});

describe.skip("Testing VectorStore initialization", () => {
  beforeAll(async () => {
    const pgClient = new Client({
      connectionString: getConnectionString("postgres"),
    });
    await pgClient.connect();
    await pgClient.query(`DROP DATABASE IF EXISTS ${DATABASE_NAME};`);
    await pgClient.query(`CREATE DATABASE ${DATABASE_NAME};`);
  });

  afterAll(async () => {
    const pgClient = new Client({
      connectionString: getConnectionString("postgres"),
    });
    await pgClient.connect();
    await pgClient.query(`DROP DATABASE ${DATABASE_NAME};`);
  });

  test("PGVectorStore initialization", () => {
    const vectorStore = new PGVectorStore({
      connectionString: getConnectionString(DATABASE_NAME),
      tableName: "test_table",
      schemaName: "",
    });
    expect(vectorStore).toBeInstanceOf(PGVectorStore);
  });
});
