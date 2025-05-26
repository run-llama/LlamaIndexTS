# CLAUDE.md - JinaAI Provider Package

This package provides JinaAI embedding integration for LlamaIndex.TS.

## Package Overview

The `@llamaindex/jinaai` package is a provider implementation that integrates Jina AI's embedding models with the LlamaIndex.TS framework. It implements the `MultiModalEmbedding` interface from `@llamaindex/core/embeddings` to provide both text and image embedding capabilities.

## Key Components

### JinaAIEmbedding Class (`src/embedding.ts:44`)

The main class that extends `MultiModalEmbedding` and provides:

- **Text Embeddings**: Single and batch text embedding generation
- **Image Embeddings**: Single and batch image embedding generation (multimodal support)
- **Configurable Options**: Task types, encoding types, dimensions, and late chunking

### Configuration Options

- `apiKey`: JinaAI API key (from `JINAAI_API_KEY` environment variable)
- `model`: Embedding model (default: "jina-embeddings-v3")
- `baseURL`: API endpoint (default: "https://api.jina.ai/v1/embeddings")
- `task`: Task type for embeddings (`src/embedding.ts:11-16`)
- `encodingType`: Float, binary, or ubinary encoding (`src/embedding.ts:17`)
- `dimensions`: Output dimension size
- `late_chunking`: Late chunking optimization
- `embedBatchSize`: Batch size for processing multiple embeddings

### Supported Models

- **Text Models**: "jina-embeddings-v3" (default)
- **Multimodal Models**: "jina-clip-v1" (supports both text and images)

## API Features

### Text Embedding Methods

- `getTextEmbedding(text: string)`: Single text embedding
- `getTextEmbeddings(texts: string[])`: Batch text embeddings

### Image Embedding Methods

- `getImageEmbedding(image: ImageType)`: Single image embedding
- `getImageEmbeddings(images: ImageType[])`: Batch image embeddings

### Image Input Support

The package handles various image input types:

- Local file paths (converted to base64)
- Blob objects (converted to base64)
- Remote URLs (passed directly)

## Usage Example

```typescript
import { JinaAIEmbedding } from "@llamaindex/jinaai";

// Text embeddings
const embedding = new JinaAIEmbedding({
  model: "jina-embeddings-v3",
  task: "retrieval.passage",
});

// Image embeddings (requires multimodal model)
const clipEmbedding = new JinaAIEmbedding({
  model: "jina-clip-v1",
});
```

## Development Commands

From this package directory:

- `pnpm build` - Build the package using bunchee
- `pnpm dev` - Build in watch mode

From workspace root:

- `turbo run build --filter="@llamaindex/jinaai"` - Build this package only
- `turbo run test --filter="@llamaindex/jinaai"` - Test this package only

## Dependencies

- `@llamaindex/core` - Core embedding interfaces and utilities
- `@llamaindex/env` - Environment variable access
- `@llamaindex/openai` - Additional OpenAI integration (workspace dependency)

## Environment Variables

- `JINAAI_API_KEY` - Required API key for Jina AI service

## Error Handling

The package validates:

- API key presence during initialization
- Model compatibility for multimodal embeddings (images require `jina-clip-v1`)
- HTTP response status and provides detailed error messages

## Integration Notes

This package follows the LlamaIndex.TS provider pattern:

- Implements standard embedding interfaces from `@llamaindex/core`
- Supports both CJS and ESM builds via bunchee
- Uses workspace dependencies for core functionality
- Minimal external dependencies for reduced bundle size
