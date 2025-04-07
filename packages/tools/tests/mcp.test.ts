import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { mcp } from "../src/tools/mcp";

describe("MCP Tools", () => {
  let server: ReturnType<typeof mcp>;
  let tempDir: string;

  beforeAll(async () => {
    // Create a temporary directory for tests
    tempDir = await mkdtemp("mcp-test-");

    server = mcp({
      command: "node",
      args: [
        path.join(
          "node_modules",
          "@modelcontextprotocol",
          "server-filesystem",
          "dist",
          "index.js",
        ),
        tempDir,
      ],
      toolNamePrefix: "test",
      verbose: true,
    });

    // Wait for server to be ready by calling tools() once
    await server.tools();
  }, 20000);

  afterAll(async () => {
    // Clean up server resources
    await server.cleanup();
    // Remove temporary directory
    await rm(tempDir, { recursive: true, force: true });
  }, 20000);

  test("MCP should list tools", async () => {
    const tools = await server.tools();
    expect(tools.length).toBeGreaterThan(0);
  }, 20000);

  test("MCP should call a tool to list files in a directory", async () => {
    const tools = await server.tools();
    const listDirectoryTool = tools.find(
      (tool) => tool.metadata.name === "test_list_directory",
    );
    const result = await listDirectoryTool?.call({
      path: tempDir,
    });
    expect(result).toBeDefined();
  }, 20000);
});
