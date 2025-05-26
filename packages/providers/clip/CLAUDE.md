# CLAUDE.md - @llamaindex/clip

This package provides CLIP (Contrastive Language-Image Pre-training) embedding functionality for LlamaIndex.TS, enabling multimodal embeddings for both text and images.

## Package Overview

**Package Name:** `@llamaindex/clip`  
**Purpose:** CLIP embedding adapter that provides multimodal embeddings using Hugging Face Transformers.js  
**Runtime Support:** Node.js only (not supported in edge/workerd environments due to transformer model requirements)

## Core Components

### ClipEmbedding Class (`src/embedding.ts`)

Main embedding class that extends `MultiModalEmbedding` from `@llamaindex/core/embeddings`:

- **Text Embeddings:** Generates embeddings for text inputs using CLIP's text model
- **Image Embeddings:** Generates embeddings for images (Blob, URL, or string paths) using CLIP's vision model
- **Model Support:** Uses Hugging Face Transformers.js with pre-trained CLIP models
- **Lazy Loading:** Models, tokenizers, and processors are loaded on-demand and cached

#### Key Methods:

- `getTextEmbedding(text: string)`: Returns text embedding as number array
- `getImageEmbedding(image: ImageType)`: Returns image embedding as number array
- Private model getters: `getTokenizer()`, `getProcessor()`, `getVisionModel()`, `getTextModel()`

### Supported Models (`src/shared.ts`)

```typescript
enum ClipEmbeddingModelType {
  XENOVA_CLIP_VIT_BASE_PATCH32 = "Xenova/clip-vit-base-patch32",
  XENOVA_CLIP_VIT_BASE_PATCH16 = "Xenova/clip-vit-base-patch16", // default
}
```

## Dependencies

- **Core:** `@huggingface/transformers` ^3.5.0 for CLIP model execution
- **LlamaIndex:** `@llamaindex/core`, `@llamaindex/env` for base classes and environment handling
- **Workspace:** `@llamaindex/openai` (dependency, likely for fallback or integration)

## Runtime Support

**Node.js:** ✅ Full support with Hugging Face Transformers.js  
**Edge/Workerd:** ❌ Not supported - uses `NotSupportCurrentRuntimeClass` binding

The package exports different entry points:

- `index.ts`: Full Node.js implementation
- `index.edge-light.ts`, `index.workerd.ts`: Both redirect to `index.non-node.ts`
- `index.non-node.ts`: Exports stub class that throws runtime not supported error

## Image Input Support

The `readImage()` helper function supports multiple image input types:

- **Blob:** Direct blob processing
- **string/URL:** Image URLs or file paths
- Throws error for unsupported input types

## Usage Example

```typescript
import { ClipEmbedding, ClipEmbeddingModelType } from "@llamaindex/clip";

const clipEmbedding = new ClipEmbedding();
// Uses default model: XENOVA_CLIP_VIT_BASE_PATCH16

// Get text embedding
const textEmbedding = await clipEmbedding.getTextEmbedding("A photo of a cat");

// Get image embedding
const imageEmbedding =
  await clipEmbedding.getImageEmbedding("path/to/image.jpg");
// or with URL: await clipEmbedding.getImageEmbedding("https://example.com/image.jpg");
// or with Blob: await clipEmbedding.getImageEmbedding(imageBlob);
```

## Development Commands

- `pnpm build`: Build package using bunchee
- `pnpm dev`: Build in watch mode
- Test from workspace root: `turbo run test --filter="@llamaindex/clip"`

## Integration Notes

- Integrates with LlamaIndex event system via `Settings.callbackManager` for transformer loading events
- Models are lazy-loaded and cached to optimize performance
- Supports the standard LlamaIndex MultiModalEmbedding interface for consistency across embedding providers
- Text and image embeddings are designed to be comparable in the same vector space (CLIP's key feature)
