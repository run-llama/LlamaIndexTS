// mockCosmosClient.ts
import { vi } from "vitest";

export const createMockClient = (mockData?: any[]) => {
  let id = 0;
  const client = {
    database: vi.fn().mockReturnValue({
      container: vi.fn().mockReturnValue({
        items: {
          create: vi.fn().mockImplementation((doc: any) => ({
            resource: { id: doc.id ?? `${id++}` },
          })),
          query: vi.fn().mockReturnThis(),
          fetchAll: vi.fn().mockImplementation(() => ({
            resources: mockData
              ? mockData
              : Array(id)
                  .fill(0)
                  .map((_, i) => ({ id: i })),
          })),
        },
        item: vi.fn().mockReturnThis(),
        delete: vi.fn(),
      }),
    }),
    databases: {
      createIfNotExists: vi.fn().mockReturnThis(),
      get database() {
        return this;
      },
      containers: {
        createIfNotExists: vi.fn().mockReturnThis(),
        get container() {
          return this;
        },
        items: {
          create: vi.fn().mockImplementation((doc: any) => ({
            resource: { id: doc.id ?? `${id++}` },
          })),
          query: vi.fn().mockReturnThis(),
          fetchAll: vi.fn().mockImplementation(() => ({
            resources: Array(id)
              .fill(0)
              .map((_, i) => ({ id: i })),
          })),
        },
        item: vi.fn().mockReturnThis(),
        delete: vi.fn(),
      },
    },
  };
  return client;
};
