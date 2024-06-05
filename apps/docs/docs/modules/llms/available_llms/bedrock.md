# Bedrock

## Usage

```ts
import { BEDROCK_MODELS, Bedrock } from "@llamaindex/community";

Settings.llm = new Bedrock({
  model: BEDROCK_MODELS.ANTHROPIC_CLAUDE_3_HAIKU,
  region: "us-east-1", // can be provided via env AWS_REGION
  credentials: {
    accessKeyId: "...", // optional and can be provided via env AWS_ACCESS_KEY_ID
    secretAccessKey: "...", // optional and can be provided via env AWS_SECRET_ACCESS_KEY
  },
});
```

Currently only supports Anthropic models:

```ts
ANTHROPIC_CLAUDE_INSTANT_1 = "anthropic.claude-instant-v1";
ANTHROPIC_CLAUDE_2 = "anthropic.claude-v2";
ANTHROPIC_CLAUDE_2_1 = "anthropic.claude-v2:1";
ANTHROPIC_CLAUDE_3_SONNET = "anthropic.claude-3-sonnet-20240229-v1:0";
ANTHROPIC_CLAUDE_3_HAIKU = "anthropic.claude-3-haiku-20240307-v1:0";
ANTHROPIC_CLAUDE_3_OPUS = "anthropic.claude-3-opus-20240229-v1:0"; // Not currently on Bedrock
```

Sonnet, Haiku and Opus are multimodal, image_url only supports base64 data url format, e.g. `data:image/jpeg;base64,SGVsbG8sIFdvcmxkIQ==`

## Full Example

```ts
import { BEDROCK_MODELS, Bedrock } from "llamaindex";

Settings.llm = new Bedrock({
  model: BEDROCK_MODELS.ANTHROPIC_CLAUDE_3_HAIKU,
});

async function main() {
  const document = new Document({ text: essay, id_: "essay" });

  // Load and index documents
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Create a query engine
  const queryEngine = index.asQueryEngine({
    retriever,
  });

  const query = "What is the meaning of life?";

  // Query
  const response = await queryEngine.query({
    query,
  });

  // Log the response
  console.log(response.response);
}
```
