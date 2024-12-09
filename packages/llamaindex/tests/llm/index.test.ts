import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { setEnvs } from "@llamaindex/env";
import { Anthropic, OpenAI, type ChatMessage } from "llamaindex";
import { beforeAll, describe, expect, test } from "vitest";

beforeAll(() => {
  setEnvs({
    ANTHROPIC_API_KEY: "valid",
  });
});

describe("Message Formatting", () => {
  describe("Basic Message Formatting", () => {
    test("OpenAI formats basic user and assistant messages correctly", () => {
      const inputMessages: ChatMessage[] = [
        { content: "Hello", role: "user" },
        { content: "Hi there!", role: "assistant" },
        { content: "Be helpful", role: "system" },
      ];
      const expectedOutput = [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
        { role: "system", content: "Be helpful" },
      ];
      expect(OpenAI.toOpenAIMessage(inputMessages)).toEqual(expectedOutput);
    });

    test("Anthropic formats basic messages correctly", () => {
      const anthropic = new Anthropic();
      const inputMessages: ChatMessage[] = [
        {
          content: "You are a helpful assistant.",
          role: "assistant",
        },
        {
          content: "Hello?",
          role: "user",
        },
      ];
      const expectedOutput: MessageParam[] = [
        {
          content: "You are a helpful assistant.",
          role: "assistant",
        },
        {
          content: "Hello?",
          role: "user",
        },
      ];

      expect(anthropic.formatMessages(inputMessages)).toEqual(expectedOutput);
    });

    test("OpenAI handles system messages correctly", () => {
      const inputMessages: ChatMessage[] = [
        { content: "You are a coding assistant", role: "system" },
        { content: "Hello", role: "user" },
      ];
      const expectedOutput = [
        { role: "system", content: "You are a coding assistant" },
        { role: "user", content: "Hello" },
      ];
      expect(OpenAI.toOpenAIMessage(inputMessages)).toEqual(expectedOutput);
    });

    test("Anthropic handles multi-turn conversation correctly", () => {
      const anthropic = new Anthropic();
      const inputMessages: ChatMessage[] = [
        { content: "Hi", role: "user" },
        { content: "Hello! How can I help?", role: "assistant" },
        { content: "What's the weather?", role: "user" },
      ];
      const expectedOutput: MessageParam[] = [
        { content: "Hi", role: "user" },
        { content: "Hello! How can I help?", role: "assistant" },
        { content: "What's the weather?", role: "user" },
      ];
      expect(anthropic.formatMessages(inputMessages)).toEqual(expectedOutput);
    });
  });

  describe("Advanced Message Formatting", () => {
    test("Anthropic filters out system messages", () => {
      const anthropic = new Anthropic();
      const inputMessages: ChatMessage[] = [
        {
          content: "You are a helpful assistant.",
          role: "assistant",
        },
        {
          content: "Hello?",
          role: "user",
        },
        {
          content: "I am a system message.",
          role: "system",
        },
        {
          content: "What is your name?",
          role: "user",
        },
      ];
      const expectedOutput: MessageParam[] = [
        {
          content: "You are a helpful assistant.",
          role: "assistant",
        },
        {
          content: "Hello?\nWhat is your name?",
          role: "user",
        },
      ];

      expect(anthropic.formatMessages(inputMessages)).toEqual(expectedOutput);
    });

    test("Anthropic merges consecutive messages from the same role", () => {
      const anthropic = new Anthropic();
      const inputMessages: ChatMessage[] = [
        {
          content: "Hello?",
          role: "user",
        },
        {
          content: "How are you?",
          role: "user",
        },
        {
          content: "I am fine, thank you!",
          role: "assistant",
        },
        {
          content: "And you?",
          role: "assistant",
        },
      ];
      const expectedOutput: MessageParam[] = [
        {
          content: "Hello?\nHow are you?",
          role: "user",
        },
        {
          content: "I am fine, thank you!\nAnd you?",
          role: "assistant",
        },
      ];

      expect(anthropic.formatMessages(inputMessages)).toEqual(expectedOutput);
    });

    test("Anthropic handles image content", () => {
      const anthropic = new Anthropic();
      const inputMessages: ChatMessage[] = [
        {
          content: [
            {
              text: "What do you see in the image?",
              type: "text",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAQDAwQDAwQEAwQFBAQFBgoHBgYGBg0JCggKDw0QEA8NDw4RExgUERIXEg4PFRwVFxkZGxsbEBQdHx0aHxgaGxr/2wBDAQQFBQYFBgwHBwwaEQ8RGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhr/wAARCAAgACADASIAAhEBAxEB/8QAGAABAAMBAAAAAAAAAAAAAAAACAQHCQb/xAAvEAABAgUCBAUDBQEAAAAAAAACAQMEBQYHERIhAAgTYSIxMkJxI2KCFBVBUVKh/8QAGAEAAwEBAAAAAAAAAAAAAAAAAwQFAQL/xAAnEQABBAECAwkAAAAAAAAAAAACAQMEEQAFMiExYRITFCJBcXKBof/aAAwDAQACEQMRAD8Aufmb5mnbWREFRdvIMZ3cWcaBh2NHUGEFwtIKQp63CX0h+S7YQgRzGSq6kgqGAS8NQRc6fmkIMWwSxJEyP+m0bwggQr5iIom6KnnxXty61jK+uJUVUxzxm/M5g5EASr6G9WGwTsIIIp2FOHJfi0kyvzS9Cv0zGwEF+2whOAUY4a6mnm2lREURLPoTggNG5tS6xpmOT4GQptwNUZc6sbexzcZRVSTKTOgudMPEL0j7E2uQNOxIqcaYcqXNaxe2HKnauBiAraDZ6n0k0tTBpPNwE9pptqDP3DtlBC1Q8qNw5K4AwLEunYkWMwcYg6fnqoH/ADPHA2/qeZWquhJJ3pODmEhmg/qGl2XAloebL5HWK/K8dOMOM7xVPfJrMhmQiq0SFXOlyPc+jIq3lwakpeYNq27K491kfvbzls07ECiSdlThhWKvj1LLx0VVLWGqSBuFJ1jc3WBEUb8K4TUieHz3xni7ea3lSZvZDhUVImxAVtBso39VdLUe0nk2a+0030n+K7YUc95/J66tRIp3SVXUpGyUI7wvPxDBoJ/UaLIuIqtuInRwiiqp4z3XbBYr3cGp9P30zJXiSjk1HLsqdIvxvzV1q8ZtB3ppa5bkwZkDz7LsF09Qxgi0Roa6UUU1LnxYH5JP74D1LUjNrkXigabc6kZM5vPFZi3NPi3dVXnFT+EQUM17IvEi1tL1xUkcEHb+lo6duvRUO644wwSDpaPWgG7sAApIKqqqm4jvxo1yvcrjdoTiqtrQ2I+u5nr19ItbUA2a5IAX3GvuP8U2ypMS5pSwFC5peTtM0lnSkMWVVUJb48a+8//Z`,
              },
            },
          ],
          role: "user",
        },
      ];
      const expectedOutput: MessageParam[] = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "What do you see in the image?",
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAQDAwQDAwQEAwQFBAQFBgoHBgYGBg0JCggKDw0QEA8NDw4RExgUERIXEg4PFRwVFxkZGxsbEBQdHx0aHxgaGxr/2wBDAQQFBQYFBgwHBwwaEQ8RGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhr/wAARCAAgACADASIAAhEBAxEB/8QAGAABAAMBAAAAAAAAAAAAAAAACAQHCQb/xAAvEAABAgUCBAUDBQEAAAAAAAACAQMEBQYHERIhAAgTYSIxMkJxI2KCFBVBUVKh/8QAGAEAAwEBAAAAAAAAAAAAAAAAAwQFAQL/xAAnEQABBAECAwkAAAAAAAAAAAACAQMEEQAFMiExYRITFCJBcXKBof/aAAwDAQACEQMRAD8Aufmb5mnbWREFRdvIMZ3cWcaBh2NHUGEFwtIKQp63CX0h+S7YQgRzGSq6kgqGAS8NQRc6fmkIMWwSxJEyP+m0bwggQr5iIom6KnnxXty61jK+uJUVUxzxm/M5g5EASr6G9WGwTsIIIp2FOHJfi0kyvzS9Cv0zGwEF+2whOAUY4a6mnm2lREURLPoTggNG5tS6xpmOT4GQptwNUZc6sbexzcZRVSTKTOgudMPEL0j7E2uQNOxIqcaYcqXNaxe2HKnauBiAraDZ6n0k0tTBpPNwE9pptqDP3DtlBC1Q8qNw5K4AwLEunYkWMwcYg6fnqoH/ADPHA2/qeZWquhJJ3pODmEhmg/qGl2XAloebL5HWK/K8dOMOM7xVPfJrMhmQiq0SFXOlyPc+jIq3lwakpeYNq27K491kfvbzls07ECiSdlThhWKvj1LLx0VVLWGqSBuFJ1jc3WBEUb8K4TUieHz3xni7ea3lSZvZDhUVImxAVtBso39VdLUe0nk2a+0030n+K7YUc95/J66tRIp3SVXUpGyUI7wvPxDBoJ/UaLIuIqtuInRwiiqp4z3XbBYr3cGp9P30zJXiSjk1HLsqdIvxvzV1q8ZtB3ppa5bkwZkDz7LsF09Qxgi0Roa6UUU1LnxYH5JP74D1LUjNrkXigabc6kZM5vPFZi3NPi3dVXnFT+EQUM17IvEi1tL1xUkcEHb+lo6duvRUO644wwSDpaPWgG7sAApIKqqqm4jvxo1yvcrjdoTiqtrQ2I+u5nr19ItbUA2a5IAX3GvuP8U2ypMS5pSwFC5peTtM0lnSkMWVVUJb48a+8//Z",
              },
            },
          ],
        },
      ];

      expect(anthropic.formatMessages(inputMessages)).toEqual(expectedOutput);
    });
  });

  describe("Tool Message Formatting", () => {
    const toolCallMessages: ChatMessage[] = [
      {
        role: "user",
        content: "What's the weather in London?",
      },
      {
        role: "assistant",
        content: "Let me check the weather.",
        options: {
          toolCall: [
            {
              id: "call_123",
              name: "weather",
              input: JSON.stringify({ location: "London" }),
            },
          ],
        },
      },
      {
        role: "tool",
        content: "The weather in London is sunny, +20°C",
        options: {
          toolResult: {
            id: "call_123",
          },
        },
      },
    ];

    test("OpenAI formats tool calls correctly", () => {
      const expectedOutput = [
        {
          role: "user",
          content: "What's the weather in London?",
        },
        {
          role: "assistant",
          content: "Let me check the weather.",
          tool_calls: [
            {
              id: "call_123",
              type: "function",
              function: {
                name: "weather",
                arguments: JSON.stringify({ location: "London" }),
              },
            },
          ],
        },
        {
          role: "tool",
          content: "The weather in London is sunny, +20°C",
          tool_call_id: "call_123",
        },
      ];

      expect(OpenAI.toOpenAIMessage(toolCallMessages)).toEqual(expectedOutput);
    });

    test("Anthropic formats tool calls correctly", () => {
      const anthropic = new Anthropic();
      const expectedOutput: MessageParam[] = [
        {
          role: "user",
          content: "What's the weather in London?",
        },
        {
          role: "assistant",
          content: [
            {
              type: "text",
              text: "Let me check the weather.",
            },
            {
              type: "tool_use",
              id: "call_123",
              name: "weather",
              input: {
                location: "London",
              },
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: "call_123",
              content: "The weather in London is sunny, +20°C",
            },
          ],
        },
      ];

      expect(anthropic.formatMessages(toolCallMessages)).toEqual(
        expectedOutput,
      );
    });

    test("OpenAI formats multiple tool calls correctly", () => {
      const multiToolMessages: ChatMessage[] = [
        {
          role: "assistant",
          content: "Let me check both weather and time.",
          options: {
            toolCall: [
              {
                id: "weather_123",
                name: "weather",
                input: JSON.stringify({ location: "London" }),
              },
              {
                id: "time_456",
                name: "time",
                input: JSON.stringify({ timezone: "GMT" }),
              },
            ],
          },
        },
      ];

      const expectedOutput = [
        {
          role: "assistant",
          content: "Let me check both weather and time.",
          tool_calls: [
            {
              id: "weather_123",
              type: "function",
              function: {
                name: "weather",
                arguments: JSON.stringify({ location: "London" }),
              },
            },
            {
              id: "time_456",
              type: "function",
              function: {
                name: "time",
                arguments: JSON.stringify({ timezone: "GMT" }),
              },
            },
          ],
        },
      ];

      expect(OpenAI.toOpenAIMessage(multiToolMessages)).toEqual(expectedOutput);
    });
  });
});
