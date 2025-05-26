# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the LlamaIndexTS Next.js Edge Runtime example.

## Package Overview

The `@llamaindex/nextjs-edge-runtime-test` package is an end-to-end test example that validates LlamaIndexTS compatibility with Next.js Edge Runtime. This example serves as both a test case and a reference implementation for using LlamaIndex in Vercel Edge Runtime environments.

## Purpose

This example specifically tests:

- LlamaIndex package import compatibility in Edge Runtime
- Next.js Edge Runtime environment detection
- Proper runtime configuration for LlamaIndex in serverless edge environments
- Integration with Next.js 15.x App Router using edge runtime

## Development Commands

Standard Next.js commands:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

From the workspace root:

- `pnpm build` - Build all packages (required before testing)
- `pnpm e2e` - Run all e2e tests including this example

## Architecture

### Next.js Configuration

**next.config.mjs:**

- Uses `withLlamaIndex` wrapper from `llamaindex/next` for proper Edge Runtime configuration
- Applies necessary bundling and polyfill configurations for LlamaIndex compatibility

### Runtime Configuration

**Edge Runtime Setup:**

- Both `src/app/layout.tsx` and `src/app/page.tsx` export `runtime = "edge"`
- Forces Next.js to use Edge Runtime instead of Node.js runtime
- Validates LlamaIndex works in constrained serverless environments

### Runtime Validation

**src/utils/llm.ts:**

- Imports the main `llamaindex` package to test compatibility
- Performs runtime environment validation by checking for `EdgeRuntime` global
- Throws error if not running in expected Edge Runtime environment
- Acts as a smoke test for package loading in edge environments

### Application Structure

**App Router Setup:**

- Uses Next.js 13+ App Router with TypeScript
- Minimal React components for testing runtime compatibility
- CSS imports to validate bundling works correctly
- Path aliases configured for `@/*` imports

## Key Features

### Edge Runtime Compatibility

- Tests LlamaIndex package loading in Vercel Edge Runtime
- Validates proper tree-shaking and bundling for edge environments
- Ensures no Node.js-specific APIs are accidentally imported

### LlamaIndex Integration

- Uses workspace dependency `llamaindex: "workspace:*"`
- Leverages `withLlamaIndex` Next.js plugin for proper configuration
- Tests base package import without specific providers

### Environment Detection

- Runtime environment validation ensures code runs in expected context
- Prevents deployment issues by catching runtime mismatches early
- Provides clear error messages for debugging

## Dependencies

**Core Dependencies:**

- `llamaindex` - Main LlamaIndexTS package (workspace dependency)
- `next` - Next.js framework (v15.3.0)
- `react` & `react-dom` - React framework (v19.x)

**Development Dependencies:**

- TypeScript types for Node.js, React, and React DOM
- TypeScript compiler for type checking

## Development Notes

- **Build Dependency**: Ensure `pnpm build` is run from workspace root before testing
- **Edge Runtime Only**: This example is specifically designed for Edge Runtime, not Node.js runtime
- **Minimal Implementation**: Intentionally minimal to isolate Edge Runtime compatibility testing
- **Import Testing**: The `src/utils/llm.ts` file serves as an import compatibility test
- **Bundle Size**: Edge Runtime has size constraints, so this tests LlamaIndex bundle compatibility

## Testing Purpose

This example validates that:

1. LlamaIndex packages can be imported in Edge Runtime environments
2. Next.js configuration works correctly with LlamaIndex
3. Runtime environment detection functions properly
4. Bundle size and tree-shaking work for edge deployments
5. No Node.js-specific APIs are inadvertently used

## Common Issues

- **Runtime Detection Failures**: If `EdgeRuntime` is not detected, check Next.js configuration
- **Import Errors**: Ensure workspace packages are built before running
- **Bundle Size**: Edge Runtime has memory/size limits that may affect large imports
- **API Compatibility**: Some LlamaIndex features may not work in Edge Runtime due to API limitations

## Related Examples

- `../nextjs-node-runtime/` - Node.js runtime equivalent
- `../cloudflare-worker-agent/` - Cloudflare Workers edge runtime
- `../nextjs-agent/` - Full Next.js agent implementation
