# Transformations

A transformation is something that takes a list of nodes as an input, and returns a list of nodes. Each component that implements the Transformation class has both a `transform` definition responsible for transforming the nodes.

Currently, the following components are Transformation objects:

- [SentenceSplitter](../../api/classes/SentenceSplitter.md)
- [MetadataExtractor](../documents_and_nodes/metadata_extraction.md)
- [Embeddings](../embeddings/index.md)

## Usage Pattern

While transformations are best used with with an IngestionPipeline, they can also be used directly.

```ts
import { SentenceSplitter, TitleExtractor, Document } from "llamaindex";

async function main() {
  let nodes = new SentenceSplitter().getNodesFromDocuments([
    new Document({ text: "I am 10 years old. John is 20 years old." }),
  ]);

  const titleExtractor = new TitleExtractor();

  nodes = await titleExtractor.transform(nodes);

  for (const node of nodes) {
    console.log(node.getContent(MetadataMode.NONE));
  }
}

main().catch(console.error);
```

## Custom Transformations

You can implement any transformation yourself by implementing the `TransformComponent`.

The following custom transformation will remove any special characters or punctutation in text.

```ts
import { TransformComponent, TextNode } from "llamaindex";

export class RemoveSpecialCharacters extends TransformComponent {
  async transform(nodes: TextNode[]): Promise<TextNode[]> {
    for (const node of nodes) {
      node.text = node.text.replace(/[^\w\s]/gi, "");
    }

    return nodes;
  }
}
```

These can then be used directly or in any IngestionPipeline.

```ts
import { IngestionPipeline, Document } from "llamaindex";

async function main() {
  const pipeline = new IngestionPipeline({
    transformations: [new RemoveSpecialCharacters()],
  });

  const nodes = await pipeline.run({
    documents: [
      new Document({ text: "I am 10 years old. John is 20 years old." }),
    ],
  });

  for (const node of nodes) {
    console.log(node.getContent(MetadataMode.NONE));
  }
}

main().catch(console.error);
```
