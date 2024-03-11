---
sidebar_position: 4
---

# NodeParser

The `NodeParser` in LlamaIndex is responsible for splitting `Document` objects into more manageable `Node` objects. When you call `.fromDocuments()`, the `NodeParser` from the `ServiceContext` is used to do this automatically for you. Alternatively, you can use it to split documents ahead of time.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "I am 10 years old. John is 20 years old." }),
]);
```

## TextSplitter

The underlying text splitter will split text by sentences. It can also be used as a standalone module for splitting raw text.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Hello World");
```

## MarkdownNodeParser

The `MarkdownNodeParser` is a more advanced `NodeParser` that can handle markdown documents. It will split the markdown into nodes and then parse the nodes into a `Document` object.

```typescript
import { MarkdownNodeParser } from "llamaindex";

const nodeParser = new MarkdownNodeParser();

const nodes = nodeParser.getNodesFromDocuments([
  new Document({
    text: `# Main Header
Main content

# Header 2
Header 2 content

## Sub-header
Sub-header content

  `,
  }),
]);
```

The output metadata will be something like:

```bash
[
  TextNode {
    id_: '008e41a8-b097-487c-bee8-bd88b9455844',
    metadata: { 'Header 1': 'Main Header' },
    excludedEmbedMetadataKeys: [],
    excludedLlmMetadataKeys: [],
    relationships: { PARENT: [Array] },
    hash: 'KJ5e/um/RkHaNR6bonj9ormtZY7I8i4XBPVYHXv1A5M=',
    text: 'Main Header\nMain content',
    textTemplate: '',
    metadataSeparator: '\n'
  },
  TextNode {
    id_: '0f5679b3-ba63-4aff-aedc-830c4208d0b5',
    metadata: { 'Header 1': 'Header 2' },
    excludedEmbedMetadataKeys: [],
    excludedLlmMetadataKeys: [],
    relationships: { PARENT: [Array] },
    hash: 'IP/g/dIld3DcbK+uHzDpyeZ9IdOXY4brxhOIe7wc488=',
    text: 'Header 2\nHeader 2 content',
    textTemplate: '',
    metadataSeparator: '\n'
  },
  TextNode {
    id_: 'e81e9bd0-121c-4ead-8ca7-1639d65fdf90',
    metadata: { 'Header 1': 'Header 2', 'Header 2': 'Sub-header' },
    excludedEmbedMetadataKeys: [],
    excludedLlmMetadataKeys: [],
    relationships: { PARENT: [Array] },
    hash: 'B3kYNnxaYi9ghtAgwza0ZEVKF4MozobkNUlcekDL7JQ=',
    text: 'Sub-header\nSub-header content',
    textTemplate: '',
    metadataSeparator: '\n'
  }
]
```

## API Reference

- [SimpleNodeParser](../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../api/classes/SentenceSplitter.md)
