# CLAUDE.md - Examples Package

This directory contains comprehensive examples demonstrating LlamaIndex.TS functionality across different use cases and integrations.

## Running Examples

All examples are executable TypeScript files that can be run directly:

```bash
# Run a specific example
npx tsx ./rag/starter.ts
npx tsx ./agents/agent/single-agent.ts
npx tsx ./models/openai/openai.ts

# Or use the package script
npm start  # runs ./starter.ts (if it exists)
```

## Environment Setup

Most examples require API keys. Set environment variables before running:

```bash
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-..."
export PINECONE_API_KEY="..."
# Add other provider keys as needed
```

## Example Categories

### Agents (`agents/`)

Demonstrates agent functionality and workflows:

- **`agent/`** - Modern agent implementations using `@llamaindex/workflow`
  - `single-agent.ts` - Basic agent with tool usage
  - `multiple-agents.ts` - Multi-agent coordination
  - `blog-writer.ts` - Content generation agent
  - `with-anthropic.ts`, `with-ollama.ts` - Provider-specific agents
- **`workflow/`** - Workflow orchestration examples
- **`toolsStream.ts`** - Streaming tool interactions

### RAG (Retrieval-Augmented Generation) (`rag/`)

Core RAG functionality examples:

- `starter.ts` - Basic RAG setup with VectorStoreIndex
- `chatEngine.ts` - Conversational RAG interface
- `chat-engine/` - Different chat engine implementations
- `extractors/` - Metadata extraction examples
- `nodeParser/` - Custom text chunking strategies
- `split.ts`, `sentenceWindow.ts` - Text processing techniques

### Models (`models/`)

Provider-specific LLM and embedding examples:

- **`openai/`** - OpenAI integration (chat, completions, embeddings, multimodal)
- **`anthropic/`** - Claude models with streaming and caching
- **`gemini/`** - Google Gemini including live API examples
- **`ollama/`**, **`groq/`**, **`mistral/`** - Alternative LLM providers
- **`rerankers/`** - Result reranking implementations

### Storage (`storage/`)

Vector store and database integrations:

- **`pinecone-vector-store/`** - Pinecone setup and querying
- **`chromadb/`**, **`qdrantdb/`**, **`weaviate/`** - Alternative vector stores
- **`mongodb/`**, **`pg/`**, **`firestore/`** - Database integrations
- **`metadata-filter/`** - Filtering and search parameters

### Multimodal (`multimodal/`)

Vision and multimodal capabilities:

- `chat.ts` - Image analysis with chat
- `load.ts`, `retrieve.ts` - Multimodal document processing
- `clip.ts` - CLIP embeddings for images

### Readers (`readers/`)

Document ingestion from various sources:

- `src/` - File format readers (PDF, DOCX, CSV, JSON, HTML)
- `llamaparse.ts` - LlamaParse document processing
- `discord/`, `notion/`, `assemblyai/` - Platform-specific readers

### Cloud (`cloud/`)

LlamaCloud integration examples:

- `chat.ts`, `query.ts` - Cloud-based RAG
- `from-documents.ts` - Document upload to cloud

### Deprecated (`deprecated/`)

Legacy agent implementations for reference (prefer `agents/agent/` for new code).

## Key Development Patterns

### Example Structure

Most examples follow this pattern:

```typescript
import { ... } from "llamaindex";
import { ... } from "@llamaindex/provider";

async function main() {
  // Setup (API keys, configuration)
  // Create components (LLM, embeddings, vector store)
  // Build index or engine
  // Execute query/chat
  // Output results
}

main().catch(console.error);
```

### Provider Imports

Examples use modular provider imports:

```typescript
// Specific provider packages
import { OpenAI } from "@llamaindex/openai";
import { claude } from "@llamaindex/anthropic";

// Core functionality
import { VectorStoreIndex, Document } from "llamaindex";
```

### Error Handling

Include proper error handling and API key validation:

```typescript
if (!process.env.OPENAI_API_KEY) {
  console.log("API key required");
  process.exit(1);
}
```

## Dependencies

The examples package includes all major LlamaIndex.TS providers and integrations. Key dependencies:

- **Core**: `llamaindex`, `@llamaindex/core`
- **Providers**: All LLM, embedding, and vector store providers
- **Tools**: `@llamaindex/workflow`, `@llamaindex/tools`
- **Utilities**: `tsx` for TypeScript execution, `dotenv` for environment variables

## Usage Notes

1. **Build First**: Some examples may require building the packages first: `pnpm build`
2. **Data Files**: Many examples reference files in `./data/` directory
3. **API Costs**: Be aware that running examples will consume API credits
4. **Environment**: Examples are designed to run in Node.js environment
5. **Interactive Examples**: Some examples include readline interfaces for interactive testing

## Creating New Examples

When adding new examples:

1. Follow the established directory structure by category
2. Use descriptive filenames that indicate functionality
3. Include proper imports from modular packages
4. Add error handling and environment validation
5. Include comments explaining key concepts
6. Test with minimal required dependencies
