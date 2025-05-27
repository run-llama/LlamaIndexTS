# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the LlamaIndexTS e2e testing package.

## Package Overview

The `@llamaindex/e2e` package contains end-to-end tests and examples for LlamaIndexTS, ensuring the library works correctly across different runtime environments and use cases. It validates integration between core packages, providers, and real-world usage scenarios.

## Development Commands

Run e2e tests from the root directory using:

- `pnpm e2e` - Run all e2e tests with mocked LLM responses
- `pnpm e2e:nomock` - Run e2e tests with real API calls (requires API keys)

Local e2e package commands:

- `npm run e2e` - Run all e2e tests with mock register
- `npm run e2e:nomock` - Run tests without mocking (real API calls)
- `npm run e2e:updatesnap` - Update test snapshots

## Testing Structure

### Core Test Files (`node/`)

**Main Test Suites:**

- `smoke.e2e.ts` - CJS/ESM dual module compatibility tests and basic import validation
- `openai.e2e.ts` - OpenAI provider integration tests (LLM, agents, tools)
- `claude.e2e.ts` - Anthropic Claude provider tests
- `ollama.e2e.ts` - Ollama local LLM provider tests
- `react.e2e.ts` - ReAct agent framework tests
- `issue.e2e.ts` - Regression tests for specific GitHub issues

**Specialized Tests:**

- `embedding/clip.e2e.ts` - CLIP embedding model tests
- `vector-store/` - Vector database integration tests (Pinecone, PostgreSQL with pgvector)

### Test Utilities

- `utils.ts` - Common test utilities and helper functions
- `fixtures/` - Test data and mock tool definitions
- `snapshot/` - Stored test snapshots for regression testing
- `mock-register.js` & `mock-module.js` - LLM response mocking system

### Examples Directory (`examples/`)

Runtime-specific example applications that serve as integration tests:

**Edge/Serverless Runtimes:**

- `cloudflare-worker-agent/` - Cloudflare Workers agent example with Vitest
- `cloudflare-hono/` - Cloudflare Workers with Hono framework
- `nextjs-edge-runtime/` - Next.js Edge Runtime compatibility
- `nextjs-node-runtime/` - Next.js Node.js runtime example
- `nextjs-agent/` - Next.js with agent integration

**Client-Side:**

- `llama-parse-browser/` - Browser-based LlamaParse integration
- `vite-import-llamaindex/` - Vite bundler compatibility test

**Alternative Frameworks:**

- `waku-query-engine/` - Waku framework with query engine integration

## Testing Patterns

### Mock System

The e2e tests use a sophisticated mocking system for consistent testing:

- **Mock Register**: `mock-register.js` enables LLM response mocking
- **Snapshot Testing**: Pre-recorded responses stored in `snapshot/` directory
- **Real API Mode**: Tests can run against real APIs when `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc. are provided

### Test Categories

1. **Smoke Tests**: Basic import/export validation and dual module (CJS/ESM) compatibility
2. **Provider Integration**: LLM provider functionality (chat, streaming, function calling)
3. **Agent Tests**: Agent framework validation with tool calling and reasoning
4. **Runtime Compatibility**: Cross-platform runtime environment testing
5. **Regression Tests**: Issue-specific tests preventing regressions

### Environment Conditions

Tests validate multiple JavaScript runtime conditions:

- `edge-light` - Vercel Edge Runtime
- `workerd` - Cloudflare Workers runtime
- `react-server` - React Server Components environment

## Dependencies

The package includes comprehensive workspace dependencies for testing all major LlamaIndexTS features:

**Core Dependencies:**

- `@llamaindex/core` - Base abstractions
- `@llamaindex/env` - Runtime environment compatibility
- `llamaindex` - Main package

**Provider Dependencies:**

- `@llamaindex/openai` - OpenAI integration
- `@llamaindex/anthropic` - Anthropic Claude integration
- `@llamaindex/ollama` - Ollama local LLM support
- `@llamaindex/clip` - CLIP embedding models
- `@llamaindex/pinecone` - Pinecone vector store
- `@llamaindex/postgres` - PostgreSQL with pgvector

**Testing Utilities:**

- `@faker-js/faker` - Test data generation
- `@huggingface/transformers` - Local model support
- `consola` - Logging in tests
- `dotenv` - Environment variable management
- `tsx` - TypeScript execution for Node.js

## Development Notes

- **Build Dependency**: E2E tests depend on build artifacts, so always run `pnpm build` before testing
- **API Keys**: Real API testing requires environment variables (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.)
- **Snapshot Updates**: Use `npm run e2e:updatesnap` to update test snapshots after intentional changes
- **Mock vs Real**: Use mock mode for CI/fast development, real mode for integration validation
- **Runtime Testing**: Examples serve dual purpose as integration tests and usage documentation
- **Node.js Test Runner**: Uses built-in Node.js test runner with tsx for TypeScript support

## Common Workflows

1. **Adding New Provider**: Create test file in `node/`, add mock snapshots, validate across runtimes
2. **Runtime Compatibility**: Add example in `examples/` with framework-specific testing setup
3. **Regression Testing**: Add specific test case in `issue.e2e.ts` with GitHub issue reference
4. **Mock Updates**: Update snapshots when LLM provider responses change intentionally
