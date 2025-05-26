# CLAUDE.md - @llamaindex/cohere

This package provides Cohere integration for LlamaIndex.TS, specifically implementing Cohere's reranking capabilities.

## Package Overview

**Package Name:** `@llamaindex/cohere`  
**Description:** Cohere Adapter for LlamaIndex  
**Version:** 0.0.21

This is a provider package that integrates Cohere's reranking API with the LlamaIndex.TS framework.

## Architecture

### Core Components

- **CohereRerank** (`src/CohereRerank.ts`): Main class implementing `BaseNodePostprocessor` interface for document reranking

### Dependencies

- **External:** `cohere-ai` (v7.14.0) - Official Cohere SDK
- **Internal:** `@llamaindex/core` - Core LlamaIndex interfaces and utilities

## Key Features

### Document Reranking

The primary functionality is reranking search results using Cohere's rerank models:

- Implements `BaseNodePostprocessor` interface for seamless integration with LlamaIndex pipelines
- Uses Cohere's rerank API to improve search result relevance
- Supports custom model selection and configuration

### Configuration Options

- `topN`: Number of top results to return (default: 2)
- `model`: Cohere rerank model to use (default: "rerank-english-v2.0")
- `apiKey`: Required Cohere API key
- `baseUrl`: Optional custom API endpoint
- `timeout`: Optional request timeout in seconds

## Usage Pattern

```typescript
import { CohereRerank } from "@llamaindex/cohere";

const reranker = new CohereRerank({
  apiKey: "your-cohere-api-key",
  topN: 5,
  model: "rerank-english-v2.0",
});

// Use as a node postprocessor in retrieval pipeline
const rerankedNodes = await reranker.postprocessNodes(nodes, query);
```

## Implementation Details

### CohereRerank Class (`src/CohereRerank.ts:17`)

- Implements `BaseNodePostprocessor` interface
- Manages CohereClient instance for API communication
- Extracts text content from nodes using `MetadataMode.ALL`
- Maps Cohere relevance scores back to LlamaIndex `NodeWithScore` format
- Preserves original nodes while updating relevance scores

### Error Handling

- Validates API key presence during construction
- Requires query parameter for reranking operation
- Handles empty node arrays gracefully
- Validates client initialization before API calls

## Build Configuration

- Uses `bunchee` for building with dual CJS/ESM support
- Exports both CommonJS and ES module formats
- Includes TypeScript declarations for both formats
- Follows LlamaIndex.TS provider package conventions

## Development Commands

- `pnpm build` - Build the package
- `pnpm dev` - Build in watch mode

## Integration Points

This package integrates with:

- LlamaIndex.TS retrieval pipelines as a node postprocessor
- Any component that processes `NodeWithScore[]` arrays
- Query engines that benefit from result reranking
