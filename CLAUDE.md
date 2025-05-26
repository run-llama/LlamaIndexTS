# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This project uses pnpm as the package manager and Turbo for build orchestration:

- `pnpm install` - Install all dependencies
- `pnpm build` - Build all packages using Turbo
- `pnpm dev` - Start development mode for all packages
- `pnpm test` - Run all unit tests
- `pnpm e2e` - Run end-to-end tests
- `pnpm lint` - Run ESLint across all packages
- `pnpm type-check` - Run TypeScript type checking across workspace
- `pnpm format` - Check code formatting with Prettier
- `pnpm format:write` - Auto-fix formatting issues
- `pnpm circular-check` - Check for circular dependencies using madge

For individual package development:

- `turbo run build --filter="@llamaindex/core"` - Build specific package
- Navigate to specific package directory and run `pnpm test` for focused testing

## Architecture Overview

LlamaIndex.TS is a TypeScript data framework for LLM applications organized as a pnpm monorepo with multiple runtime environment support (Node.js, Deno, Bun, Vercel Edge, Cloudflare Workers).

### Package Structure

**Core Packages:**

- `packages/core/` - Abstract base classes and interfaces for all runtime environments
- `packages/llamaindex/` - Main package that aggregates core functionality
- `packages/env/` - Environment-specific compatibility layers for different JS runtimes

**Provider Packages (`packages/providers/`):**

- LLM providers: `openai/`, `anthropic/`, `ollama/`, `google/`, `groq/`, etc.
- Vector stores: `storage/pinecone/`, `storage/chroma/`, `storage/qdrant/`, etc.
- Embeddings: Various embedding providers integrated within LLM packages
- Readers: `assemblyai/`, `discord/`, `notion/` for data ingestion

**Specialized Packages:**

- `packages/cloud/` - LlamaCloud integration for managed services
- `packages/tools/` - Function calling tools and utilities
- `packages/workflow/` - Agent workflow orchestration
- `packages/readers/` - File format readers (PDF, DOCX, etc.)

### Key Architectural Patterns

**Runtime Abstraction:** Core functionality is runtime-agnostic, with environment-specific implementations in separate entry points (`index.ts`, `index.edge.ts`, `index.workerd.ts`).

**Provider Pattern:** LLMs, embeddings, and vector stores implement common interfaces from `@llamaindex/core`, allowing easy swapping between providers.

**Modular Design:** Each provider is a separate package to minimize bundle size - users install only what they need.

**Data Flow:** Document → NodeParser → Embedding → VectorStore → Retriever → QueryEngine → Response

### Core Components

- **Agents and Workflows:** Abstractions for building agentic workflows and agents in `packages/workflow`
- **Chat Engines:** Conversational interfaces in `core/chat-engine/`
- **Query Engines:** Document querying with retrieval in `core/query-engine/`
- **Indices:** VectorStoreIndex, SummaryIndex, KeywordTable in `llamaindex/indices/`
- **Node Parsers:** Text splitting and chunking in `core/node-parser/`
- **Ingestion Pipeline:** Document processing workflows in `llamaindex/ingestion/`

### Deprecated Components

- **Agents:** ReAct and function calling agents in `core/agent/` and `llamaindex/agent/`

### Testing Structure

- Unit tests in each package's `tests/` directory
- E2E tests in `e2e/` directory with runtime-specific examples
- Tests depend on build artifacts, so always run `pnpm build` before testing

### Multi-Runtime Support

The codebase supports multiple JavaScript runtimes through conditional exports and separate entry points. When making changes, consider compatibility across Node.js, Deno, Bun, and edge runtimes.
