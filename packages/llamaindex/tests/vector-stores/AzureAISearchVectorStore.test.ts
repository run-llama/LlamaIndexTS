/* eslint-disable @typescript-eslint/no-explicit-any */

import { SearchClient, SearchIndexClient } from "@azure/search-documents";
import { afterEach, beforeEach } from "node:test";
import { describe, expect, it, vi } from "vitest";
import { AzureAISearchVectorStore } from "../../src/vector-store.js";

// We test only for the initialization of the store, and the search and index clients, will variants of the options provided
const MOCK_ENDPOINT = "https://test-endpoint.com";
const originaProcessEnv = process.env;

function createMockSearchClient() {
  const client = Object.create(SearchClient.prototype) as SearchClient<any>;
  Object.defineProperties(client, {
    indexName: { value: "test-index", configurable: false },
  });
  client.indexDocuments = vi.fn();
  client.search = vi.fn().mockResolvedValue({
    results: [],
  });
  return client;
}

function createMockIndexClient() {
  const client = Object.create(
    SearchIndexClient.prototype,
  ) as SearchIndexClient;
  Object.defineProperties(client, {
    indexName: { value: "test-index", configurable: false },
  });

  client.getSearchClient = vi.fn().mockReturnValue(createMockSearchClient());
  return client;
}

describe("AzureAISearchVectorStore options via constructor", () => {
  describe("search client", () => {
    // test instance creation
    it("should initialize searchClient correctly", async () => {
      const searchClient = createMockSearchClient();
      const store = new AzureAISearchVectorStore({
        endpoint: MOCK_ENDPOINT,
        searchClient,
      } as any);

      expect(store).toBeDefined();
      expect(store.client()).toBe(searchClient);
    });

    // test missing endpoint
    it("should throw if endpoint is missing", async () => {
      expect(() => new AzureAISearchVectorStore({} as any)).toThrow(
        "options.endpoint must be provided or set as an environment variable: AZURE_AI_SEARCH_ENDPOINT",
      );
    });

    // test missing indexName
    it("should throw if indexName is missing", async () => {
      expect(
        () => new AzureAISearchVectorStore({ endpoint: MOCK_ENDPOINT } as any),
      ).toThrow("options.indexName must be provided");
    });

    // if search client is provided, and indexName is provided, it should throw an error
    it("should not throw if searchClient and indexName are provided", async () => {
      const searchClient = createMockSearchClient();
      expect(
        () =>
          new AzureAISearchVectorStore({
            endpoint: MOCK_ENDPOINT,
            searchClient,
            indexName: "abc",
          } as any),
      ).toThrow(
        "options.indexName cannot be supplied if using options.searchClient",
      );
    });
  });

  describe("index client", () => {
    it("should initialize indexClient correctly", async () => {
      const indexClient = createMockIndexClient();
      const store = new AzureAISearchVectorStore({
        indexClient,
        endpoint: MOCK_ENDPOINT,
        indexName: "abc",
      } as any);

      expect(store).toBeDefined();
      expect(store.indexClient()).toBe(indexClient);
    });

    it("should throw if endpoint is missing", async () => {
      expect(() => new AzureAISearchVectorStore({} as any)).toThrow(
        "options.endpoint must be provided or set as an environment variable: AZURE_AI_SEARCH_ENDPOINT",
      );
    });

    it("should throw if indexName is missing", async () => {
      expect(
        () => new AzureAISearchVectorStore({ endpoint: MOCK_ENDPOINT } as any),
      ).toThrow("options.indexName must be provided");
    });

    it("should not throw if indexClient and indexName are provided", async () => {
      const indexClient = createMockIndexClient();
      expect(
        () =>
          new AzureAISearchVectorStore({
            endpoint: MOCK_ENDPOINT,
            indexClient,
            indexName: "abc",
          } as any),
      ).not.toThrow();
    });

    it("should throw if indexClient is provided, and indexName is missing", async () => {
      const indexClient = createMockIndexClient();
      expect(
        () =>
          new AzureAISearchVectorStore({
            endpoint: MOCK_ENDPOINT,
            indexClient,
          } as any),
      ).toThrow("options.indexName must be provided");
    });
  });
});

describe("AzureAISearchVectorStore options via environment variables", () => {
  describe("search client", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      delete process.env.AZURE_AI_SEARCH_ENDPOINT;
      delete process.env.AZURE_AI_SEARCH_KEY;
    });
    afterEach(() => {
      process.env = originaProcessEnv;
    });
    it("should initialize searchClient correctly", async () => {
      process.env.AZURE_AI_SEARCH_ENDPOINT = MOCK_ENDPOINT;

      const store = new AzureAISearchVectorStore({
        indexName: "abc",
      } as any);

      expect(store).toBeDefined();
      expect(store.client()).toBeInstanceOf(SearchClient);
    });

    it("should throw if AZURE_AI_SEARCH_ENDPOINT is missing", async () => {
      delete process.env.AZURE_AI_SEARCH_ENDPOINT;
      expect(
        () => new AzureAISearchVectorStore({ indexName: "abc" } as any),
      ).toThrow(
        "options.endpoint must be provided or set as an environment variable: AZURE_AI_SEARCH_ENDPOINT",
      );
    });

    it("should not throw if indexName and searchClient are both not provided", async () => {
      expect(
        () =>
          new AzureAISearchVectorStore({
            endpoint: MOCK_ENDPOINT,
            indexName: undefined,
            searchClient: undefined,
          } as any),
      ).toThrow("options.indexName must be provided");
    });

    it("should not throw if searchClient and indexName are provided", async () => {
      const searchClient = createMockSearchClient();
      expect(
        () =>
          new AzureAISearchVectorStore({
            endpoint: MOCK_ENDPOINT,
            searchClient,
            indexName: "abc",
          } as any),
      ).toThrow(
        "options.indexName cannot be supplied if using options.searchClient",
      );
    });
  });

  describe("index client", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      delete process.env.AZURE_AI_SEARCH_ENDPOINT;
      delete process.env.AZURE_AI_SEARCH_KEY;
    });
    afterEach(() => {
      process.env = originaProcessEnv;
    });
    it("should initialize indexClient correctly", async () => {
      process.env.AZURE_AI_SEARCH_ENDPOINT = MOCK_ENDPOINT;
      const store = new AzureAISearchVectorStore({
        indexName: "abc",
      } as any);

      expect(store).toBeDefined();
      expect(store.indexClient()).toBeInstanceOf(SearchIndexClient);
    });

    it("should throw if AZURE_AI_SEARCH_ENDPOINT is not a valid URL", async () => {
      process.env.AZURE_AI_SEARCH_ENDPOINT = "abc";
      expect(
        () => new AzureAISearchVectorStore({ indexName: "abc" } as any),
      ).toThrow("options.endpoint must be a valid URL.");
    });

    it("should throw if indexName is missing", async () => {
      process.env.AZURE_AI_SEARCH_ENDPOINT = MOCK_ENDPOINT;
      expect(() => new AzureAISearchVectorStore({})).toThrow(
        "options.indexName must be provided",
      );
    });

    it("should not throw if indexClient and indexName are provided", async () => {
      const indexClient = createMockIndexClient();
      expect(
        () =>
          new AzureAISearchVectorStore({
            endpoint: MOCK_ENDPOINT,
            indexClient,
            indexName: "abc",
          } as any),
      ).not.toThrow();
    });
  });
});
