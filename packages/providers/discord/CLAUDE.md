# CLAUDE.md - Discord Provider

This package provides a Discord Reader for LlamaIndex.TS that enables reading and processing Discord channel messages as documents.

## Package Overview

- **Package Name**: `@llamaindex/discord`
- **Description**: Discord Reader for LlamaIndex
- **Type**: Data ingestion provider for Discord channels
- **Current Version**: 0.1.6

## Architecture

The Discord provider implements the `BaseReader` interface from `@llamaindex/core/schema` and provides a single class:

### DiscordReader

Located in `src/reader.ts`, this class uses the Discord REST API to read messages from Discord channels and convert them into LlamaIndex Document objects.

**Key Dependencies:**

- `@discordjs/rest` - Discord's official REST client
- `discord-api-types` - TypeScript types for Discord API
- `@llamaindex/core/schema` - Core LlamaIndex interfaces
- `@llamaindex/env` - Environment variable access

## Core Functionality

### Authentication

The reader requires a Discord bot token, which can be provided:

1. As a constructor parameter: `new DiscordReader(token)`
2. Via environment variable: `DISCORD_TOKEN`

### Message Reading

- Reads messages from Discord channels using channel IDs
- Converts each message into a LlamaIndex `Document` object
- Supports reading from multiple channels in a single operation

### Document Structure

Each Discord message becomes a Document with:

- **Text**: Message content (with optional embedded content and attachment URLs)
- **ID**: Discord message ID
- **Metadata**:
  - `messageId`: Discord message ID
  - `username`: Author username
  - `createdAt`: Message creation timestamp (ISO string)
  - `editedAt`: Edit timestamp if message was edited (ISO string)

### Features

- **Embedded Messages**: Optional inclusion of embedded content as formatted text
- **Attachments**: Optional inclusion of attachment URLs in document text
- **Message Limits**: Optional limit on number of messages per channel
- **Message Order**: Optional oldest-first reading (default is newest-first)
- **Error Handling**: Graceful handling of API errors (returns empty array)

## Usage Example

```typescript
import { DiscordReader } from "@llamaindex/discord";

// Initialize with token
const reader = new DiscordReader("your-discord-bot-token");

// Or use environment variable DISCORD_TOKEN
const reader = new DiscordReader();

// Load messages from channels
const documents = await reader.loadData(
  ["channel-id-1", "channel-id-2"], // Channel IDs
  100, // Limit messages per channel (optional)
  true, // Include embedded content and attachments (optional)
  false, // Newest first (optional, default false)
);
```

## API Reference

### DiscordReader.loadData()

Main method for loading Discord messages as documents.

**Parameters:**

- `channelIds: string[]` - Array of Discord channel IDs
- `limit?: number` - Optional limit on messages per channel
- `additionalInfo?: boolean` - Include embedded messages and attachment URLs
- `oldestFirst?: boolean` - Read oldest messages first (default: false)

**Returns:** `Promise<Document[]>` - Array of LlamaIndex Document objects

## Build and Development

Uses standard LlamaIndex.TS tooling:

- **Build**: `pnpm build` (uses bunchee)
- **Development**: `pnpm dev` (watch mode)
- **Package Structure**: Exports both ESM and CJS formats

## Discord Bot Setup

To use this reader, you need:

1. A Discord application and bot token
2. Bot permissions to read message history in target channels
3. Access to the Discord server containing the channels

## Error Handling

The reader implements graceful error handling:

- Invalid tokens result in constructor errors
- API errors during message reading are logged and return empty arrays
- Invalid channel IDs are validated and throw descriptive errors
