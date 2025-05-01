import { ChatMessage, ToolCallLLMMessageOptions } from "@llamaindex/core/llms";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { OpenAI } from "../src/llm";

const API_KEY = process.env.OPENAI_API_KEY;

describe("OpenAI Chat Tests", () => {
  if (!API_KEY) {
    describe.skip("OpenAI API key not found skipping tests");
    return;
  }

  describe("responseFormat with Zod schema", () => {
    it("should handle zod schema as responseFormat", async () => {
      // Define a zod schema for the response format
      const exampleSchema = z.object({
        name: z.string(),
      });

      const llm = new OpenAI({
        model: "gpt-4o-mini",
        apiKey: API_KEY,
      });

      // Call the chat method with the zod schema as responseFormat
      const response = await llm.chat({
        messages: [
          {
            role: "user",
            content: "Extract my name: Bernd",
          },
        ],
        responseFormat: exampleSchema,
      });

      // Verify the response
      expect(response.message.content).toBeDefined();

      // Parse the response content as JSON
      const parsedContent = JSON.parse(response.message.content as string);

      // Verify the structure matches our schema
      expect(parsedContent).toHaveProperty("name");
    });
  });
});

describe("OpenAI Static Methods", () => {
  describe("toOpenAIMessage", () => {
    it("should convert simple text messages", () => {
      const messages: ChatMessage<ToolCallLLMMessageOptions>[] = [
        {
          role: "user",
          content: "Hello world",
        },
        {
          role: "assistant",
          content: "Hi there",
        },
        {
          role: "system",
          content: "You are a helpful assistant",
        },
      ];

      const result = OpenAI.toOpenAIMessage(messages);
      expect(result).toEqual([
        {
          role: "user",
          content: "Hello world",
        },
        {
          role: "assistant",
          content: "Hi there",
        },
        {
          role: "system",
          content: "You are a helpful assistant",
        },
      ]);
    });

    it("should convert tool result messages", () => {
      const messages: ChatMessage<ToolCallLLMMessageOptions>[] = [
        {
          role: "assistant",
          content: "Weather result",
          options: {
            toolResult: {
              id: "weather-123",
            },
          },
        },
      ];

      const result = OpenAI.toOpenAIMessage(messages);
      expect(result).toEqual([
        {
          role: "tool",
          content: "Weather result",
          tool_call_id: "weather-123",
        },
      ]);
    });

    it("should convert tool call messages", () => {
      const messages: ChatMessage<ToolCallLLMMessageOptions>[] = [
        {
          role: "assistant",
          content: "Let me check the weather",
          options: {
            toolCall: [
              {
                id: "weather-123",
                name: "get_weather",
                input: { location: "London" },
              },
            ],
          },
        },
      ];

      const result = OpenAI.toOpenAIMessage(messages);
      expect(result).toEqual([
        {
          role: "assistant",
          content: "Let me check the weather",
          tool_calls: [
            {
              id: "weather-123",
              type: "function",
              function: {
                name: "get_weather",
                arguments: JSON.stringify({ location: "London" }),
              },
            },
          ],
        },
      ]);
    });

    it("should convert user messages with file content", () => {
      const pdfBuffer = Buffer.from("test PDF content");
      const messages: ChatMessage<ToolCallLLMMessageOptions>[] = [
        {
          role: "user",
          content: [
            {
              type: "file",
              mimeType: "application/pdf",
              data: pdfBuffer,
            },
          ],
        },
      ];

      const result = OpenAI.toOpenAIMessage(messages);
      expect(result).toEqual([
        {
          role: "user",
          content: [
            {
              type: "file",
              file: {
                file_data: `data:application/pdf;base64,${pdfBuffer.toString("base64")}`,
                filename: "part-0.pdf",
              },
            },
          ],
        },
      ]);
    });

    it("should convert user messages with mixed content", () => {
      const pdfBuffer = Buffer.from("test PDF content");
      const messages: ChatMessage<ToolCallLLMMessageOptions>[] = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Here's a PDF file:",
            },
            {
              type: "file",
              mimeType: "application/pdf",
              data: pdfBuffer,
            },
          ],
        },
      ];

      const result = OpenAI.toOpenAIMessage(messages);
      expect(result).toEqual([
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Here's a PDF file:",
            },
            {
              type: "file",
              file: {
                file_data: `data:application/pdf;base64,${pdfBuffer.toString("base64")}`,
                filename: "part-1.pdf",
              },
            },
          ],
        },
      ]);
    });

    it("should throw error for non-PDF files", () => {
      const fileBuffer = Buffer.from("fake file content");
      const messages: ChatMessage<ToolCallLLMMessageOptions>[] = [
        {
          role: "user",
          content: [
            {
              type: "file",
              mimeType: "text/csv",
              data: fileBuffer,
            },
          ],
        },
      ];

      expect(() => OpenAI.toOpenAIMessage(messages)).toThrowError();
    });
  });
});
