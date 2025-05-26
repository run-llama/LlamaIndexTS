# CLAUDE.md - Elasticsearch Vector Store Example

This example demonstrates how to use Elasticsearch as a vector store with LlamaIndex.TS for semantic search and retrieval-augmented generation (RAG).

## Overview

This example shows how to:

- Configure Elasticsearch as a vector store using `@llamaindex/elastic-search`
- Use Google Gemini models for embeddings and text generation
- Store document embeddings in Elasticsearch
- Perform semantic queries against the vector store

## Prerequisites

### Elasticsearch Setup

You need access to an Elasticsearch cluster with vector search capabilities:

1. **Elasticsearch Cloud**: Create an account at [elastic.co](https://cloud.elastic.co)
2. **Self-hosted**: Run Elasticsearch 8.0+ with vector search features enabled

### Environment Variables

Set the required environment variables:

```bash
export ES_CLOUD_ID="your-elasticsearch-cloud-id"    # For Elasticsearch Cloud
export ES_API_KEY="your-elasticsearch-api-key"      # API key for authentication
export GOOGLE_API_KEY="your-google-api-key"         # For Gemini models
```

For self-hosted Elasticsearch, you can also use:

```bash
export ES_URL="https://localhost:9200"              # Elasticsearch URL
export ES_USERNAME="elastic"                        # Username
export ES_PASSWORD="your-password"                  # Password
```

## Running the Example

```bash
# Install dependencies (from project root)
pnpm install

# Run the example
npm start
# or
npx tsx index.ts
```

## Code Breakdown

### 1. Model Configuration

The example uses Google Gemini models:

- **Embedding Model**: `TEXT_EMBEDDING_004` for converting text to vector embeddings
- **LLM**: `GEMINI_PRO_1_5_FLASH` for text generation and query responses

### 2. Vector Store Initialization

```typescript
const vectorStore = new ElasticSearchVectorStore({
  indexName: "llamaindex-demo",
  esCloudId: process.env.ES_CLOUD_ID,
  esApiKey: process.env.ES_API_KEY,
});
```

### 3. Document Indexing

Sample documents are created with metadata and indexed into Elasticsearch:

- Text content is automatically converted to embeddings
- Metadata (source, author) is stored for filtering and retrieval

### 4. Semantic Querying

The example performs a semantic search query: "What is vector search?" which will find relevant documents based on semantic similarity rather than keyword matching.

## Key Features Demonstrated

- **Vector Storage**: Documents are converted to embeddings and stored in Elasticsearch
- **Metadata Support**: Documents include metadata for enhanced retrieval
- **Semantic Search**: Queries use vector similarity rather than keyword matching
- **RAG Pipeline**: Retrieved documents are used to generate contextual responses

## Elasticsearch Configuration Options

The `ElasticSearchVectorStore` supports various configuration options:

```typescript
const vectorStore = new ElasticSearchVectorStore({
  indexName: "my-index", // Elasticsearch index name
  esCloudId: "cloud-id", // For Elasticsearch Cloud
  esApiKey: "api-key", // API key authentication
  // Alternative for self-hosted:
  // esUrl: "https://localhost:9200",
  // esUsername: "elastic",
  // esPassword: "password",

  // Optional settings:
  similarity: "cosine", // Vector similarity metric
  vectorField: "embedding", // Field name for vectors
  textField: "text", // Field name for text content
});
```

## Index Management

The vector store will automatically:

- Create the Elasticsearch index if it doesn't exist
- Configure appropriate mappings for vector and text fields
- Handle document insertion and retrieval

## Advanced Usage

For production usage, consider:

1. **Index Templates**: Define custom Elasticsearch index templates for specific mapping requirements
2. **Filtering**: Use metadata filters to restrict search scope
3. **Hybrid Search**: Combine vector search with traditional keyword search
4. **Batch Operations**: Use bulk indexing for large document collections
5. **Index Lifecycle**: Implement proper index rotation and cleanup strategies

## Troubleshooting

Common issues and solutions:

1. **Connection Errors**: Verify Elasticsearch credentials and network connectivity
2. **Index Creation**: Ensure proper permissions for index creation and management
3. **Vector Dimensions**: Verify embedding model output dimensions match Elasticsearch mapping
4. **Memory Usage**: Monitor Elasticsearch cluster resources for large vector datasets

## Related Examples

See other storage examples in the parent directory:

- `../pinecone-vector-store/` - Pinecone vector store integration
- `../chromadb/` - ChromaDB vector store example
- `../qdrantdb/` - Qdrant vector store example
