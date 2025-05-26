# CLAUDE.md - Supabase Vector Store Example

This example demonstrates how to use Supabase as a vector store with LlamaIndex.TS for semantic search and retrieval-augmented generation (RAG).

## Overview

This example shows:

- Setting up SupabaseVectorStore with environment configuration
- Using Google Gemini models for embeddings and LLM operations
- Creating documents with metadata for storage and retrieval
- Building a VectorStoreIndex backed by Supabase
- Performing semantic queries against the stored documents

## Prerequisites

### Environment Variables

Set the following environment variables before running:

```bash
export SUPABASE_URL="your-supabase-project-url"
export SUPABASE_KEY="your-supabase-anon-key"
export GOOGLE_API_KEY="your-google-api-key"  # For Gemini models
```

### Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Enable the vector extension in your database
3. Create a table for document storage (the example uses table name "document")
4. Obtain your project URL and anon key from the project settings

## Running the Example

```bash
# Install dependencies (from project root)
pnpm install

# Run the example
npm start
# or
npx tsx index.ts
```

## Code Structure

### Key Components

**Vector Store Configuration:**

- Uses `SupabaseVectorStore` from `@llamaindex/supabase`
- Configured with project URL, API key, and table name
- Supports document deletion and management

**Model Setup:**

- **Embeddings**: Google Gemini TEXT_EMBEDDING_004 model
- **LLM**: Google Gemini Pro 1.5 Flash model
- Configured through `Settings.embedModel` and `Settings.llm`

**Document Processing:**

- Creates sample documents with text content and metadata
- Metadata includes source and author information for filtering
- Documents are processed into embeddings and stored in Supabase

**Query Engine:**

- Builds VectorStoreIndex from documents using Supabase storage
- Creates query engine for semantic search
- Supports natural language queries with vector similarity search

## Features Demonstrated

### Vector Storage

- Document ingestion with automatic embedding generation
- Metadata preservation for filtering and context
- Persistent storage in Supabase PostgreSQL with vector extension

### Semantic Search

- Natural language query processing
- Vector similarity search for relevant document retrieval
- Context-aware response generation using retrieved documents

### Storage Management

- Document deletion capabilities (shown in commented code)
- Configurable table names for organization
- Integration with Supabase's scalable infrastructure

## Dependencies

- `@llamaindex/supabase` - Supabase vector store integration
- `@llamaindex/google` - Google Gemini models for embeddings and LLM
- `llamaindex` - Core LlamaIndex functionality
- Supabase project with vector extension enabled

## Usage Notes

1. **Database Setup**: Ensure your Supabase database has the vector extension enabled
2. **Table Configuration**: The example uses table name "document" - modify as needed
3. **API Costs**: Running this example will consume Google API credits for embeddings and LLM calls
4. **Storage Persistence**: Documents remain in Supabase between runs unless explicitly deleted
5. **Scaling**: Supabase vector store scales automatically with your database plan

## Common Patterns

### Custom Table Configuration

```typescript
const vectorStore = new SupabaseVectorStore({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  table: "custom_table_name",
});
```

### Document Management

```typescript
// Delete specific document by ID
await vectorStore.delete("document-uuid");

// Query with metadata filtering
const response = await queryEngine.query({
  query: "search query",
  // Additional filtering can be implemented
});
```

### Error Handling

Always include proper validation for required environment variables and handle Supabase connection errors appropriately.
