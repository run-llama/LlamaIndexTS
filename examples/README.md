# LlamaIndexTS Examples

This package contains several examples of how to use LlamaIndexTS.

Most examples will use OpenAI by default, so be sure to set your API key.

## Running Examples

```shell
# export your API key
export OPENAI_API_KEY="sk-..."

npx tsx ./rag/chatEngine.ts
```

## Recommended Starter Examples

Agents:

- [Basic OpenAI Agent with Tools](./agents/agent/openai.ts)
- [Agent with MCP Tools](./agents/agent/mcp-tools.ts)
- [Customizing Memory](./agents/memory/agent-memory.ts)

Workflows:

- [Workflow basics](./agents/workflow/joke.ts)
- [Find more workflow examples in the `workflows-ts` repo!](https://github.com/run-llama/workflows-ts)

Indexing, Retrieval, and Querying:

- [Basic Vector Indexing + Query Engine](./index/vectorIndex.ts)
- [Agent + Query Engine Tool](./agents/agent/query-tool.ts)

Multimodal:

- [Multimodal RAG](./multimodal/rag.ts)
- [Multimodal Chat](./multimodal/context.ts)

Some more general folders that might be useful to explore:

- [storage](./storage/): Examples with various vector stores
- [readers](./readers/): Examples of how to use the various readers
- [models](./models/): Examples of how to use the various LLMs and embedding models from many providers
