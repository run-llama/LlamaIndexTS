---
sidebar_position: 6
---

# ResponseSynthesizer

The ResponseSynthesizer is responsible for sending the query, nodes, and prompt templates to the LLM to generate a response. There are a few key modes for generating a response:

- `Refine`: "create and refine" an answer by sequentially going through each retrieved text chunk.
  This makes a separate LLM call per Node. Good for more detailed answers.
- `CompactAndRefine` (default): "compact" the prompt during each LLM call by stuffing as
  many text chunks that can fit within the maximum prompt size. If there are
  too many chunks to stuff in one prompt, "create and refine" an answer by going through
  multiple compact prompts. The same as `refine`, but should result in less LLM calls.
- `TreeSummarize`: Given a set of text chunks and the query, recursively construct a tree
  and return the root node as the response. Good for summarization purposes.
- `SimpleResponseBuilder`: Given a set of text chunks and the query, apply the query to each text
  chunk while accumulating the responses into an array. Returns a concatenated string of all
  responses. Good for when you need to run the same query separately against each text
  chunk.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "I am 10 years old." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John is 20 years old." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize({
  query: "What age am I?",
  nodesWithScore,
});
console.log(response.response);
```

The `synthesize` function also supports streaming, just add `stream: true` as an option:

```typescript
const stream = await responseSynthesizer.synthesize({
  query: "What age am I?",
  nodesWithScore,
  stream: true,
});
for await (const chunk of stream) {
  process.stdout.write(chunk.response);
}
```

## API Reference

- [ResponseSynthesizer](../../api/classes/ResponseSynthesizer.md)
- [Refine](../../api/classes/Refine.md)
- [CompactAndRefine](../../api/classes/CompactAndRefine.md)
- [TreeSummarize](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder](../../api/classes/SimpleResponseBuilder.md)
