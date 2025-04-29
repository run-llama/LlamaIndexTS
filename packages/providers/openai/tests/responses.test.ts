import type { BaseTool, ToolCallOptions } from "@llamaindex/core/llms";
import { describe, expect, it } from "vitest";
import { OpenAIResponses } from "../src/responses";

const API_KEY = process.env.MY_OPENAI_API_KEY;

describe("OpenAIResponses Integration Tests", () => {
  if (!API_KEY) {
    describe.skip("OpenAI API key not found skipping tests");
    return;
  }

  const llm = new OpenAIResponses({
    model: "gpt-4o-mini",
    apiKey: API_KEY,
  });

  it("should handle basic text chat", async () => {
    const response = await llm.chat({
      messages: [
        {
          role: "user",
          content: "What is 2+2? Answer in one word.",
        },
      ],
    });

    expect(response.message.content).toBe("Four.");
    expect(response.message.role).toBe("assistant");
  });

  it("should handle image analysis", async () => {
    const response = await llm.chat({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "What's in this image? Describe in one sentence.",
            },
            {
              type: "image_url",
              image_url: {
                url: "https://storage.googleapis.com/cloud-samples-data/vision/face/faces.jpeg",
              },
            },
          ],
        },
      ],
    });
    expect(response.raw).toHaveProperty("id");
  });

  it("should handle function calls", async () => {
    const weatherTool: BaseTool = {
      metadata: {
        name: "get_weather",
        description: "Get current weather for a location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "City name",
            },
          },
          required: ["location"],
        },
      },
    };

    const response = await llm.chat({
      messages: [
        {
          role: "user",
          content: "What's the weather in London?",
        },
      ],
      tools: [weatherTool],
    });

    expect(
      (response.message.options as ToolCallOptions)?.toolCall,
    ).toBeDefined();
    const toolCall = (response.message.options as ToolCallOptions)
      ?.toolCall?.[0];
    expect(toolCall?.name).toBe("get_weather");
    expect(
      typeof toolCall?.input === "string" &&
        JSON.parse(toolCall?.input || "{}"),
    ).toHaveProperty("location", "London");
  });
});

describe("OpenAIResponses Unit Tests", () => {
  // Testing utility functions
  describe("processMessageContent", () => {
    const llm = new OpenAIResponses({
      model: "gpt-4o-mini",
      apiKey: "test",
    });

    it("should handle non-array content (string)", () => {
      const content = "Hello world";
      // @ts-expect-error accessing private method
      const result = llm.processMessageContent(content);
      expect(result).toBe(content);
    });

    it("should process text content", () => {
      const content = [
        {
          type: "text",
          text: "Hello world",
        },
      ];
      // @ts-expect-error accessing private method
      const result = llm.processMessageContent(content);
      expect(result[0]).toEqual({
        type: "input_text",
        text: "Hello world",
      });
    });

    it("should process image content with default detail", () => {
      const content = [
        {
          type: "image_url",
          image_url: { url: "https://example.com/image.jpg" },
        },
      ];
      // @ts-expect-error accessing private method
      const result = llm.processMessageContent(content);
      expect(result[0]).toEqual({
        type: "input_image",
        image_url: "https://example.com/image.jpg",
        detail: "auto",
      });
    });

    it("should process image content with specified detail", () => {
      const content = [
        {
          type: "image_url",
          image_url: { url: "https://example.com/image.jpg" },
          detail: "high",
        },
      ];
      // @ts-expect-error accessing private method
      const result = llm.processMessageContent(content);
      expect(result[0]).toEqual({
        type: "input_image",
        image_url: "https://example.com/image.jpg",
        detail: "high",
      });
    });

    it("should process mixed content", () => {
      const content = [
        {
          type: "text",
          text: "What's in this image?",
        },
        {
          type: "image_url",
          image_url: { url: "https://example.com/image.jpg" },
        },
      ];
      // @ts-expect-error accessing private method
      const result = llm.processMessageContent(content);
      expect(result).toEqual([
        {
          type: "input_text",
          text: "What's in this image?",
        },
        {
          type: "input_image",
          image_url: "https://example.com/image.jpg",
          detail: "auto",
        },
      ]);
    });

    it("should process file content with PDF type", () => {
      const pdfBuffer = Buffer.from("test PDF content");
      const content = [
        {
          type: "file",
          mimeType: "application/pdf",
          data: pdfBuffer,
        },
      ];
      // @ts-expect-error accessing private method
      const result = llm.processMessageContent(content);
      expect(result[0]).toEqual({
        type: "input_file",
        filename: "part-0.pdf",
        file_data: `data:application/pdf;base64,${pdfBuffer.toString("base64")}`,
      });
    });

    it("should throw error for non-PDF file types", () => {
      const content = [
        {
          type: "file",
          mimeType: "image/jpeg",
          data: Buffer.from("test image content"),
        },
      ];
      // @ts-expect-error accessing private method
      expect(() => llm.processMessageContent(content)).toThrowError();
    });
  });

  describe("isResponseCreatedEvent", () => {
    const llm = new OpenAIResponses({
      model: "gpt-4o-mini",
      apiKey: "test",
    });

    it("should identify response created events", () => {
      const event = { type: "response.created", response_id: "123" };
      // @ts-expect-error accessing private method
      expect(llm.isResponseCreatedEvent(event)).toBe(true);
    });

    it("should reject non-created events", () => {
      const event = { type: "response.other", response_id: "123" };
      // @ts-expect-error accessing private method
      expect(llm.isResponseCreatedEvent(event)).toBe(false);
    });
  });

  describe("isFunctionCall", () => {
    const llm = new OpenAIResponses({
      model: "gpt-4o-mini",
      apiKey: "test",
    });

    it("should identify function calls", () => {
      const item = { type: "function_call", name: "test", arguments: "{}" };
      // @ts-expect-error accessing private method
      expect(llm.isFunctionCall(item)).toBe(true);
    });

    it("should reject non-function calls", () => {
      const item = { type: "message", content: "test" };
      // @ts-expect-error accessing private method
      expect(llm.isFunctionCall(item)).toBe(false);
    });
  });
});
