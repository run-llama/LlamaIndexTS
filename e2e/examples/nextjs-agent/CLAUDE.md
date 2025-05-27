# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Next.js Agent example in the LlamaIndexTS e2e testing suite.

## Package Overview

The `@llamaindex/next-agent-test` package is a Next.js application example that demonstrates integration between LlamaIndexTS and Next.js, specifically showcasing agent functionality with React Server Components and streaming UI using the Vercel AI SDK.

This example serves as both an integration test for Next.js compatibility and a reference implementation for building LlamaIndex-powered chat applications with Next.js.

## Development Commands

Local development commands:

- `npm run dev` - Start the Next.js development server on http://localhost:3000
- `npm run build` - Build the application for production
- `npm run start` - Start the production server

From the workspace root:

- `pnpm build` - Build all packages (required before running this example)
- `pnpm e2e` - Run e2e tests including this Next.js integration

## Architecture

### Next.js Configuration

The application uses a custom Next.js configuration with the LlamaIndex Next.js plugin:

- `next.config.mjs` imports and applies `withLlamaIndex` from `llamaindex/next`
- Enables Edge Runtime compatibility for LlamaIndex components
- Uses Next.js 15 with React 19

### Runtime Environment

- **Edge Runtime**: The main page (`src/app/page.tsx`) exports `runtime = "edge"` for Vercel Edge Runtime compatibility
- **React Server Components**: Uses Next.js App Router with RSC architecture
- **Streaming UI**: Integrates Vercel AI SDK's `createStreamableUI` for real-time agent responses

### Key Components

**Main Application (`src/app/page.tsx`):**

- Client component using React's `useFormState` hook
- Triggers server action `chatWithAgent` with a simple form interface
- Displays streaming agent responses in real-time

**Server Actions (`src/actions/index.tsx`):**

- `chatWithAgent` function creates an OpenAI agent and handles streaming chat
- Uses `OpenAIAgent` from `@llamaindex/openai` package
- Implements streaming response with `createStreamableUI` from AI SDK
- Accepts question string and previous chat messages as parameters

**Test Page (`src/app/test/page.tsx`):**

- Simple import test that ensures `llamaindex` package loads correctly
- Serves as a basic smoke test for package compatibility

### Dependencies

**Core Dependencies:**

- `llamaindex` - Main LlamaIndex package (workspace dependency)
- `next` - Next.js framework (v15.3.0+)
- `react` & `react-dom` - React 19 for latest features
- `ai` - Vercel AI SDK for streaming UI components

**Development Dependencies:**

- TypeScript configuration for Next.js development
- ESLint with Next.js specific rules

## Integration Patterns

### Agent Integration

The example demonstrates how to:

1. Create an OpenAI agent with configurable tools
2. Handle streaming chat responses in a server action
3. Integrate with React's form state management
4. Display real-time streaming responses in the UI

### Next.js Best Practices

- Uses App Router with proper server/client component separation
- Implements React Server Actions for agent communication
- Leverages Edge Runtime for optimal performance
- Follows Next.js 15 conventions with React 19 features

## Testing Role

This example serves multiple testing purposes in the e2e suite:

1. **Next.js Compatibility**: Validates LlamaIndex works with latest Next.js versions
2. **Edge Runtime Testing**: Ensures agent functionality works in edge environments
3. **Streaming Integration**: Tests real-time agent responses with AI SDK
4. **React Server Components**: Validates RSC compatibility with LlamaIndex agents
5. **Build Integration**: Confirms Next.js build process works with LlamaIndex

## Development Notes

- **Build Dependency**: This example requires the LlamaIndex packages to be built first (`pnpm build` from workspace root)
- **API Keys**: Real agent functionality requires OpenAI API key in environment variables
- **Edge Runtime**: The application is configured for edge runtime compatibility, making it suitable for Vercel deployment
- **Streaming UI**: Demonstrates modern streaming patterns for AI applications
- **Framework Integration**: Shows best practices for integrating LlamaIndex with React-based frameworks

## Environment Requirements

- Node.js environment with Next.js support
- OpenAI API key for real agent functionality (optional for basic testing)
- Compatible with Vercel Edge Runtime and standard Node.js runtime

## Common Workflows

1. **Local Development**: Run `npm run dev` after building workspace packages
2. **Testing Agent Flow**: Use the simple form interface to test streaming agent responses
3. **Build Validation**: Run `npm run build` to ensure production build compatibility
4. **Integration Testing**: Part of e2e test suite validating Next.js + LlamaIndex integration
