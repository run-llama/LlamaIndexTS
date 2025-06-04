import { Settings } from "@llamaindex/core/global";
import { vi } from "vitest";

// Mock embedding model
export const mockEmbedding = {
  getTextEmbedding: vi.fn(() => Promise.resolve([0.1, 0.2, 0.3])),
  getTextEmbeddings: vi.fn(() => Promise.resolve([[0.1, 0.2, 0.3]])),
};

// Mock weaviate collection
export const mockCollection = {
  data: {
    insertMany: vi.fn(),
  },
  config: {
    get: vi.fn(() => Promise.resolve({ properties: [] })),
  },
};

// Mock weaviate client
export const mockClient = {
  collections: {
    exists: vi.fn(() => Promise.resolve(true)),
    get: vi.fn(() => mockCollection),
    createFromSchema: vi.fn(() => Promise.resolve(mockCollection)),
  },
};

// Setup embedding model for tests
export const setupMockEmbedding = () => {
  (Settings as unknown as { embedModel: typeof mockEmbedding }).embedModel =
    mockEmbedding;
};
