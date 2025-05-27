# CLAUDE.md - @llamaindex/core

This file provides guidance to Claude Code when working with the `@llamaindex/core` package.

## Package Overview

The `@llamaindex/core` package contains the foundational abstract base classes and interfaces for the LlamaIndex.TS framework. This package provides runtime-agnostic core functionality that is implemented by provider-specific packages.

## Development Commands

From this package directory:

- `pnpm dev` - Start development mode with file watching using bunchee
- `pnpm build` - Build the package using bunchee
- `pnpm test` - Run unit tests (after building)

From the workspace root:

- `turbo run build --filter="@llamaindex/core"` - Build only this package
- `turbo run test --filter="@llamaindex/core"` - Test only this package

## Architecture

### Modular Export System

This package uses a sophisticated modular export system where functionality is organized into sub-modules that can be imported independently:

```typescript
import { BaseLLM } from "@llamaindex/core/llms";
import { BaseEmbedding } from "@llamaindex/core/embeddings";
import { BaseNode } from "@llamaindex/core/schema";
import { Settings } from "@llamaindex/core/global";
```

### Package Structure

**Core Modules:**

- `src/llms/` - Abstract LLM base classes and interfaces (`BaseLLM`, `LLM` interface)
- `src/embeddings/` - Abstract embedding base classes (`BaseEmbedding`)
- `src/schema/` - Core data structures (`BaseNode`, `Document`, output parsers)
- `src/global/` - Global settings and configuration management
- `src/node-parser/` - Text chunking and parsing abstractions
- `src/query-engine/` - Query processing abstractions
- `src/chat-engine/` - Conversational interface abstractions
- `src/memory/` - Chat memory management
- `src/prompts/` - Prompt template system
- `src/response-synthesizers/` - Response generation abstractions
- `src/retriever/` - Document retrieval abstractions
- `src/vector-store/` - Vector store abstractions
- `src/storage/` - Data persistence abstractions (chat, doc, index, kv stores)
- `src/tools/` - Turning functions into tools that can be used by LLMs
- `src/utils/` - Shared utilities
- `src/decorator/` - Event handling and lazy initialization
- `src/postprocessor/` - Result post-processing
- `src/data-structs/` - Data structure utilities
- `src/indices/` - Index abstractions

**Deprecated Modules:**

- `src/agent/` - Legacy agent implementations (use `@llamaindex/workflow` instead)

### Key Design Patterns

**Abstract Base Classes:** All core functionality is defined as abstract classes that provider packages extend. For example:

- `BaseLLM` - Extended by OpenAI, Anthropic, etc.
- `BaseEmbedding` - Extended by embedding providers
- `BaseVectorStore` - Extended by Pinecone, Chroma, etc.

**Runtime Agnostic:** Core functionality works across Node.js, Deno, Bun, and edge runtimes through the `@llamaindex/env` compatibility layer.

**Settings Management:** Global configuration through the `Settings` object allows dynamic swapping of LLMs, embeddings, and other components.

**Transform Components:** Many components extend `TransformComponent` for composable data processing pipelines.

## Build System

- Uses **bunchee** for building with dual CJS/ESM support
- Each subdirectory becomes a separate entry point in package.json exports
- Build outputs go to `{module}/dist/` directories
- TypeScript types are generated alongside JavaScript

## Testing

- Tests are located in `tests/` directory
- Tests depend on build artifacts - always run `pnpm build` before testing
- Use `vitest` as the test runner

## Key Dependencies

- `@llamaindex/env` - Runtime environment abstractions
- `zod` - Schema validation and type safety
- `magic-bytes.js` - File type detection
- `@types/node` - Node.js type definitions

## Development Guidelines

**When extending core classes:**

1. Import from the appropriate sub-module (e.g., `@llamaindex/core/llms`)
2. Implement all abstract methods
3. Follow the existing patterns for error handling and async operations
4. Consider runtime compatibility when using Node.js-specific APIs

**When modifying core interfaces:**

1. Ensure backward compatibility
2. Update both the interface and abstract base class
3. Consider impact on all provider packages
4. Test across multiple runtimes

**File Organization:**

- Each module should have an `index.ts` that exports public APIs
- Keep internal implementation details private
- Use consistent naming conventions (e.g., `BaseFoo` for abstract classes)

## Module Dependencies

This package has minimal external dependencies to ensure broad compatibility. The main dependency is `@llamaindex/env` which provides runtime-specific implementations for file system, fetch, and other platform-specific APIs.
