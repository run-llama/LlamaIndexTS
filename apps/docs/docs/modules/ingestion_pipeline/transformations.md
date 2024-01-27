# Transformations

A transformation is something that takes a list of nodes as an input, and returns a list of nodes. Each component that implements the Transformatio class has both a `transform` definition responsible for transforming the nodes

Currently, the following components are Transformation objects:

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [MetadataExtractor](../documents_and_nodes/metadata_extraction.md)
- Embeddings

## Usage Pattern

While transformations are best used with with an IngestionPipeline, they can also be used directly.

```ts
import { SimpleNodeParser, TitleExtractor, Document } from "llamaindex";

async function main() {
  let nodes = new SimpleNodeParser().getNodesFromDocuments([
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

You can implement any transformation yourself by implementing the `TransformerComponent`.

The following custom transformation will remove any special characters or punctutaion in text.

```ts
import { TransformerComponent, Node } from "llamaindex";

class RemoveSpecialCharacters extends TransformerComponent {
  async transform(nodes: Node[]): Promise<Node[]> {
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
