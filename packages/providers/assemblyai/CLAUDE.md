# CLAUDE.md - @llamaindex/assemblyai

This package provides AssemblyAI reader implementations for LlamaIndex, enabling audio transcription and processing capabilities.

## Package Overview

**Package Name:** `@llamaindex/assemblyai`  
**Description:** AssemblyAI Reader for LlamaIndex  
**Version:** 0.1.6  
**Type:** Provider package for audio transcription and data ingestion

## Architecture

This package implements the BaseReader interface from `@llamaindex/core/schema` to provide audio transcription capabilities using AssemblyAI's API.

### Core Components

- `AssemblyAIReader` - Abstract base class implementing BaseReader<Document>
- `AudioTranscriptReader` - Returns full transcript as single document
- `AudioTranscriptParagraphsReader` - Returns transcript split by paragraphs
- `AudioTranscriptSentencesReader` - Returns transcript split by sentences
- `AudioSubtitlesReader` - Returns subtitles in SRT or VTT format

### Key Files

- `src/reader.ts` - Main implementation with all reader classes
- `src/index.ts` - Re-exports all readers and types

## Dependencies

- `assemblyai` (^4.8.0) - Official AssemblyAI SDK
- `@llamaindex/core` (workspace) - Core interfaces and Document class
- `@llamaindex/env` (workspace) - Environment utilities for API key handling

## Configuration

### API Key Setup

The package requires an AssemblyAI API key configured via:

1. Constructor option: `new AudioTranscriptReader({ apiKey: "your-key" })`
2. Environment variable: `ASSEMBLYAI_API_KEY`

### Default Options

The package sets default user agent information for AssemblyAI integration tracking:

```typescript
{
  userAgent: {
    integration: {
      name: "LlamaIndexTS",
      version: "1.0.1"
    }
  }
}
```

## Usage Patterns

### Basic Transcription

```typescript
import { AudioTranscriptReader } from "@llamaindex/assemblyai";

const reader = new AudioTranscriptReader();
const documents = await reader.loadData("path/to/audio.mp3");
```

### Paragraph-based Processing

```typescript
import { AudioTranscriptParagraphsReader } from "@llamaindex/assemblyai";

const reader = new AudioTranscriptParagraphsReader();
const paragraphDocs = await reader.loadData(transcribeParams);
```

### Existing Transcript Processing

All readers support both new transcription and existing transcript retrieval:

- Pass `TranscribeParams` object for new transcription
- Pass transcript ID string to retrieve existing transcript

## Build and Development

- `pnpm build` - Build package using bunchee
- `pnpm dev` - Watch mode development
- Built files output to `dist/` directory with dual CJS/ESM support

## Implementation Notes

- Uses dynamic imports for the AssemblyAI SDK to support tree-shaking
- Lazy-loads client via Promise to defer initialization
- All readers extend the abstract base class for consistent behavior
- Error handling for missing API keys with descriptive messages
- Support for both audio file URLs and local file paths via AssemblyAI SDK
