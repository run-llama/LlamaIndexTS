# Metadata Extraction Usage Pattern

You can use LLMs to automate metadata extraction with our `Metadata Extractor` modules.

Our metadata extractor modules include the following "feature extractors":

- `SummaryExtractor` - automatically extracts a summary over a set of Nodes
- `QuestionsAnsweredExtractor` - extracts a set of questions that each Node can answer
- `TitleExtractor` - extracts a title over the context of each Node by document and combine them
- `KeywordExtractor` - extracts keywords over the context of each Node

Then you can chain the `Metadata Extractors` with the `IngestionPipeline` to extract metadata from a set of documents.

```ts
import {
  IngestionPipeline,
  TitleExtractor,
  QuestionsAnsweredExtractor,
  Document,
  OpenAI,
} from "llamaindex";

async function main() {
  const pipeline = new IngestionPipeline({
    transformations: [
      new TitleExtractor(),
      new QuestionsAnsweredExtractor({
        questions: 5,
      }),
    ],
  });

  const nodes = await pipeline.run({
    documents: [
      new Document({ text: "I am 10 years old. John is 20 years old." }),
    ],
  });

  for (const node of nodes) {
    console.log(node.metadata);
  }
}

main().then(() => console.log("done"));
```
