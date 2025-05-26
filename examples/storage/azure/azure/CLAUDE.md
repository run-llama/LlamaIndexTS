# CLAUDE.md - Azure AI Search Vector Store Example

This example demonstrates how to use Azure AI Search as a vector store backend with LlamaIndex.TS, including Azure OpenAI integration for LLM and embedding models.

## Overview

This example showcases:

- **Azure OpenAI integration** for both LLM and embedding models
- **Azure AI Search vector store** configuration and management
- **Document ingestion** from local files
- **Multiple search modes** (vector, hybrid, semantic hybrid)
- **Metadata filtering** (with known limitations)
- **Index management** strategies
- **Authentication** using Azure AD credentials

## Environment Setup

Create a `.env` file with the following variables:

```bash
# Azure AI Search
AZURE_AI_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
AZURE_AI_SEARCH_KEY=your-search-key

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-openai-resource.openai.azure.com/
AZURE_DEPLOYMENT_NAME=gpt-4
EMBEDDING_MODEL=text-embedding-ada-002
AZURE_API_VERSION=2024-09-01-preview
```

## Authentication

The example uses `DefaultAzureCredential` for authentication, which requires proper Azure RBAC setup:

```typescript
const credential = new DefaultAzureCredential();
const azureADTokenProvider = getBearerTokenProvider(
  credential,
  "https://cognitiveservices.azure.com/.default",
);
```

Alternative: Use API keys by uncommenting the `key` parameter in vector store configuration.

## Key Components

### Azure OpenAI Setup

```typescript
Settings.llm = new AzureOpenAI({
  azureADTokenProvider,
  deployment: process.env.AZURE_DEPLOYMENT_NAME,
});
Settings.embedModel = new AzureOpenAIEmbedding({
  azureADTokenProvider,
  deployment: process.env.EMBEDDING_MODEL,
});
```

### Vector Store Configuration

```typescript
const vectorStore = new AzureAISearchVectorStore({
  credential: new DefaultAzureCredential(),
  indexName: "llamaindex-vector-store-example",
  indexManagement: IndexManagement.CREATE_IF_NOT_EXISTS,
  embeddingDimensionality: 3072,
  vectorAlgorithmType: KnownVectorSearchAlgorithmKind.ExhaustiveKnn,
  languageAnalyzer: KnownAnalyzerNames.EnLucene,
  filterableMetadataFieldKeys: metadataFields,
});
```

### Index Management Options

- `IndexManagement.VALIDATE_INDEX` - Validates existing index, throws error if missing
- `IndexManagement.NO_VALIDATION` - Attempts to access index, throws error if missing
- `IndexManagement.CREATE_IF_NOT_EXISTS` - Creates index if it doesn't exist (recommended)

## Search Modes

The example demonstrates three search modes:

1. **Vector Search (DEFAULT)** - Pure semantic vector similarity
2. **Hybrid Search** - Combines vector and keyword search
3. **Semantic Hybrid Search** - Hybrid search with semantic reranking

```typescript
const response = await queryEngine.retrieve({
  query: "What is the meaning of life?",
  mode: VectorStoreQueryMode.HYBRID,
});
```

## Document Operations

### Loading Documents

```typescript
const documents = await new SimpleDirectoryReader().loadData(
  "data/paul_graham/",
);
const index = await VectorStoreIndex.fromDocuments(documents, {
  storageContext,
  docStoreStrategy: DocStoreStrategy.UPSERTS,
});
```

### Inserting New Documents

```typescript
await index.insert(
  new Document({
    text: "The sky is indigo today.",
  }),
);
```

### Basic Vector Store Operations

```typescript
// Add documents directly to vector store
const ids = await vectorStore.add([document]);

// Retrieve nodes by IDs
const nodes = await vectorStore.getNodes(ids);

// Delete documents
await vectorStore.delete(ids[0]);
```

## Metadata Filtering

The example includes metadata field definitions for filtering:

```typescript
const metadataFields = {
  author: "author",
  theme: ["theme", MetadataIndexFieldType.STRING],
  director: "director",
};
```

**Known Issue**: Metadata filtering currently has limitations and may throw errors like:

```
RestError: Invalid expression: Could not find a property named 'theme' on type 'search.document'.
```

## Running the Example

```bash
# Install dependencies
npm install

# Set up environment variables in .env file
# Run the example
npm start
```

## Sample Data

The example uses Paul Graham's essay "What I Worked On" located in `data/paul_graham/paul_graham_essay.txt` for demonstration purposes.

## Prerequisites

- Azure AI Search service with proper permissions
- Azure OpenAI resource with deployed models:
  - GPT-4 (or similar) for chat completion
  - text-embedding-ada-002 (or similar) for embeddings
- Azure AD authentication configured or API keys available

## Key Learnings

1. **Authentication**: Azure AD credentials provide more secure access than API keys
2. **Index Management**: `CREATE_IF_NOT_EXISTS` is the safest option for development
3. **Search Modes**: Hybrid search often provides better results than pure vector search
4. **Embedding Dimensionality**: Must match your embedding model (3072 for ada-002)
5. **Metadata Filtering**: Currently has limitations that may require workarounds

## Architecture

This example follows the standard LlamaIndex.TS pattern:

1. **Data Ingestion**: SimpleDirectoryReader → Documents
2. **Processing**: Documents → TextNodes → Embeddings
3. **Storage**: Vector Store (Azure AI Search)
4. **Querying**: QueryEngine → Retrieval → Response

The Azure integration provides enterprise-grade scalability and security through Azure's managed services.
