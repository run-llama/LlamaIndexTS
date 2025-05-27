# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the LlamaParse Browser Test example.

## Package Overview

The `@llamaindex/llama-parse-browser-test` package is a minimal browser-based example that demonstrates how to use LlamaParse (from `@llamaindex/cloud`) in a web browser environment. This serves as both an integration test and a reference implementation for browser compatibility with LlamaIndexTS cloud services.

## Purpose

This example validates that:

- `@llamaindex/cloud` package works correctly in browser environments
- LlamaParse functionality can be bundled and run in web applications
- The build process properly handles WASM dependencies and browser-specific requirements
- TypeScript compilation works with DOM APIs and modern bundler tooling

## Development Commands

- `npm run dev` - Start Vite development server with hot reload
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run preview` - Preview the production build locally

## Architecture

### Build Setup

**Bundler**: Vite 6.x with TypeScript support
**WASM Support**: Uses `vite-plugin-wasm` for WebAssembly module handling
**Module System**: ESM-only (`"type": "module"`)
**Target Environment**: Modern browsers (ES2020+)

### Key Configuration

**Vite Config (`vite.config.ts`):**

- `vite-plugin-wasm` - Enables WASM module imports
- `ssr.external: ["tiktoken"]` - Excludes tiktoken from SSR bundling (browser-only)

**TypeScript Config (`tsconfig.json`):**

- Extends root monorepo TypeScript configuration
- DOM and DOM.Iterable libraries enabled for browser APIs
- Bundler module resolution for optimal Vite integration
- References `@llamaindex/cloud` package for type checking

### Application Structure

**Entry Point (`src/main.ts`):**

- Imports `LlamaParseReader` from `@llamaindex/cloud`
- Instantiates the reader to test browser compatibility
- Minimal DOM manipulation for visual feedback

**Styling (`src/style.css`):**

- Modern CSS with light/dark theme support
- Responsive design with flexbox layout
- Clean, minimal UI suitable for testing environment

**HTML (`index.html`):**

- Standard Vite HTML template
- Single-page application structure
- Module script loading for ES6 imports

## Dependencies

**Core Dependency:**

- `@llamaindex/cloud` (workspace) - LlamaCloud integration including LlamaParse

**Development Dependencies:**

- `vite` - Modern build tool and development server
- `vite-plugin-wasm` - WebAssembly support for Vite
- `typescript` - TypeScript compiler and language support

## Testing Integration

This example functions as an end-to-end test by:

1. **Import Validation**: Verifies `@llamaindex/cloud` can be imported in browser context
2. **Instantiation Testing**: Tests that `LlamaParseReader` can be created without errors
3. **Bundle Compatibility**: Ensures the build process handles all dependencies correctly
4. **Runtime Verification**: Validates the application loads and runs in actual browsers

## Browser Compatibility

The application targets modern browsers with:

- ES2020 language features
- ES Modules support
- WebAssembly support (for potential WASM dependencies)
- Modern DOM APIs

## Development Notes

- **Minimal Implementation**: Keeps the example simple to focus on integration testing
- **Cloud Service Focus**: Specifically tests browser compatibility with LlamaCloud services
- **Build Validation**: Ensures the build process works end-to-end without browser-specific issues
- **WASM Preparation**: Configured for WASM dependencies even if not currently used
- **Type Safety**: Full TypeScript integration with proper DOM type definitions

## Common Issues

- **WASM Loading**: The `vite-plugin-wasm` handles WebAssembly module loading complexities
- **SSR Exclusions**: Tiktoken is excluded from SSR to prevent Node.js-specific dependencies in browser builds
- **Module Resolution**: Uses bundler module resolution for optimal compatibility with modern web tooling

This example serves as a foundation for integrating LlamaIndexTS cloud services into web applications and validates that the core cloud functionality works correctly in browser environments.
