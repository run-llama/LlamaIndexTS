import SwaggerParser from "@apidevtools/swagger-parser";
import got from "got";
import { describe, expect, test, vi } from "vitest";
import { OpenAPIActionTool } from "../src/tools/openapi-action";

// Mock SwaggerParser and got
vi.mock("@apidevtools/swagger-parser", () => ({
  default: {
    validate: vi.fn(),
  },
}));

vi.mock("got", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("OpenAPI Action Tool", () => {
  test("loads and executes API requests", async () => {
    // Mock swagger spec
    vi.mocked(SwaggerParser.validate).mockResolvedValue({
      openapi: "3.0.0",
      info: {
        title: "Test API",
        description: "Test API Description",
        version: "1.0.0",
      },
      paths: {
        "/test": {
          get: {
            description: "Test endpoint",
            responses: {
              "200": {
                description: "Successful response",
              },
            },
          },
        },
      },
    });

    // Mock API response
    vi.mocked(got.get).mockReturnValue({
      json: () => Promise.resolve({ data: "test response" }),
    } as ReturnType<typeof got.get>);

    const tool = new OpenAPIActionTool("https://api.test.com/openapi.json");
    const tools = await tool.toToolFunctions();

    // Verify tools were created
    expect(tools).toHaveLength(4); // load_spec, get, post, patch

    // Test GET request
    const result = await tool.getRequest({
      url: "https://api.test.com/test",
      params: { key: "value" },
    });

    expect(got.get).toHaveBeenCalledWith(
      "https://api.test.com/test",
      expect.objectContaining({
        searchParams: { key: "value" },
      }),
    );
    expect(result).toEqual({ data: "test response" });
  });
});
