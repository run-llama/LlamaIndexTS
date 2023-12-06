---
id: "NodeParser"
title: "Interface: NodeParser"
sidebar_label: "NodeParser"
sidebar_position: 0
custom_edit_url: null
---

A NodeParser generates Nodes from Documents

## Implemented by

- [`SimpleNodeParser`](../classes/SimpleNodeParser.md)

## Methods

### getNodesFromDocuments

▸ **getNodesFromDocuments**(`documents`): [`BaseNode`](../classes/BaseNode.md)<[`Metadata`](../#metadata)\>[]

Generates an array of nodes from an array of documents.

#### Parameters

| Name        | Type                                                                | Description                           |
| :---------- | :------------------------------------------------------------------ | :------------------------------------ |
| `documents` | [`BaseNode`](../classes/BaseNode.md)<[`Metadata`](../#metadata)\>[] | The documents to generate nodes from. |

#### Returns

[`BaseNode`](../classes/BaseNode.md)<[`Metadata`](../#metadata)\>[]

An array of nodes.

#### Defined in

[packages/core/src/NodeParser.ts:86](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/NodeParser.ts#L86)
