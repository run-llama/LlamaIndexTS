---
id: "SimpleNodeParser"
title: "Class: SimpleNodeParser"
sidebar_label: "SimpleNodeParser"
sidebar_position: 0
custom_edit_url: null
---

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

[NodeParser.ts:58](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/NodeParser.ts#L58)

## Properties

### includeMetadata

• **includeMetadata**: `boolean`

#### Defined in

[NodeParser.ts:55](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/NodeParser.ts#L55)

___

### includePrevNextRel

• **includePrevNextRel**: `boolean`

#### Defined in

[NodeParser.ts:56](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/NodeParser.ts#L56)

___

### textSplitter

• **textSplitter**: [`SentenceSplitter`](SentenceSplitter.md)

#### Defined in

[NodeParser.ts:54](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/NodeParser.ts#L54)

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

[NodeParser.ts:89](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/NodeParser.ts#L89)

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

[NodeParser.ts:76](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/NodeParser.ts#L76)
