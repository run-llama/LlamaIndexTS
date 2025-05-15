import { OpenAIEmbedding } from "@llamaindex/openai";
import {
  FunctionTool,
  ObjectIndex,
  Settings,
  SimpleToolNodeMapping,
  VectorStoreIndex,
} from "llamaindex";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { mockEmbeddingModel } from "../utility/mockOpenAI.js";

describe("ObjectIndex", () => {
  beforeAll(async () => {
    const embedModel = new OpenAIEmbedding();
    mockEmbeddingModel(embedModel);
    Settings.embedModel = embedModel;
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  test("test_object_with_tools", async () => {
    const tool1 = new FunctionTool(({ x }: { x: string }) => x, {
      name: "test_tool",
      description: "test tool",
      parameters: {
        type: "object",
        properties: {
          x: {
            type: "string",
          },
        },
        required: ["x"],
      },
    });

    const tool2 = new FunctionTool(({ x }: { x: string }) => x, {
      name: "test_tool_2",
      description: "test tool 2",
      parameters: {
        type: "object",
        properties: {
          x: {
            type: "string",
          },
        },
        required: ["x"],
      },
    });

    const toolMapping = SimpleToolNodeMapping.fromObjects([tool1, tool2]);

    const objectRetriever = await ObjectIndex.fromObjects(
      [tool1, tool2],
      toolMapping,
      VectorStoreIndex,
    );

    const retriever = await objectRetriever.asRetriever({});

    expect(await retriever.retrieve("test")).toStrictEqual([tool1, tool2]);
  });

  test("add a new object", async () => {
    const tool1 = new FunctionTool(({ x }: { x: string }) => x, {
      name: "test_tool",
      description: "test tool",
      parameters: {
        type: "object",
        properties: {
          x: {
            type: "string",
          },
        },
        required: ["x"],
      },
    });

    const tool2 = new FunctionTool(({ x }: { x: string }) => x, {
      name: "test_tool_2",
      description: "test tool 2",
      parameters: {
        type: "object",
        properties: {
          x: {
            type: "string",
          },
        },
        required: ["x"],
      },
    });

    const toolMapping = SimpleToolNodeMapping.fromObjects([tool1]);

    const objectRetriever = await ObjectIndex.fromObjects(
      [tool1],
      toolMapping,
      VectorStoreIndex,
    );

    let tools = objectRetriever.tools;

    expect(Object.keys(tools).length).toBe(1);

    await objectRetriever.insertObject(tool2);

    tools = objectRetriever.tools;

    expect(Object.keys(tools).length).toBe(2);
  });
});
