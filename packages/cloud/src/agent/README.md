# Agent Data API

This module provides a TypeScript client for the LlamaCloud Agent Data API, allowing you to manage and extract data from agents.

## Features

- **TypedAgentData**: Strongly typed agent data management
- **AsyncAgentDataClient**: Async-first client for agent data operations
- **ExtractedData**: Support for data extraction with retry logic
- **Full CRUD operations**: Create, read, update, delete, and list agent data
- **Batch operations**: Support for aggregation and search

## Usage

```typescript
import { createAgentDataClient } from "@llamaindex/cloud/api";

// Create client with API key
const client = createAgentDataClient({
  apiKey: "your-api-key",
  baseUrl: "https://api.cloud.llamaindex.ai/", // optional
});

// Create agent data
const agentData = await client.create({
  agentSlug: "my-agent",
  collection: "user-data", // optional
  data: {
    name: "John Doe",
    email: "john@example.com",
    preferences: {
      theme: "dark",
      language: "en",
    },
  },
});

// Get agent data by ID
const data = await client.get(agentData.id);

// Update agent data
const updated = await client.update(agentData.id, {
  data: {
    name: "John Doe",
    email: "john.doe@example.com",
    preferences: {
      theme: "light",
      language: "en",
    },
  },
});

// List agent data
const list = await client.list({
  agentSlug: "my-agent",
  collection: "user-data",
  pageSize: 10,
  filter: {
    status: { $eq: "active" },
  },
  orderBy: "created_at desc",
});

// Delete agent data
await client.delete(agentData.id);

// Extract data from agent (if supported)
const extracted = await client.extract(
  "my-agent-id",
  { query: "What is the user's theme preference?" },
  {
    timeout: 30000,
    retryCount: 3,
  },
);
```

## API Reference

### `createAgentDataClient(options?)`

Creates a new agent data client instance.

**Options:**

- `apiKey` (string, optional): LlamaCloud API key. Defaults to `LLAMA_CLOUD_API_KEY` environment variable.
- `baseUrl` (string, optional): Base URL for the API. Defaults to `https://api.cloud.llamaindex.ai/`.

### `AsyncAgentDataClient`

#### `create<T>(options: CreateAgentDataOptions<T>): Promise<TypedAgentData<T>>`

Creates new agent data.

**Options:**

- `agentSlug` (string): The agent identifier
- `collection` (string, optional): Collection name for grouping data
- `data` (T): The data to store

#### `get<T>(id: string): Promise<TypedAgentData<T> | null>`

Retrieves agent data by ID. Returns `null` if not found.

#### `update<T>(id: string, options: UpdateAgentDataOptions<T>): Promise<TypedAgentData<T>>`

Updates existing agent data.

**Options:**

- `data` (T): The new data to store

#### `delete(id: string): Promise<void>`

Deletes agent data by ID.

#### `list<T>(options: ListAgentDataOptions): Promise<TypedAgentDataItems<T>>`

Lists agent data with filtering and pagination.

**Options:**

- `agentSlug` (string): The agent identifier
- `collection` (string, optional): Collection name to filter by
- `filter` (object, optional): Filter conditions
- `orderBy` (string, optional): Sort order (e.g., "created_at desc")
- `pageSize` (number, optional): Number of items per page
- `pageToken` (string, optional): Token for pagination
- `offset` (number, optional): Offset for pagination

#### `extract<T>(agentId: string, input: unknown, options?: ExtractOptions): Promise<ExtractedData<T>>`

Extracts data from an agent (if supported).

**Options:**

- `timeout` (number, optional): Maximum time to wait for extraction
- `retryCount` (number, optional): Number of retries on failure
- `retryDelay` (number, optional): Delay between retries

## Types

### `TypedAgentData<T>`

Represents agent data with type safety.

```typescript
interface TypedAgentData<T> {
  id: string;
  agentSlug: string;
  collection?: string;
  data: T;
  createdAt: Date;
  updatedAt: Date;
}
```

### `ExtractedData<T>`

Represents extracted data from an agent.

```typescript
interface ExtractedData<T> {
  id: string;
  status: StatusType;
  data?: T;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### `StatusType`

Enum for extraction status.

```typescript
enum StatusType {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
}
```
