---
id: "NodeParser"
title: "Interface: NodeParser"
sidebar_label: "NodeParser"
sidebar_position: 0
custom_edit_url: null
---

A NodeParser generates TextNodes from Documents

## Implemented by

- [`SimpleNodeParser`](../classes/SimpleNodeParser.md)

## Methods

### getNodesFromDocuments

▸ **getNodesFromDocuments**(`documents`): [`TextNode`](../classes/TextNode.md)[]

Generates an array of nodes from an array of documents.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `documents` | [`Document`](../classes/Document.md)[] | The documents to generate nodes from. |

#### Returns

[`TextNode`](../classes/TextNode.md)[]

An array of nodes.

#### Defined in

[NodeParser.ts:73](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/NodeParser.ts#L73)
