# Vercel Examples

These examples demonstrate how to integrate LlamaIndexTS with Vercel's AI SDK. The examples show how to use LlamaIndex for search and retrieval in both local vector store and LlamaCloud environments.

## Setup

To run these examples, first install the required dependencies from the parent folder `examples`:

```bash
npm i
```

## Running the Examples

Make sure to run the examples from the parent folder called `examples`. The following examples are available:

### Vercel LLM Example

Run the Vercel LLM example with:

```bash
npx tsx vercel/llm.ts
```

This example demonstrates using the `VercelLLM` adapter with Vercel's OpenAI model provider

### Vector Store Example

Run the local vector store example with:

```bash
npx tsx vercel/vector-store.ts
```

This example demonstrates:

- Creating a vector store index from one document
- Using Vercel's AI SDK with LlamaIndex for streaming responses

### LlamaCloud Example

To run the LlamaCloud example:

```bash
npx tsx vercel/llamacloud.ts
```

This example requires a LlamaCloud API key set in your environment and an embedding model set in the `EMBEDDING_MODEL` environment variable:

```bash
export LLAMA_CLOUD_API_KEY=your_api_key_here
export EMBEDDING_MODEL="text-embedding-3-small"
```

The example demonstrates:

- Creating a LlamaCloud index from one document
- Streaming responses using Vercel's AI SDK

For more detailed information about the Vercel integration, check out [the documentation](https://ts.llamaindex.ai/docs/llamaindex/integration/vercel).
