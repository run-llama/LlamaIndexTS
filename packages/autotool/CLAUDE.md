# @llamaindex/autotool

Auto-transpilation system that converts regular JavaScript/TypeScript functions into LLM-compatible tools for use with LlamaIndex agents.

## Architecture

The autotool package provides a build-time transformation system that automatically generates tool metadata from TypeScript function signatures and JSDoc comments. It works by:

1. **Detection**: Identifies tool files through `.tool.ts/.js` extensions or `"use tool"` directive
2. **Analysis**: Uses TypeDoc to parse TypeScript declarations and extract function signatures, parameters, and documentation
3. **Transformation**: Injects metadata and runtime registration code into the source
4. **Runtime**: Provides conversion utilities to generate OpenAI or LlamaIndex compatible tool definitions

## Core Components

### Compiler (`src/compiler.ts`)

- `transformAutoTool()`: Main transformation function that parses TypeScript with TypeDoc
- `isToolFile()`: Detects `.tool.[jt]sx?` file extensions
- `isJSorTS()`: Matches JavaScript/TypeScript file patterns
- Generates JSON Schema from TypeScript parameter types
- Extracts function descriptions from JSDoc comments

### Runtime System (`src/index.ts`)

- `injectMetadata()`: Injected by compiler to register tool metadata at runtime
- `convertTools()`: Converts stored metadata to OpenAI (`ChatCompletionTool[]`) or LlamaIndex (`BaseToolWithCall[]`) formats
- `callTool()`: Direct tool invocation by name with parameter mapping
- Uses Jotai atoms for state management of tool registry

### Build Integration

- **Next.js**: `src/next.ts` - Webpack plugin integration via `withNext()`
- **Vite**: `src/vite.ts` - Vite plugin wrapper
- **Webpack**: `src/webpack.ts` - Direct webpack plugin
- **Node.js**: `src/node.ts` + `src/loader.ts` - Module loader hooks for runtime transformation
- **Universal**: `src/plugin.ts` - Unplugin factory for cross-bundler support

## Usage Patterns

### File-based Detection

```typescript
// weather.tool.ts
export function getWeather(city: string) {
  // Implementation
}
```

### Directive-based Detection

```typescript
"use tool";

export function getWeather(city: string) {
  // Implementation
}
```

### Runtime Integration

```typescript
import { convertTools } from "@llamaindex/autotool";

// For OpenAI format
const openaiTools = convertTools("openai");

// For LlamaIndex format
const llamaindexTools = convertTools("llamaindex");
```

## Key Features

- **Zero-config**: Automatic tool detection and metadata generation
- **Type-safe**: Leverages TypeScript for parameter validation and schema generation
- **Multi-format**: Supports both OpenAI and LlamaIndex tool formats
- **Build-time**: No runtime overhead for metadata generation
- **Cross-platform**: Works with Node.js, Next.js, Vite, and Webpack
- **JSDoc integration**: Extracts descriptions from TypeScript comments

## Dependencies

- `@swc/core`: Fast TypeScript/JavaScript parsing
- `typedoc`: TypeScript documentation generation for metadata extraction
- `unplugin`: Universal plugin system for build tool integration
- `jotai`: Atomic state management for tool registry

## Development Commands

- `pnpm build` - Build using bunchee
- `pnpm dev` - Watch mode development

## Examples

See `examples/01_node/` for a complete Node.js usage example with tool files and integration.
