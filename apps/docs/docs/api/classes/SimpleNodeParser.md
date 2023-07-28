---
id: "SimpleNodeParser"
title: "Class: SimpleNodeParser"
sidebar_label: "SimpleNodeParser"
sidebar_position: 0
custom_edit_url: null
---

SimpleNodeParser is the default NodeParser. It splits documents into TextNodes using a splitter, by default SentenceSplitter

## Implements

- [`NodeParser`](../interfaces/NodeParser.md)

## Constructors

### constructor

• **new SimpleNodeParser**(`init?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `init?` | `Object` |
| `init.chunkOverlap?` | `number` |
| `init.chunkSize?` | `number` |
| `init.includeMetadata?` | `boolean` |
| `init.includePrevNextRel?` | `boolean` |
| `init.textSplitter?` | [`SentenceSplitter`](SentenceSplitter.md) |

#### Defined in

[NodeParser.ts:93](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/NodeParser.ts#L93)

## Properties

### includeMetadata

• **includeMetadata**: `boolean`

Whether to include metadata in the nodes.

#### Defined in

[NodeParser.ts:87](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/NodeParser.ts#L87)

___

### includePrevNextRel

• **includePrevNextRel**: `boolean`

Whether to include previous and next relationships in the nodes.

#### Defined in

[NodeParser.ts:91](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/NodeParser.ts#L91)

___

### textSplitter

• **textSplitter**: [`SentenceSplitter`](SentenceSplitter.md)

The text splitter to use.

#### Defined in

[NodeParser.ts:83](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/NodeParser.ts#L83)

## Methods

### getNodesFromDocuments

▸ **getNodesFromDocuments**(`documents`): [`TextNode`](TextNode.md)[]

Generate Node objects from documents

#### Parameters

| Name | Type |
| :------ | :------ |
| `documents` | [`Document`](Document.md)[] |

#### Returns

[`TextNode`](TextNode.md)[]

#### Implementation of

[NodeParser](../interfaces/NodeParser.md).[getNodesFromDocuments](../interfaces/NodeParser.md#getnodesfromdocuments)

#### Defined in

[NodeParser.ts:124](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/NodeParser.ts#L124)

___

### fromDefaults

▸ `Static` **fromDefaults**(`init?`): [`SimpleNodeParser`](SimpleNodeParser.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `init?` | `Object` |
| `init.chunkOverlap?` | `number` |
| `init.chunkSize?` | `number` |
| `init.includeMetadata?` | `boolean` |
| `init.includePrevNextRel?` | `boolean` |

#### Returns

[`SimpleNodeParser`](SimpleNodeParser.md)

#### Defined in

[NodeParser.ts:111](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/NodeParser.ts#L111)
