# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the LlamaIndexTS Waku Query Engine example.

## Package Overview

The `@llamaindex/waku-query-engine-test` package demonstrates LlamaIndexTS integration with the Waku React framework. This example showcases how to build a document query interface using LlamaIndex's VectorStoreIndex and QueryEngine capabilities within a Waku application that supports both static rendering and server actions.

## Development Commands

- `npm run dev` - Start Waku development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server

## Architecture

### Framework Integration

This example uses **Waku 0.22.2**, a lightweight React framework that supports:

- React Server Components (RSC)
- Server actions with "use server" directive
- Static site generation with `render: "static"` config
- Client-side hydration with "use client" components

### LlamaIndex Integration

The core LlamaIndex functionality is implemented in `src/actions.ts`:

**Key Components:**

- **Document Loading**: Reads text from `node_modules/llamaindex/examples/abramov.txt`
- **Vector Index**: Creates embeddings using `VectorStoreIndex.fromDocuments()`
- **Query Engine**: Provides semantic search capabilities via `index.asQueryEngine()`
- **Lazy Loading**: QueryEngine is initialized once and cached for subsequent requests

**Data Flow:**

1. User inputs question in chat interface (`src/components/chat.tsx`)
2. Form submission triggers server action (`chatWithAI`)
3. Server action queries the VectorStoreIndex
4. Response is returned and displayed in the UI

### Component Structure

**Server Components:**

- `src/pages/_layout.tsx` - Root layout with static metadata
- `src/pages/index.tsx` - Home page with static rendering config
- `src/components/header.tsx` - Navigation header
- `src/components/footer.tsx` - Site footer

**Client Components:**

- `src/components/chat.tsx` - Interactive chat interface with form state management

### Styling

- **TailwindCSS 4.1.4** for utility-first styling
- **PostCSS** for CSS processing
- **Nunito font** via Google Fonts
- Responsive design with mobile-first approach

## Dependencies

**Core Dependencies:**

- `@llamaindex/env` - Runtime environment compatibility
- `llamaindex` - Main LlamaIndexTS package for document indexing and querying
- `waku` - React framework for SSR/SSG
- `react` & `react-dom` - React 19.0.0 with experimental features
- `react-server-dom-webpack` - React Server Components support

**Development Dependencies:**

- `typescript` - TypeScript 5.7.3 with strict mode
- `tailwindcss` & `@tailwindcss/postcss` - Styling framework
- `rollup` - Build tool used by Waku

## TypeScript Configuration

- **Target**: ESNext with modern features
- **Module**: ESNext with bundler resolution
- **React**: Experimental types for React 19 features
- **Strict**: Full TypeScript strict mode enabled

## Key Features Demonstrated

1. **Server Actions Integration**: Seamless LlamaIndex queries via Waku server actions
2. **Document RAG**: Retrieval-Augmented Generation using vector embeddings
3. **Static Generation**: Pages are statically rendered while maintaining interactive features
4. **React 19 Features**: Uses latest React with experimental types
5. **Modern Styling**: TailwindCSS 4.x with PostCSS integration

## Testing Context

This example serves as an end-to-end test for:

- LlamaIndexTS compatibility with Waku framework
- React Server Components integration
- Vector store and query engine functionality
- Server action patterns with LlamaIndex
- Build and deployment workflows

## Development Notes

- **File Loading**: Uses `@llamaindex/env` fs abstraction for cross-platform file access
- **Query Caching**: QueryEngine is lazily loaded and cached for performance
- **Error Handling**: Basic error handling in server actions and form submissions
- **Bundle Size**: Waku's optimized bundling ensures minimal client-side JavaScript
- **Runtime Support**: Compatible with Node.js runtime environments

## Common Patterns

**Adding New Documents:**

1. Place document files in accessible location
2. Update `lazyLoadQueryEngine()` to load additional documents
3. Rebuild vector index with new document set

**Extending Chat Interface:**

1. Modify `Chat` component for enhanced UI features
2. Update `chatWithAI` server action for additional processing
3. Add error states and loading indicators as needed

**Styling Updates:**

1. Modify TailwindCSS classes in components
2. Update `tailwind.config.js` for custom configurations
3. Use `src/styles.css` for global styles
