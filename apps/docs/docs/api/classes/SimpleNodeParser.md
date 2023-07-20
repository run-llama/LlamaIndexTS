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

[NodeParser.ts:64](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/NodeParser.ts#L64)

## Properties

### includeMetadata

• **includeMetadata**: `boolean`

#### Defined in

[NodeParser.ts:61](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/NodeParser.ts#L61)

___

### includePrevNextRel

• **includePrevNextRel**: `boolean`

#### Defined in

[NodeParser.ts:62](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/NodeParser.ts#L62)

___

### textSplitter

• **textSplitter**: [`SentenceSplitter`](SentenceSplitter.md)

#### Defined in

[NodeParser.ts:60](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/NodeParser.ts#L60)

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

[NodeParser.ts:95](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/NodeParser.ts#L95)

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

[NodeParser.ts:82](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/NodeParser.ts#L82)
