# CLAUDE.md - Hugging Face Provider

This package provides Hugging Face integration for LlamaIndex.TS, enabling the use of Hugging Face models for both language generation and text embeddings.

## Package Overview

**Package:** `@llamaindex/huggingface`  
**Description:** Hugging Face Adapter for LlamaIndex  
**Version:** 0.1.11

## Architecture

This package provides two main approaches for using Hugging Face models:

### 1. Local Models via @huggingface/transformers

- **HuggingFaceLLM** - Runs models locally using @xenova/transformers
- **HuggingFaceEmbedding** - Local embedding generation via feature extraction pipelines

### 2. Remote API via Hugging Face Inference API

- **HuggingFaceInferenceAPI** - Text generation via HF Inference API
- **HuggingFaceInferenceAPIEmbedding** - Embedding generation via HF Inference API

## Key Components

### HuggingFaceLLM (src/llm.ts:31-149)

Local LLM implementation using @huggingface/transformers:

- **Default Model:** `stabilityai/stablelm-tuned-alpha-3b`
- **Features:** Non-streaming chat completion
- **Limitations:** Streaming not yet supported (awaiting @xenova/transformers v3)
- **Runtime Support:** Uses `loadTransformers` from `@llamaindex/env/multi-model`

### HuggingFaceEmbedding (src/embedding.ts:37-78)

Local embedding generation:

- **Default Model:** `Xenova/all-MiniLM-L6-v2`
- **Method:** Feature extraction pipeline with mean pooling and normalization
- **Supported Models:** Various models via `HuggingFaceEmbeddingModelType` enum

### HuggingFaceInferenceAPI (src/shared.ts:89-192)

Remote API-based LLM:

- **Features:** Both streaming and non-streaming chat
- **Requirements:** Hugging Face access token
- **Chat Template:** Custom prompt formatting for system/user/assistant roles
- **API:** Uses `@huggingface/inference` package

### HuggingFaceInferenceAPIEmbedding (src/shared.ts:34-62)

Remote API-based embeddings:

- **Features:** Single text and batch text embedding
- **Requirements:** Hugging Face access token and model name
- **API:** Uses feature extraction endpoint

## Configuration

### Local Models

```typescript
// LLM
const llm = new HuggingFaceLLM({
  modelName: "stabilityai/stablelm-tuned-alpha-3b",
  temperature: 0.1,
  maxTokens: 1000,
  contextWindow: 3900,
});

// Embeddings
const embedding = new HuggingFaceEmbedding({
  modelType: HuggingFaceEmbeddingModelType.XENOVA_ALL_MPNET_BASE_V2,
});
```

### API-based Models

```typescript
// LLM
const llm = new HuggingFaceInferenceAPI({
  model: "microsoft/DialoGPT-large",
  accessToken: "hf_...",
  temperature: 0.1,
});

// Embeddings
const embedding = new HuggingFaceInferenceAPIEmbedding({
  model: "sentence-transformers/all-MiniLM-L6-v2",
  accessToken: "hf_...",
});
```

## Dependencies

**Core Dependencies:**

- `@huggingface/inference`: ^2.8.1 - HF Inference API client
- `@huggingface/transformers`: ^3.5.0 - Local transformer models
- `@llamaindex/openai`: workspace:\* - (unused in current implementation)

**Peer Dependencies:**

- `@llamaindex/core`: Core LlamaIndex interfaces and base classes
- `@llamaindex/env`: Multi-runtime environment abstraction

## Runtime Support

Supports multiple JavaScript runtimes through conditional exports:

- **Node.js:** Standard implementation
- **Edge Runtime:** `index.edge-light.ts`
- **Cloudflare Workers:** `index.workerd.ts`
- **Non-Node environments:** `index.non-node.ts`

## Known Limitations

### HuggingFaceLLM Streaming

- Streaming chat is not implemented (throws error)
- Waiting for @xenova/transformers v3 support
- See: src/llm.ts:143-148

### API Dependencies

- Remote API features require valid Hugging Face access tokens
- Model availability depends on HF model hub status

## Build & Development

Uses the standard LlamaIndex.TS build process:

- **Build:** `pnpm build` (uses bunchee)
- **Dev:** `pnpm dev` (watch mode)
- **Output:** Dual CJS/ESM builds in `dist/`

## Integration Notes

- Model loading triggers `load-transformers` events via Settings.callbackManager
- Lazy loading of transformer models and tokenizers for performance
- Extends standard LlamaIndex base classes (`BaseLLM`, `BaseEmbedding`)
- Compatible with LlamaIndex workflow and agent systems
