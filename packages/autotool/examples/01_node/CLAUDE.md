# @llamaindex/autotool Node.js Example

This example demonstrates how to use the `@llamaindex/autotool` package in a Node.js environment to automatically convert TypeScript functions into LLM-compatible tools.

## What This Example Shows

This example showcases the core autotool functionality:

1. **Automatic Tool Detection**: Functions in `.tool.ts` files are automatically detected and converted to LLM tools
2. **TypeScript Integration**: Function signatures and JSDoc comments are used to generate tool metadata
3. **OpenAI Compatibility**: Tools are converted to OpenAI's function calling format
4. **Runtime Registration**: Tools are automatically registered and made available at runtime

## Architecture

### Key Files

- `src/index.ts` - Main application that uses the auto-generated tools with OpenAI
- `src/index.tool.ts` - Tool definitions that get auto-transpiled (exports `getCurrentLocation` and `getWeather`)
- `src/utils.ts` - Utility functions with JSDoc documentation
- `package.json` - Configuration with Node.js loader setup

### How It Works

1. **Tool Detection**: The `.tool.ts` file extension triggers autotool processing
2. **Metadata Generation**: TypeScript signatures and JSDoc comments are analyzed to create tool schemas
3. **Runtime Loading**: The Node.js loader (`@llamaindex/autotool/node`) processes files at import time
4. **Tool Conversion**: `convertTools("openai")` generates OpenAI-compatible tool definitions
5. **LLM Integration**: Tools are passed to OpenAI's chat completion API

## Usage

### Running the Example

```bash
pnpm start
```

This runs: `node --import tsx --import @llamaindex/autotool/node ./src/index.ts`

### Key Components

**Node.js Loader Setup** (package.json):

```json
{
  "scripts": {
    "start": "node --import tsx --import @llamaindex/autotool/node ./src/index.ts"
  }
}
```

**Tool File** (src/index.tool.ts):

- Functions exported from `.tool.ts` files are automatically converted to tools
- JSDoc comments become tool descriptions
- TypeScript types generate JSON schemas for parameters

**Main Application** (src/index.ts):

- Imports the tool file to trigger registration
- Uses `convertTools("openai")` to get OpenAI-compatible tool definitions
- Passes tools to OpenAI chat completion

## Dependencies

- `@llamaindex/autotool` - Core autotool functionality
- `llamaindex` - LlamaIndex TypeScript framework
- `openai` - OpenAI API client
- `tsx` - TypeScript execution for Node.js

## Development Notes

- The `--import` flags in the start script enable both TypeScript execution (tsx) and autotool processing
- Tool files must use `.tool.ts` extension or contain `"use tool"` directive
- JSDoc comments on exported functions become tool descriptions
- TypeScript parameter types are automatically converted to JSON Schema
- The example demonstrates OpenAI format, but `convertTools("llamaindex")` is also available

This example serves as a minimal working demonstration of autotool's core functionality in a Node.js environment.
