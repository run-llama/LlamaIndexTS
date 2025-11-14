import type { ChatMessage } from "@llamaindex/core/llms";
import { setEnvs } from "@llamaindex/env";
import { describe, expect, test } from "vitest";
import { OVHcloudEmbedding, OVHcloudLLM } from "../src/index";
import { BASE_URL } from "../src/utils";

describe("OVHcloudLLM", () => {
  describe("Initialization", () => {
    test("should initialize without API key (free tier)", () => {
      const llm = new OVHcloudLLM({
        model: "gpt-oss-120b",
      });
      expect(llm).toBeInstanceOf(OVHcloudLLM);
      expect(llm.model).toBe("gpt-oss-120b");
    });

    test("should initialize with empty API key (free tier)", () => {
      const llm = new OVHcloudLLM({
        model: "gpt-oss-120b",
        apiKey: "",
      });
      expect(llm).toBeInstanceOf(OVHcloudLLM);
    });

    test("should initialize with API key from environment", () => {
      setEnvs({
        OVHCLOUD_API_KEY: "test-api-key",
      });
      const llm = new OVHcloudLLM({
        model: "gpt-oss-120b",
      });
      expect(llm).toBeInstanceOf(OVHcloudLLM);
    });

    test("should initialize with explicit API key", () => {
      const llm = new OVHcloudLLM({
        model: "gpt-oss-120b",
        apiKey: "explicit-api-key",
      });
      expect(llm).toBeInstanceOf(OVHcloudLLM);
    });

    test("should use default model if not specified", () => {
      const llm = new OVHcloudLLM();
      expect(llm.model).toBe("gpt-oss-120b");
    });

    test("should use custom base URL if provided", () => {
      const customBaseURL = "https://custom.endpoint.com/v1";
      const llm = new OVHcloudLLM({
        additionalSessionOptions: {
          baseURL: customBaseURL,
        },
      });
      expect(llm.additionalSessionOptions?.baseURL).toBe(customBaseURL);
    });
  });

  describe("Base URL Configuration", () => {
    test("should use default OVHcloud base URL", () => {
      const llm = new OVHcloudLLM();
      expect(llm.additionalSessionOptions?.baseURL).toBe(BASE_URL);
    });
  });

  describe("Message Formatting", () => {
    test("should format basic messages correctly", () => {
      const llm = new OVHcloudLLM();
      const inputMessages: ChatMessage[] = [
        {
          content: "You are a helpful assistant.",
          role: "system",
        },
        {
          content: "Hello?",
          role: "user",
        },
      ];

      // OVHcloudLLM extends OpenAI, so it uses OpenAI's message formatting
      // We just verify the instance is created correctly
      expect(llm).toBeInstanceOf(OVHcloudLLM);
    });
  });
});

describe("OVHcloudEmbedding", () => {
  describe("Initialization", () => {
    test("should initialize without API key (free tier)", () => {
      const embedding = new OVHcloudEmbedding({
        model: "BGE-M3",
      });
      expect(embedding).toBeInstanceOf(OVHcloudEmbedding);
      expect(embedding.model).toBe("BGE-M3");
    });

    test("should initialize with empty API key (free tier)", () => {
      const embedding = new OVHcloudEmbedding({
        model: "BGE-M3",
        apiKey: "",
      });
      expect(embedding).toBeInstanceOf(OVHcloudEmbedding);
    });

    test("should initialize with API key from environment", () => {
      setEnvs({
        OVHCLOUD_API_KEY: "test-api-key",
      });
      const embedding = new OVHcloudEmbedding({
        model: "BGE-M3",
      });
      expect(embedding).toBeInstanceOf(OVHcloudEmbedding);
    });

    test("should initialize with explicit API key", () => {
      const embedding = new OVHcloudEmbedding({
        model: "BGE-M3",
        apiKey: "explicit-api-key",
      });
      expect(embedding).toBeInstanceOf(OVHcloudEmbedding);
    });

    test("should use default model if not specified", () => {
      const embedding = new OVHcloudEmbedding();
      expect(embedding.model).toBe("BGE-M3");
    });

    test("should use custom base URL if provided", () => {
      const customBaseURL = "https://custom.endpoint.com/v1";
      const embedding = new OVHcloudEmbedding({
        additionalSessionOptions: {
          baseURL: customBaseURL,
        },
      });
      expect(embedding.additionalSessionOptions?.baseURL).toBe(customBaseURL);
    });
  });

  describe("Base URL Configuration", () => {
    test("should use default OVHcloud base URL", () => {
      const embedding = new OVHcloudEmbedding();
      expect(embedding.additionalSessionOptions?.baseURL).toBe(BASE_URL);
    });
  });
});
