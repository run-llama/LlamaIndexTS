# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the vite-import-llamaindex example package.

## Package Overview

The `vite-import-llamaindex` package is a minimal Vite-based compatibility test that validates LlamaIndexTS can be properly imported and bundled in browser environments using Vite. This example serves as both an integration test and a demonstration of bundle size validation.

## Purpose

This example specifically tests:

- **Vite Bundler Compatibility**: Ensures LlamaIndexTS works correctly with Vite's bundling system
- **Browser Import Validation**: Validates that the `llamaindex` package can be imported in browser-compatible builds
- **Bundle Size Monitoring**: Uses size-limit to track and validate bundle output size
- **Dual Module Support**: Tests both ESM and CJS output formats through Vite's library mode

## Development Commands

Local package commands:

- `npm run build` - Build the example using Vite library mode
- `npm run size-limit` - Check bundle size against configured limits

From the root directory:

- `pnpm build` - Build all packages (required before testing)
- `pnpm e2e` - Run all e2e tests including this example

## Project Structure

```
vite-import-llamaindex/
├── src/
│   └── main.ts          # Main entry point that imports llamaindex
├── public/
│   └── vite.svg         # Vite logo asset
├── package.json         # Package configuration with size-limit setup
├── vite.config.ts       # Vite library build configuration
├── tsconfig.json        # TypeScript configuration
└── CHANGELOG.md         # Version history
```

## Configuration Details

### Vite Configuration (`vite.config.ts`)

- **Library Mode**: Configured to build as a library with dual format output (ESM + CJS)
- **Entry Point**: `src/main.ts` as the main entry
- **Output Name**: `LlamaIndexImportTest`
- **Formats**: Both ES modules and CommonJS for compatibility testing

### TypeScript Configuration (`tsconfig.json`)

- **Target**: ES2020 for modern browser compatibility
- **Module System**: ESNext with bundler resolution for Vite
- **Strict Mode**: Enabled with comprehensive linting rules
- **DOM Types**: Includes DOM and DOM.Iterable for browser environment

### Bundle Size Monitoring

The package uses `size-limit` to monitor bundle size:

```json
"size-limit": [
  {
    "path": "dist/LlamaIndexImportTest.js"
  }
]
```

This ensures the bundled output remains within reasonable size constraints for browser applications.

## Test Approach

The test validates:

1. **Import Success**: The `llamaindex` package can be imported without errors
2. **Bundle Generation**: Vite can successfully bundle the code into browser-compatible output
3. **Size Validation**: The resulting bundle meets size requirements
4. **Module Compatibility**: Both ESM and CJS outputs are generated correctly

## Dependencies

- **`llamaindex`**: Workspace dependency for testing the main package
- **`vite`**: Build tool and bundler
- **`typescript`**: TypeScript compiler
- **`@size-limit/preset-big-lib`**: Bundle size analysis for libraries
- **`size-limit`**: Bundle size monitoring tool

## Development Notes

- **Build Dependency**: This example depends on the main `llamaindex` package being built first
- **Browser Focus**: Specifically tests browser compatibility, not Node.js environments
- **Size Monitoring**: Bundle size is actively monitored to prevent bloat
- **Minimal Example**: Kept intentionally simple to isolate bundling issues
- **Integration Test**: Serves as both an example and an automated test in the e2e suite

## Common Issues

1. **Build Failures**: Ensure `pnpm build` is run from the root before testing this example
2. **Size Limit Violations**: If bundle size exceeds limits, investigate dependency bloat
3. **Import Errors**: Check that the `llamaindex` package exports are browser-compatible
4. **TypeScript Errors**: Verify TypeScript configuration matches Vite requirements

## Relationship to E2E Testing

This example is part of the broader e2e testing suite and validates that LlamaIndexTS maintains browser compatibility. It ensures that when users integrate LlamaIndexTS with Vite in their own projects, they won't encounter bundling or import issues.
