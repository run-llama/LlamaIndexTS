# LlamaCloud Integration

## Getting started

To start the examples call them from the `examples` folder:

And make sure, you're setting your `LLAMA_CLOUD_API_KEY` in your environment variable:

```shell
export LLAMA_CLOUD_API_KEY=your-api-key
```

For using another environment, also set the `LLAMA_CLOUD_BASE_URL` environment variable:

```shell
export LLAMA_CLOUD_BASE_URL="https://api.staging.llamaindex.ai"
```

## Chat Engine

This example is using the managed index named `test` from the project `default` to create a chat engine.

```shell
pnpx ts-node cloud/chat.ts
```

## Query Engine

This example shows how to use the managed index with a query engine.

```shell
pnpx ts-node cloud/query.ts
```
