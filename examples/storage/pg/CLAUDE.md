# CLAUDE.md - PostgreSQL Vector Store Examples

This directory demonstrates PostgreSQL vector storage integration with LlamaIndex.TS using the `@llamaindex/postgres` package and pgvector extension for similarity search and RAG applications.

## Overview

These examples showcase how to use PostgreSQL as a vector database for storing document embeddings and performing semantic search. The package includes examples for self-hosted PostgreSQL, cloud providers (Supabase, Vercel, Neon), and both document loading and querying workflows.

## File Structure

### Core Examples

- **`load-docs.ts`** - Document ingestion pipeline that reads files, generates embeddings, and stores them in PostgreSQL
- **`query.ts`** - Interactive RAG query interface with readline input for asking questions against stored embeddings
- **`pg-reader.ts`** - Demonstrates reading documents back from PostgreSQL using SimplePostgresReader

### Provider-Specific Examples

- **`supabase.ts`** - Supabase PostgreSQL integration with `POSTGRES_URL` connection string
- **`vercel.ts`** - Vercel Postgres integration using `@vercel/postgres` SDK
- **`neon.ts`** - Neon PostgreSQL integration with SSL configuration and endpoint options

## Prerequisites

### Database Setup

All examples require a PostgreSQL instance with the pgvector extension:

**Local Docker Instance:**

```bash
docker run -d --rm --name vector-db -p 5432:5432 -e "POSTGRES_HOST_AUTH_METHOD=trust" ankane/pgvector
```

**Cloud Alternatives:**

- Supabase: Managed PostgreSQL with built-in pgvector support
- Vercel Postgres: Serverless PostgreSQL for Vercel deployments
- Neon: Serverless PostgreSQL with branching capabilities
- Timescale: Time-series focused PostgreSQL service

### Environment Variables

```bash
# Standard PostgreSQL connection (used by load-docs.ts, query.ts, pg-reader.ts)
export PGHOST=localhost
export PGUSER=postgres
export PGPASSWORD=postgres
export PGDATABASE=test
export PGPORT=5432
export PG_CONNECTION_STRING="postgresql://user:password@host:port/database"

# Provider-specific connections
export POSTGRES_URL="postgresql://..." # Supabase
export POSTGRES_URL="postgres://..."   # Vercel
export ENDPOINT_ID="your-neon-endpoint" # Neon

# Required for embeddings
export OPENAI_API_KEY="sk-..."
```

## Running Examples

### Document Loading and RAG Workflow

```bash
# Load documents from a directory
npx tsx load-docs.ts ../data

# Query the loaded documents interactively
npx tsx query.ts
```

### Provider-Specific Examples

```bash
# Supabase example
npx tsx supabase.ts

# Vercel Postgres example
npx tsx vercel.ts

# Neon example
npx tsx neon.ts

# PostgreSQL reader example
npx tsx pg-reader.ts
```

## Key Components

### PGVectorStore Configuration

The examples demonstrate various `PGVectorStore` initialization patterns:

**Connection String (load-docs.ts, query.ts):**

```typescript
const pgvs = new PGVectorStore({
  clientConfig: {
    connectionString: process.env.PG_CONNECTION_STRING,
  },
});
```

**Direct Client (neon.ts, vercel.ts):**

```typescript
const vectorStore = new PGVectorStore({
  dimensions: 3,
  client: sql, // postgres client instance
});
```

**Standard Config (pg-reader.ts):**

```typescript
const vectorStore = new PGVectorStore({
  clientConfig: {
    host: "localhost",
    port: 5432,
    database: "test",
    user: "postgres",
    password: "postgres",
  },
  dimensions: 3,
  tableName: "llamaindex_vector",
});
```

### Document Processing Pipeline

1. **Document Reading**: Uses `SimpleDirectoryReader` to load files from directory
2. **Embedding Generation**: Automatic embedding creation via OpenAI (configurable)
3. **Vector Storage**: Embeddings stored in PostgreSQL with metadata
4. **Index Creation**: `VectorStoreIndex.fromDocuments()` creates searchable index
5. **Query Engine**: `index.asQueryEngine()` enables RAG queries

### Collections and Data Management

```typescript
// Set collection name for data organization
pgvs.setCollection(sourceDir);

// Clear existing data before loading
await pgvs.clearCollection();
```

## Usage Patterns

### Full RAG Pipeline (load-docs.ts)

```typescript
// Load documents
const docs = await rdr.loadData({ directoryPath: sourceDir });

// Create vector store with collection
const pgvs = new PGVectorStore({ clientConfig });
pgvs.setCollection(sourceDir);
await pgvs.clearCollection();

// Build index and store embeddings
const ctx = await storageContextFromDefaults({ vectorStore: pgvs });
const index = await VectorStoreIndex.fromDocuments(docs, {
  storageContext: ctx,
});
```

### Interactive Querying (query.ts)

```typescript
// Load existing vector store
const index = await VectorStoreIndex.fromVectorStore(pgvs);
const queryEngine = await index.asQueryEngine();

// Interactive Q&A loop
const answer = await queryEngine.query({ query: question });
console.log(answer.response);
```

### Direct Vector Operations (neon.ts, vercel.ts)

```typescript
// Add documents with pre-computed embeddings
await vectorStore.add([
  new Document({
    text: "hello, world",
    embedding: [1, 2, 3],
  }),
]);

// Direct similarity search
const results = await vectorStore.query({
  mode: VectorStoreQueryMode.DEFAULT,
  similarityTopK: 1,
  queryEmbedding: [1, 2, 3],
});
```

## Error Handling

All examples include error handling for common issues:

- Missing environment variables
- Database connection failures
- Invalid embeddings or documents
- Provider-specific authentication errors

## Dependencies

Key packages used across examples:

- `@llamaindex/postgres` - PostgreSQL vector store implementation
- `@llamaindex/readers/directory` - File system document reader
- `@llamaindex/openai` - OpenAI embeddings (implicit via Settings)
- `llamaindex` - Core LlamaIndex functionality
- Provider-specific SDKs: `@vercel/postgres`, `postgres` (for Neon)

## Integration Notes

- **pgvector Extension**: Required for vector similarity operations
- **SSL Configuration**: Properly configured for cloud providers (Neon, Supabase)
- **Connection Pooling**: Handled automatically by underlying client libraries
- **Schema Management**: Vector store creates tables automatically
- **Metadata Support**: Full metadata storage and retrieval capabilities
- **Multi-tenancy**: Collection-based data organization support
