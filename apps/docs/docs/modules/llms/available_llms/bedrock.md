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

Currently only supports Anthropic and Meta models:

```ts
ANTHROPIC_CLAUDE_INSTANT_1 = "anthropic.claude-instant-v1";
ANTHROPIC_CLAUDE_2 = "anthropic.claude-v2";
ANTHROPIC_CLAUDE_2_1 = "anthropic.claude-v2:1";
ANTHROPIC_CLAUDE_3_SONNET = "anthropic.claude-3-sonnet-20240229-v1:0";
ANTHROPIC_CLAUDE_3_HAIKU = "anthropic.claude-3-haiku-20240307-v1:0";
ANTHROPIC_CLAUDE_3_OPUS = "anthropic.claude-3-opus-20240229-v1:0"; // available on us-west-2
ANTHROPIC_CLAUDE_3_5_SONNET = "anthropic.claude-3-5-sonnet-20240620-v1:0";
ANTHROPIC_CLAUDE_3_5_HAIKU = "anthropic.claude-3-5-haiku-20241022-v1:0";
META_LLAMA2_13B_CHAT = "meta.llama2-13b-chat-v1";
META_LLAMA2_70B_CHAT = "meta.llama2-70b-chat-v1";
META_LLAMA3_8B_INSTRUCT = "meta.llama3-8b-instruct-v1:0";
META_LLAMA3_70B_INSTRUCT = "meta.llama3-70b-instruct-v1:0";
META_LLAMA3_1_8B_INSTRUCT = "meta.llama3-1-8b-instruct-v1:0"; // available on us-west-2
META_LLAMA3_1_70B_INSTRUCT = "meta.llama3-1-70b-instruct-v1:0"; // available on us-west-2
META_LLAMA3_1_405B_INSTRUCT = "meta.llama3-1-405b-instruct-v1:0"; // available on us-west-2, tool calling supported
META_LLAMA3_2_1B_INSTRUCT = "meta.llama3-2-1b-instruct-v1:0"; // only available via inference endpoints (see below)
META_LLAMA3_2_3B_INSTRUCT = "meta.llama3-2-3b-instruct-v1:0"; // only available via inference endpoints (see below)
META_LLAMA3_2_11B_INSTRUCT = "meta.llama3-2-11b-instruct-v1:0"; // only available via inference endpoints (see below), multimodal and function call supported
META_LLAMA3_2_90B_INSTRUCT = "meta.llama3-2-90b-instruct-v1:0"; // only available via inference endpoints (see below), multimodal and function call supported
```

You can also use Bedrock's Inference endpoints by using the model names:

```ts
// US
US_ANTHROPIC_CLAUDE_3_HAIKU = "us.anthropic.claude-3-haiku-20240307-v1:0";
US_ANTHROPIC_CLAUDE_3_OPUS = "us.anthropic.claude-3-opus-20240229-v1:0";
US_ANTHROPIC_CLAUDE_3_SONNET = "us.anthropic.claude-3-sonnet-20240229-v1:0";
US_ANTHROPIC_CLAUDE_3_5_SONNET = "us.anthropic.claude-3-5-sonnet-20240620-v1:0";
US_ANTHROPIC_CLAUDE_3_5_SONNET_V2 =
  "us.anthropic.claude-3-5-sonnet-20241022-v2:0";
US_META_LLAMA_3_2_1B_INSTRUCT = "us.meta.llama3-2-1b-instruct-v1:0";
US_META_LLAMA_3_2_3B_INSTRUCT = "us.meta.llama3-2-3b-instruct-v1:0";
US_META_LLAMA_3_2_11B_INSTRUCT = "us.meta.llama3-2-11b-instruct-v1:0";
US_META_LLAMA_3_2_90B_INSTRUCT = "us.meta.llama3-2-90b-instruct-v1:0";

// EU
EU_ANTHROPIC_CLAUDE_3_HAIKU = "eu.anthropic.claude-3-haiku-20240307-v1:0";
EU_ANTHROPIC_CLAUDE_3_SONNET = "eu.anthropic.claude-3-sonnet-20240229-v1:0";
EU_ANTHROPIC_CLAUDE_3_5_SONNET = "eu.anthropic.claude-3-5-sonnet-20240620-v1:0";
EU_META_LLAMA_3_2_1B_INSTRUCT = "eu.meta.llama3-2-1b-instruct-v1:0";
EU_META_LLAMA_3_2_3B_INSTRUCT = "eu.meta.llama3-2-3b-instruct-v1:0";
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

## Agent Example

```ts
import { BEDROCK_MODELS, Bedrock } from "@llamaindex/community";
import { FunctionTool, LLMAgent } from "llamaindex";

const sumNumbers = FunctionTool.from(
  ({ a, b }: { a: number; b: number }) => `${a + b}`,
  {
    name: "sumNumbers",
    description: "Use this function to sum two numbers",
    parameters: {
      type: "object",
      properties: {
        a: {
          type: "number",
          description: "The first number",
        },
        b: {
          type: "number",
          description: "The second number",
        },
      },
      required: ["a", "b"],
    },
  },
);

const divideNumbers = FunctionTool.from(
  ({ a, b }: { a: number; b: number }) => `${a / b}`,
  {
    name: "divideNumbers",
    description: "Use this function to divide two numbers",
    parameters: {
      type: "object",
      properties: {
        a: {
          type: "number",
          description: "The dividend a to divide",
        },
        b: {
          type: "number",
          description: "The divisor b to divide by",
        },
      },
      required: ["a", "b"],
    },
  },
);

const bedrock = new Bedrock({
  model: BEDROCK_MODELS.META_LLAMA3_1_405B_INSTRUCT,
  ...
});

async function main() {
  const agent = new LLMAgent({
    llm: bedrock,
    tools: [sumNumbers, divideNumbers],
  });

  const response = await agent.chat({
    message: "How much is 5 + 5? then divide by 2",
  });

  console.log(response.message);
}
```
