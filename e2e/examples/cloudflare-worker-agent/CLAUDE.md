# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Cloudflare Worker Agent example in the LlamaIndexTS e2e testing suite.

## Package Overview

The `@llamaindex/cloudflare-worker-agent-test` package demonstrates how to use LlamaIndex.TS within a Cloudflare Worker environment. This example serves as both a functional integration test and a reference implementation for deploying AI agents on Cloudflare's edge platform.

## Development Commands

Local development and testing:

- `npm run dev` or `npm start` - Start Wrangler development server
- `npm run build` - Build worker for deployment (dry-run with output to dist/)
- `npm run deploy` - Deploy worker to Cloudflare
- `npm run test` - Run Vitest tests using Cloudflare Workers test environment
- `npm run cf-typegen` - Generate TypeScript types from wrangler.toml bindings

## Architecture

### Worker Implementation (`src/index.ts`)

The worker implements a basic HTTP handler that:

1. **Environment Setup**: Uses `@llamaindex/env` to configure runtime environment variables
2. **Agent Initialization**: Creates an OpenAI agent with streaming support
3. **Request Processing**: Accepts text input via HTTP request body
4. **Streaming Response**: Returns streaming AI responses (though currently returns static "Hello, world!")

**Key Components:**

- Environment interface with `OPENAI_API_KEY` requirement
- Dynamic imports for optimal bundle size (`@llamaindex/env`, `@llamaindex/openai`)
- OpenAI agent with streaming chat capability
- Transform stream for encoding chat response deltas

### Configuration Files

**Wrangler Configuration (`wrangler.toml`):**

- Worker name: "agent"
- Entry point: `src/index.ts`
- Compatibility date: 2024-04-23
- Node.js compatibility enabled via `nodejs_compat` flag
- Commented examples for all major Cloudflare Worker bindings (D1, KV, R2, etc.)

**TypeScript Configuration (`tsconfig.json`):**

- Target: ES2021 with ES2022 modules
- Bundler module resolution for Cloudflare Workers
- Cloudflare Workers types included (`@cloudflare/workers-types/2023-07-01`)
- Isolated modules enabled for edge runtime compatibility

### Testing Setup

**Vitest Configuration (`vitest.config.ts`):**

- Uses `@cloudflare/vitest-pool-workers` for Cloudflare Workers testing environment
- Integrates with wrangler.toml configuration
- Enables testing in actual Workers runtime conditions

**Test Implementation (`test/index.spec.ts`):**

- Unit-style testing with Cloudflare Workers test utilities
- Mock environment variables (OPENAI_API_KEY)
- Uses `createExecutionContext()` and `waitOnExecutionContext()` for proper async testing
- Currently marked as failing due to implementation bug (returns "Hello World!" instead of actual agent response)

## Runtime Environment

### Cloudflare Workers Compatibility

This example demonstrates LlamaIndex.TS compatibility with the Cloudflare Workers runtime (`workerd`):

- **Edge Runtime**: Runs on Cloudflare's global edge network
- **Node.js Compatibility**: Uses `nodejs_compat` flag for Node.js APIs
- **Module System**: ESM-only with dynamic imports for code splitting
- **Environment Variables**: Secure handling via Cloudflare Workers environment bindings

### Key Dependencies

- `llamaindex` (workspace) - Main LlamaIndex.TS package
- `@cloudflare/workers-types` - TypeScript definitions for Workers APIs
- `@cloudflare/vitest-pool-workers` - Testing framework for Workers environment
- `wrangler` - Cloudflare Workers CLI and build tool

## Development Notes

### Environment Variables

- Create `.dev.vars` file with `OPENAI_API_KEY=your_key_here` for local development
- Production secrets managed via `wrangler secret put OPENAI_API_KEY`

### Known Issues

- **Response Bug**: Worker currently returns static "Hello, world!" instead of streaming agent response (line 34 in `src/index.ts`)
- **Test Status**: Main test marked as `.fails()` due to above implementation issue

### Bundle Optimization

- Uses dynamic imports to enable code splitting and reduce initial bundle size
- Critical for Cloudflare Workers size limits and cold start performance
- Environment setup (`@llamaindex/env`) imported dynamically to defer execution

### Security Considerations

- API keys handled through Cloudflare Workers environment bindings
- No sensitive data stored in source code
- Secure environment variable access pattern using `env` parameter

## Common Workflows

1. **Local Development**: Use `npm run dev` with `.dev.vars` file for API keys
2. **Testing**: Run `npm test` to validate Workers runtime compatibility
3. **Deployment**: Use `npm run deploy` after configuring production secrets
4. **Debugging**: Use `wrangler tail` to view production logs and errors
5. **Type Generation**: Run `npm run cf-typegen` after modifying wrangler.toml bindings

## Integration Testing Purpose

This example serves multiple purposes in the e2e test suite:

- **Runtime Validation**: Ensures LlamaIndex.TS works in Cloudflare Workers environment
- **Bundle Testing**: Validates that dynamic imports and code splitting work correctly
- **API Integration**: Tests OpenAI provider integration in edge runtime
- **Streaming Support**: Demonstrates streaming response handling in Workers
- **Reference Implementation**: Provides template for real-world Cloudflare Workers deployments
