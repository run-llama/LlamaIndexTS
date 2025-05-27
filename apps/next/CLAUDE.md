# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the LlamaIndex.TS documentation site.

## Application Overview

This is a Next.js documentation site (`@llamaindex/doc`) that serves as the official documentation for LlamaIndex.TS. It's built using Fumadocs, a modern documentation framework, and includes interactive features, API documentation generation, and AI-powered chat functionality.

## Development Commands

From this directory (`apps/next/`):

- `pnpm dev` - Start development server with Turbo
- `pnpm build` - Build the documentation site (includes `prebuild` step)
- `pnpm start` - Start production server
- `pnpm build:docs` - Generate API documentation from TypeScript source
- `pnpm validate-links` - Validate all internal and external links

Key build process:

1. `prebuild` runs `build:docs` to generate API documentation using TypeDoc
2. `build` runs Next.js build process
3. `postbuild` runs post-processing scripts and link validation

## Architecture

### Framework Stack

- **Next.js 15.3** - React framework with App Router
- **Fumadocs** - Documentation framework with MDX support
- **React Server Components** - AI chat functionality with server actions
- **Tailwind CSS** - Styling with custom design system
- **TypeScript** - Full type safety

### Key Dependencies

- **Fumadocs ecosystem**: `fumadocs-ui`, `fumadocs-mdx`, `fumadocs-core`, `fumadocs-openapi`
- **AI features**: `ai` package for React Server Components chat
- **Code features**: Monaco Editor, Shiki syntax highlighting, Twoslash TypeScript integration
- **UI components**: Radix UI primitives, Framer Motion animations
- **Content processing**: MDX, remark/rehype plugins, TypeDoc for API generation

### Directory Structure

**Content Management:**

- `src/content/docs/` - MDX documentation files organized by topic
- `src/content/docs/api/` - Auto-generated API documentation from TypeScript
- `scripts/` - Build-time documentation generation and validation

**Application Code:**

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable React components including UI library
- `src/lib/` - Utilities, constants, and configuration

**Configuration:**

- `source.config.ts` - Fumadocs MDX configuration with plugins
- `next.config.mjs` - Next.js configuration with MDX integration
- `tailwind.config.mjs` - Tailwind CSS customization

### Key Features

**Documentation Features:**

- MDX-based content with TypeScript code highlighting
- Auto-generated API documentation from TypeScript source
- Interactive code examples with Monaco Editor
- Math equation support with KaTeX
- Link validation and build-time checks

**Interactive Features:**

- AI-powered chat interface using React Server Components
- Code demos with live TypeScript execution
- Interactive UI components and animations
- Search functionality across all documentation

**Build Process:**

- TypeDoc generates API documentation from workspace packages
- Custom scripts transform and validate generated content
- Link checking ensures all internal/external links work
- Static site generation with 10-minute timeout for large documentation set

### Configuration Files

**source.config.ts**: Defines MDX processing pipeline with:

- Code highlighting themes (Catppuccin)
- Twoslash TypeScript integration
- Remark/rehype plugins for enhanced Markdown
- Content directories including external docs

**next.config.mjs**: Next.js configuration with:

- Extended static generation timeout (10 minutes)
- Monaco Editor transpilation
- Server external packages for build optimization
- Webpack/Turbopack aliases for browser compatibility

### Content Organization

**Documentation Structure:**

- `/docs/llamaindex/` - Core LlamaIndex.TS documentation
- `/docs/cloud/` - LlamaCloud integration guides
- `/docs/api/` - Auto-generated TypeScript API reference

**Content Sources:**

- Local MDX files in `src/content/docs/`
- External docs from `@llama-flow/docs` package
- Generated API docs from TypeScript source

### Development Notes

- Documentation content is sourced from multiple locations including external packages
- API documentation is regenerated on each build from TypeScript source
- The site uses advanced MDX features including custom transformers and plugins
- Build process includes comprehensive link validation
- Large memory allocation needed for TypeDoc generation (`--max-old-space-size=8192`)
- Chat functionality uses React Server Components with streaming responses

### AI Chat Integration

The documentation includes an AI chat feature that:

- Uses React Server Components for server-side AI processing
- Integrates with LlamaIndex.TS packages for demonstrations
- Provides interactive examples and code generation
- Streams responses for better user experience

### Content Authoring

When adding new documentation:

- Create MDX files in appropriate `src/content/docs/` subdirectories
- Follow existing content structure and frontmatter conventions
- Use Fumadocs MDX features like code blocks, callouts, and tabs
- API documentation is auto-generated - edit TypeScript source comments instead
- Run `pnpm validate-links` to check all links before publishing
