# @llamaindex/env Package

This package provides environment-specific compatibility layers for different JavaScript runtimes. It's a critical component that enables LlamaIndex.TS to work across Node.js, Deno, Bun, browser, Vercel Edge Runtime, and Cloudflare Workers.

## Package Overview

**Purpose**: Environment wrapper that provides unified APIs across all supported JavaScript runtimes
**Main exports**:

- `.` - Main environment APIs
- `./tokenizers` - Tokenization utilities
- `./multi-model` - Multi-modal model support

## Development Commands

**Build and test this package:**

- `pnpm build` - Build the package using bunchee
- `pnpm dev` - Build in watch mode
- `pnpm test` - Run tests with vitest

**From workspace root:**

- `turbo run build --filter="@llamaindex/env"` - Build this specific package
- `turbo run test --filter="@llamaindex/env"` - Test this specific package

## Runtime Support

The package uses conditional exports to provide runtime-specific implementations:

### Node.js Environment (`index.ts`)

- Full Node.js built-in modules (fs, crypto, streams, etc.)
- AsyncLocalStorage for context management
- Native filesystem operations
- Crypto utilities (createHash, randomUUID)

### Browser Environment (`index.browser.ts`)

- Web polyfills for browser compatibility
- Limited to browser-safe APIs
- Web-compatible base64 utilities

### Cloudflare Workers (`index.workerd.ts`)

- Minimal polyfills for Workers environment
- Environment variable access via `INTERNAL_ENV`
- No filesystem access

### Vercel Edge Runtime (`index.edge-light.ts`)

- Edge-compatible polyfills
- Non-Node.js AsyncLocalStorage implementation

## Key Components

### Async Local Storage (`src/als/`)

- `index.node.ts` - Native Node.js AsyncLocalStorage
- `index.non-node.ts` - Polyfill for non-Node environments
- `index.web.ts` - Web-compatible implementation
- `index.workerd.ts` - Cloudflare Workers implementation

### File System (`src/fs/`)

- `node.ts` - Node.js fs module wrapper
- `memory.ts` - In-memory filesystem for testing
- `memfs/` - Memory filesystem implementation

### Tokenizers (`src/internal/tokenizers/`)

- Runtime-specific tokenizer implementations
- Supports both `gpt-tokenizer` (fast) and `js-tiktoken` (fallback)
- Encoding/decoding for token counting

### Multi-Model Support (`src/internal/multi-model/`)

- Hugging Face Transformers integration
- Runtime-specific loading strategies
- Browser, Node.js, and non-Node implementations

### Utilities (`src/utils/`)

- `base64.ts` - Base64 encoding/decoding utilities
- `shared.ts` - Shared utility classes
- `index.ts` - Environment detection and configuration

## Architecture Patterns

### Conditional Exports

The package.json uses conditional exports to map different entry points based on runtime:

```json
"exports": {
  ".": {
    "node": "./dist/index.js",
    "workerd": "./dist/index.workerd.js",
    "edge-light": "./dist/index.edge-light.js",
    "browser": "./dist/index.browser.js"
  }
}
```

### Polyfill Strategy

- Each runtime gets only the APIs it can support
- Graceful degradation for missing functionality
- Common interface across all environments

### Dependency Management

- Core dependencies: `pathe`, `@aws-crypto/sha256-js`, `js-tiktoken`
- Optional peer dependencies: `@huggingface/transformers`, `gpt-tokenizer`
- Runtime detection determines which implementations to use

## Testing

- Tests in `tests/` directory use Vitest
- `memfs.test.ts` - Memory filesystem tests
- `tokenizer.test.ts` - Tokenizer functionality tests
- Always run `pnpm build` before testing as tests depend on build artifacts

## Usage Notes

- This package is typically imported by other LlamaIndex packages, not directly by users
- Provides the runtime abstraction layer that makes LlamaIndex framework runtime-agnostic
- When adding new environment-specific functionality, ensure all supported runtimes have appropriate implementations or polyfills
- Use environment detection utilities to handle runtime differences gracefully
