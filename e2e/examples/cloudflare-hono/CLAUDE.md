# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the LlamaIndexTS Cloudflare Workers + Hono example.

## Package Overview

The `@llamaindex/cloudflare-hono` package is an end-to-end example demonstrating how to use LlamaIndexTS in a Cloudflare Workers environment with the Hono web framework. This example showcases building an AI agent with vector search capabilities that runs on Cloudflare's edge runtime.

## Development Commands

- `npm run dev` or `npm start` - Start local development server with Wrangler
- `npm run build` - Build for deployment (dry run to dist directory)
- `npm run deploy` - Deploy to Cloudflare Workers
- `npm run cf-typegen` - Generate TypeScript types for Cloudflare Workers

## Architecture

This example demonstrates a complete RAG (Retrieval-Augmented Generation) system running on Cloudflare Workers:

### Key Components

1. **Hono Framework**: Lightweight web framework optimized for edge runtimes
2. **OpenAI Integration**: GPT-4o-mini for language model and text-embedding-3-small for embeddings
3. **Pinecone Vector Store**: Cloud vector database for document storage and retrieval
4. **OpenAI Agent**: Function-calling agent with tool integration
5. **Query Engine Tool**: Business information retrieval tool

### Request Flow

1. POST request to `/llm` endpoint with `{ message: "user question" }`
2. Environment setup using `@llamaindex/env` for Cloudflare Workers compatibility
3. Dynamic imports for tree-shaking and edge runtime optimization
4. LLM and embedding model configuration with API keys from environment
5. Vector store connection to Pinecone with predefined namespace
6. Vector index creation and retriever setup (top-k=3 similarity search)
7. Query engine tool creation for business information retrieval
8. OpenAI agent initialization with tools
9. Agent chat execution and response extraction

### Runtime Optimizations

- **Dynamic Imports**: All LlamaIndex packages imported asynchronously for optimal cold start performance
- **Environment Setup**: Uses `@llamaindex/env` package for Cloudflare Workers compatibility
- **Tree Shaking**: Selective imports reduce bundle size for edge deployment
- **Async Operations**: Fully async pipeline optimized for serverless execution

## Configuration

### Wrangler Configuration (`wrangler.toml`)

- **Runtime**: Cloudflare Workers with Node.js AsyncLocalStorage compatibility
- **Compatibility Date**: 2024-11-12 with `nodejs_als` flag
- **Observability**: Enabled for monitoring and debugging
- **Entry Point**: `src/index.ts`

### TypeScript Configuration

- **Target**: ES2021 for modern JavaScript features
- **Module**: ES2022 with bundler module resolution
- **Types**: Cloudflare Workers types for runtime compatibility
- **Strict Mode**: Enabled for type safety

### Environment Variables

Required Cloudflare Workers environment variables:

- `OPENAI_API_KEY` - OpenAI API access for LLM and embeddings
- `PINECONE_API_KEY` - Pinecone vector database access

## Dependencies

### Runtime Dependencies

- `hono` - Lightweight web framework for edge runtimes

### Development Dependencies

- `@cloudflare/workers-types` - TypeScript definitions for Cloudflare Workers
- `wrangler` - Cloudflare Workers CLI and development server
- `typescript` - TypeScript compiler

### LlamaIndexTS Integration

This example relies on workspace dependencies:

- `llamaindex` - Core LlamaIndexTS functionality
- `@llamaindex/openai` - OpenAI provider (LLM, embeddings, agents)
- `@llamaindex/pinecone` - Pinecone vector store integration
- `@llamaindex/env` - Runtime environment compatibility layer

## Code Patterns

### Environment Setup Pattern

```typescript
const { setEnvs } = await import("@llamaindex/env");
setEnvs(c.env);
```

Required first step for Cloudflare Workers compatibility.

### Dynamic Import Pattern

```typescript
const { VectorStoreIndex, Settings } = await import("llamaindex");
const { OpenAI, OpenAIAgent } = await import("@llamaindex/openai");
```

Optimizes bundle size and cold start performance.

### Settings Configuration

```typescript
Settings.llm = new OpenAI({ model: "gpt-4o-mini" });
Settings.embedModel = new OpenAIEmbedding({ model: "text-embedding-3-small" });
Settings.nodeParser = new SentenceSplitter({ chunkSize: 8191 });
```

Global configuration for consistent LLM behavior.

### Agent Tool Integration

```typescript
const tools = [
  new QueryEngineTool({ queryEngine, metadata: { name, description } }),
];
const agent = new OpenAIAgent({ tools });
```

Function-calling agent with domain-specific tools.

## Usage

1. **Local Development**: Run `npm run dev` to start Wrangler development server
2. **Environment Setup**: Configure `OPENAI_API_KEY` and `PINECONE_API_KEY` in Wrangler
3. **API Testing**: POST to `/llm` with JSON payload `{ message: "your question" }`
4. **Deployment**: Run `npm run deploy` to publish to Cloudflare Workers

## Integration Testing

This example serves as an integration test for:

- Cloudflare Workers runtime compatibility
- Hono framework integration
- OpenAI provider functionality
- Pinecone vector store operations
- Agent workflow execution
- Dynamic import optimization
- Environment variable handling

## Performance Considerations

- **Cold Start**: Dynamic imports minimize initial bundle size
- **Memory Usage**: Efficient vector operations with Pinecone cloud storage
- **Latency**: Edge deployment reduces geographic latency
- **Concurrency**: Serverless architecture handles concurrent requests efficiently
