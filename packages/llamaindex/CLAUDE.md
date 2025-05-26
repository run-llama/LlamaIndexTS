# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Overview

This is the main `llamaindex` package - the primary entry point for LlamaIndex.TS that aggregates core functionality from `@llamaindex/core` and other workspace packages. It provides multiple runtime-specific entry points and sub-module exports.

## Development Commands

**Build and Test:**

- `pnpm build` - Build the package using bunchee (creates CJS/ESM dual exports)
- `pnpm dev` - Build in watch mode for development
- `pnpm lint` - Run ESLint on source files
- `cd tests && pnpm test` - Run unit tests (requires build first)

**Testing from workspace root:**

- `turbo run build --filter="llamaindex"` - Build this specific package
- `turbo run test --filter="llamaindex"` - Test this specific package

## Architecture

### Multi-Runtime Entry Points

The package supports multiple JavaScript runtimes through conditional exports:

- `src/index.ts` - Default Node.js entry point with file system support
- `src/index.edge.ts` - Edge runtime entry (Vercel Edge, Cloudflare Workers)
- `src/index.react-server.ts` - React Server Components
- `src/index.workerd.ts` - Cloudflare Workers specific

### Sub-module Structure

The package exports functionality as sub-modules for tree-shaking:

- `/agent` - Deprecated ReAct agents (use `@llamaindex/workflow` instead)
- `/cloud` - LlamaCloud integration
- `/engines` - Chat and query engines
- `/evaluation` - RAG evaluation metrics
- `/extractors` - Metadata extraction
- `/indices` - Vector, summary, and keyword indices
- `/ingestion` - Document processing pipelines
- `/objects` - Object index for structured data
- `/postprocessors` - Result reranking and filtering
- `/selectors` - LLM-based routing and selection
- `/storage` - Local storage implementations
- `/tools` - Function calling tools
- `/vector-store` - Simple vector store implementation
- `/next` - Next.js specific utilities

### Core Integration

This package primarily aggregates and re-exports from:

- `@llamaindex/core` - Abstract base classes and interfaces
- `@llamaindex/cloud` - LlamaCloud services
- `@llamaindex/env` - Runtime compatibility layers
- `@llamaindex/node-parser` - Text chunking

### Testing Structure

Tests are in a separate `tests/` subdirectory with its own package.json:

- Tests depend on build artifacts - always build before testing
- Uses Vitest with setup in `vitest.setup.ts`
- Test files follow `*.test.ts` pattern
- Tests import from the built package, not source files

### Development Notes

- Uses bunchee for building with dual CJS/ESM output
- Build process automatically copies README and LICENSE from workspace root
- Package supports Node.js >=18.0.0
- Entry points are configured for tree-shaking and runtime optimization
- When adding new functionality, consider if it should be a sub-module export
