import type { ChatMessage, MessageContentDetail } from "@llamaindex/core/llms";
import type { MemoryMessage, VercelMessage } from "@llamaindex/core/memory";
import { VercelMessageAdapter } from "@llamaindex/core/memory";
import { describe, expect, test } from "vitest";

describe("VercelMessageAdapter", () => {
  const adapter = new VercelMessageAdapter();

  describe("toLlamaIndexMessage", () => {
    test("should convert basic Vercel message to LlamaIndex message", () => {
      const vercelMessage: VercelMessage = {
        id: "test-id",
        role: "user",
        content: "Hello, world!",
        parts: [{ type: "text", text: "Hello, world!" }],
        createdAt: new Date(),
        annotations: [],
      };

      const result = adapter.toMemory(vercelMessage);

      expect(result).toEqual({
        id: "test-id",
        role: "user",
        content: "Hello, world!",
        annotations: [],
        createdAt: vercelMessage.createdAt,
      });
    });

    test("should handle all supported Vercel message roles", () => {
      const roles: Array<VercelMessage["role"]> = [
        "system",
        "user",
        "assistant",
        "data",
      ];

      roles.forEach((role) => {
        const vercelMessage: VercelMessage = {
          id: "test-id",
          role,
          content: `Message from ${role}`,
          parts: [{ type: "text", text: `Message from ${role}` }],
          createdAt: new Date(),
          annotations: [],
        };

        const result = adapter.toMemory(vercelMessage);

        // Data role should be mapped to user
        const expectedRole = role === "data" ? "user" : role;
        expect(result.role).toBe(expectedRole);
        expect(result.content).toBe(`Message from ${role}`);
      });
    });

    test("should convert file parts to MessageContent", () => {
      const vercelMessage: VercelMessage = {
        id: "test-id",
        role: "user",
        content: "File message",
        parts: [
          { type: "file", data: "base64data", mimeType: "image/png" },
          { type: "text", text: "Description" },
        ],
        createdAt: new Date(),
        annotations: [],
      };

      const result = adapter.toMemory(vercelMessage);

      expect(result.content).toEqual([
        { type: "file", data: "base64data", mimeType: "image/png" },
        { type: "text", text: "Description" },
      ]);
    });

    test("should handle empty parts array", () => {
      const vercelMessage: VercelMessage = {
        id: "test-id",
        role: "user",
        content: "Fallback content",
        parts: [],
        createdAt: new Date(),
        annotations: [],
      };

      const result = adapter.toMemory(vercelMessage);

      expect(result.content).toBe("Fallback content");
    });

    test("should handle single text part", () => {
      const vercelMessage: VercelMessage = {
        id: "test-id",
        role: "user",
        content: "Original content",
        parts: [{ type: "text", text: "Single text part" }],
        createdAt: new Date(),
        annotations: [],
      };

      const result = adapter.toMemory(vercelMessage);

      expect(result.content).toBe("Single text part");
    });
  });

  describe("toUIMessage", () => {
    test("should convert basic MemoryMessage to Vercel message", () => {
      const memoryMessage: MemoryMessage = {
        id: "test-id",
        role: "user",
        content: "Hello, LlamaIndex!",
        createdAt: new Date(),
        annotations: [],
      };

      const result = adapter.fromMemory(memoryMessage);

      expect(result).toMatchObject({
        id: "test-id",
        role: "user",
        content: "Hello, LlamaIndex!",
        parts: [{ type: "text", text: "Hello, LlamaIndex!" }],
        annotations: [],
      });
    });

    test("should convert MemoryMessage with options to Vercel message", () => {
      const createdAt = new Date();
      const annotations = ["test"];

      const memoryMessage: MemoryMessage = {
        id: "test-id",
        role: "user",
        content: "Hello, LlamaIndex!",
        createdAt,
        annotations,
      };

      const result = adapter.fromMemory(memoryMessage);

      expect(result).toMatchObject({
        role: "user",
        content: "Hello, LlamaIndex!",
        parts: [{ type: "text", text: "Hello, LlamaIndex!" }],
        id: "test-id",
        createdAt,
        annotations,
      });
    });

    test("should handle all MemoryMessage roles", () => {
      const roles: Array<MemoryMessage["role"]> = [
        "user",
        "assistant",
        "system",
        "memory",
        "developer",
      ];

      roles.forEach((role) => {
        const memoryMessage: MemoryMessage = {
          id: "test-id",
          role,
          content: `Message from ${role}`,
          createdAt: new Date(),
          annotations: [],
        };

        const result = adapter.fromMemory(memoryMessage);

        // Memory role should be mapped to system, developer to user
        let expectedRole: VercelMessage["role"];
        switch (role) {
          case "memory":
            expectedRole = "system";
            break;
          case "developer":
            expectedRole = "user";
            break;
          default:
            expectedRole = role as VercelMessage["role"];
        }

        expect(result.role).toBe(expectedRole);
        expect(result.content).toBe(`Message from ${role}`);
      });
    });

    test("should convert multi-modal content to parts", () => {
      const memoryMessage: MemoryMessage = {
        id: "test-id",
        role: "user",
        content: [
          { type: "text", text: "Text content" },
          {
            type: "image_url",
            image_url: { url: "https://example.com/image.jpg" },
          },
          { type: "file", data: "base64data", mimeType: "application/pdf" },
        ] as MessageContentDetail[],
      };

      const result = adapter.fromMemory(memoryMessage);

      expect(result.parts).toEqual([
        { type: "text", text: "Text content" },
        { type: "text", text: "[Image URL: https://example.com/image.jpg]" },
        { type: "file", data: "base64data", mimeType: "file" },
      ]);
      expect(result.content).toBe("Text content");
    });

    test("should handle different media types", () => {
      const memoryMessage: MemoryMessage = {
        id: "test-id",
        role: "user",
        content: [
          { type: "audio", data: "audio-data", mimeType: "audio/mp3" },
          { type: "video", data: "video-data", mimeType: "video/mp4" },
          { type: "image", data: "image-data", mimeType: "image/png" },
        ] as MessageContentDetail[],
      };

      const result = adapter.fromMemory(memoryMessage);

      expect(result.parts).toEqual([
        { type: "file", data: "audio-data", mimeType: "audio" },
        { type: "file", data: "video-data", mimeType: "video" },
        { type: "file", data: "image-data", mimeType: "image" },
      ]);
    });

    test("should handle unknown content types", () => {
      const memoryMessage: MemoryMessage = {
        id: "test-id",
        role: "user",
        content: [
          {
            type: "unknown",
            data: "unknown-data",
          } as unknown as MessageContentDetail,
        ],
      };

      const result = adapter.fromMemory(memoryMessage);

      expect(result.parts).toEqual([
        {
          type: "text",
          text: JSON.stringify({ type: "unknown", data: "unknown-data" }),
        },
      ]);
    });
  });

  describe("isVercelMessage", () => {
    test("should return true for valid Vercel message", () => {
      const validMessage: VercelMessage = {
        id: "test-id",
        role: "user",
        content: "Test content",
        parts: [],
        createdAt: new Date(),
        annotations: [],
      };

      expect(adapter.isCompatible(validMessage)).toBe(true);
    });

    test("should return true for all valid roles", () => {
      const roles: Array<VercelMessage["role"]> = [
        "system",
        "user",
        "assistant",
        "data",
      ];

      roles.forEach((role) => {
        const message = {
          id: "test-id",
          role,
          content: "Test content",
          parts: [],
        };

        expect(adapter.isCompatible(message)).toBe(true);
      });
    });
  });

  describe("isLlamaIndexMessage", () => {
    test("should return true for valid LlamaIndex message", () => {
      const validMessage: ChatMessage = {
        role: "user",
        content: "Test content",
      };

      expect(adapter.isCompatible(validMessage)).toBe(false);
    });

    test("should return true for all valid roles", () => {
      const roles: Array<ChatMessage["role"]> = [
        "user",
        "assistant",
        "system",
        "memory",
        "developer",
      ];

      roles.forEach((role) => {
        const message = {
          role,
          content: "Test content",
        };

        expect(adapter.isCompatible(message)).toBe(false);
      });
    });

    test("should return false for invalid message structures", () => {
      const invalidMessages = [
        null,
        undefined,
        "string",
        123,
        {},
        { role: "user" }, // missing content
        { content: "test" }, // missing role
        { role: "invalid", content: "test" }, // invalid role
        { role: "user", content: 123 }, // invalid content type (not string or array)
      ];

      invalidMessages.forEach((message) => {
        expect(adapter.isCompatible(message)).toBe(false);
      });
    });
  });

  describe("edge cases and error handling", () => {
    test("should handle conversion with undefined optional fields", () => {
      const vercelMessage = {
        id: "test-id",
        role: "user" as const,
        content: "Test content",
        parts: [{ type: "text" as const, text: "Test content" }],
        // missing optional fields
      };

      const result = adapter.toMemory(vercelMessage);
      expect(result.role).toBe("user");
      expect(result.content).toBe("Test content");
    });

    test("should handle empty string content", () => {
      const memoryMessage: MemoryMessage = {
        id: "test-id",
        role: "user",
        content: "",
      };

      const result = adapter.fromMemory(memoryMessage);
      expect(result.content).toBe("");
      expect(result.parts).toEqual([{ type: "text", text: "" }]);
    });

    test("should handle empty array content", () => {
      const memoryMessage: MemoryMessage = {
        id: "test-id",
        role: "user",
        content: [],
      };

      const result = adapter.fromMemory(memoryMessage);
      expect(result.content).toBe("");
      expect(result.parts).toEqual([]);
    });

    test("should generate unique IDs", () => {
      const memoryMessage: MemoryMessage = {
        id: "test-id",
        role: "user",
        content: "Test",
      };

      const result1 = adapter.fromMemory(memoryMessage);
      const result2 = adapter.toMemory(result1);

      // Both should have valid UUIDs (they will be different)
      expect(typeof result1.id).toBe("string");
      expect(result1.id.length).toBeGreaterThan(0);
    });
  });
});
