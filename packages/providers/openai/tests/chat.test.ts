import {
  ChatMessage,
  ChatResponseChunk,
  ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
import { describe, expect, it, vi } from "vitest";
import { z as z3 } from "zod/v3";
import { z as z4 } from "zod/v4";
import { OpenAI } from "../src/llm";

const API_KEY = process.env.OPENAI_API_KEY;

describe("OpenAI Chat Tests", () => {
  if (!API_KEY) {
    describe.skip("OpenAI API key not found skipping tests");
    return;
  }

  describe("responseFormat with Zod schema", () => {
    it("should handle zod schema as responseFormat (zod v3)", async () => {
      // Define a zod schema for the response format
      const zod3Schema = z3.object({
        name: z3.string(),
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
        responseFormat: zod3Schema,
      });

      // Verify the response
      expect(response.message.content).toBeDefined();

      // Parse the response content as JSON
      const parsedContent = JSON.parse(response.message.content as string);

      // Verify the structure matches our schema
      expect(parsedContent).toHaveProperty("name");
    });

    it("should handle zod schema as responseFormat (zod v4)", async () => {
      // Define a zod schema for the response format
      const zod4Schema = z4.object({
        name: z4.string(),
        age: z4.number(),
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
            content: "Extract my name: Bernd, my age: 30",
          },
        ],
        responseFormat: zod4Schema,
      });

      // Verify the response
      expect(response.message.content).toBeDefined();

      // Parse the response content as JSON
      const parsedContent = JSON.parse(response.message.content as string);

      // Verify the structure matches our schema
      expect(parsedContent).toHaveProperty("name");
      expect(parsedContent).toHaveProperty("age");
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
      const pdfBuffer = Buffer.from("test PDF content").toString("base64");
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
                file_data: `data:application/pdf;base64,${pdfBuffer}`,
                filename: "part-0.pdf",
              },
            },
          ],
        },
      ]);
    });

    it("should convert user messages with mixed content", () => {
      const pdfBuffer = Buffer.from("test PDF content").toString("base64");
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
                file_data: `data:application/pdf;base64,${pdfBuffer}`,
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

describe("OpenAI streamChat", () => {
  it("should handle choice with empty delta and finish_reason stop", async () => {
    // Create a mock OpenAI instance
    const mockStream = async function* () {
      yield {
        choices: [
          {
            delta: {},
            finish_reason: "stop",
            index: 0,
            logprobs: null,
          },
        ],
      };
    };

    // Mock the OpenAI session and chat completions
    const mockSession = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue(mockStream()),
        },
      },
    };

    const openai = new OpenAI({
      model: "gpt-4o-mini",
      apiKey: "test-key",
      // @ts-expect-error: mockSession is a mock object for testing purposes
      session: mockSession,
    });

    // @ts-expect-error accessing protected method
    const stream = openai.streamChat({
      messages: [{ role: "user" as const, content: "Hello" }],
      stream: true,
    });

    const chunks: ChatResponseChunk[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks).toHaveLength(1);
    expect(chunks[0].options).toEqual({});
    expect(chunks[0].delta).toBe("");
  });

  it("should handle part with undefined choices", async () => {
    // Create a mock stream that yields a part without choices
    const mockStream = async function* () {
      yield {
        // No choices property defined
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      };
    };

    // Mock the OpenAI session and chat completions
    const mockSession = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue(mockStream()),
        },
      },
    };

    const openai = new OpenAI({
      model: "gpt-4o-mini",
      apiKey: "test-key",
      // @ts-expect-error: mockSession is a mock object for testing purposes
      session: mockSession,
    });

    // @ts-expect-error accessing protected method
    const stream = openai.streamChat({
      messages: [{ role: "user" as const, content: "Hello" }],
      stream: true,
    });

    const chunks: ChatResponseChunk[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks).toHaveLength(1);
    expect(chunks[0].delta).toBe("");
    expect(chunks[0].raw).toHaveProperty("usage");
  });

  it("should handle part with invalid content", async () => {
    const mockStream = async function* () {
      yield {
        choices: [
          {
            delta: {
              role: "assistant",
              content: "",
            },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      };
    };

    // Mock the OpenAI session and chat completions
    const mockSession = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue(mockStream()),
        },
      },
    };

    const openai = new OpenAI({
      model: "gpt-4o-mini",
      apiKey: "test-key",
      // @ts-expect-error: mockSession is a mock object for testing purposes
      session: mockSession,
    });

    // @ts-expect-error accessing protected method
    const stream = openai.streamChat({
      messages: [{ role: "user" as const, content: "Hello" }],
      stream: true,
    });

    const chunks: ChatResponseChunk[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks).toHaveLength(1);
    expect(chunks[0].delta).toBe("");
    expect(chunks[0].raw).toHaveProperty("usage");
  });
});
