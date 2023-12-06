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

| Name                       | Type                                      |
| :------------------------- | :---------------------------------------- |
| `init?`                    | `Object`                                  |
| `init.chunkOverlap?`       | `number`                                  |
| `init.chunkSize?`          | `number`                                  |
| `init.includeMetadata?`    | `boolean`                                 |
| `init.includePrevNextRel?` | `boolean`                                 |
| `init.textSplitter?`       | [`SentenceSplitter`](SentenceSplitter.md) |

#### Defined in

[packages/core/src/NodeParser.ts:106](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/NodeParser.ts#L106)

## Properties

### includeMetadata

• **includeMetadata**: `boolean`

Whether to include metadata in the nodes.

#### Defined in

[packages/core/src/NodeParser.ts:100](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/NodeParser.ts#L100)

---

### includePrevNextRel

• **includePrevNextRel**: `boolean`

Whether to include previous and next relationships in the nodes.

#### Defined in

[packages/core/src/NodeParser.ts:104](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/NodeParser.ts#L104)

---

### textSplitter

• **textSplitter**: [`SentenceSplitter`](SentenceSplitter.md)

The text splitter to use.

#### Defined in

[packages/core/src/NodeParser.ts:96](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/NodeParser.ts#L96)

## Methods

### getNodesFromDocuments

▸ **getNodesFromDocuments**(`documents`): ([`TextNode`](TextNode.md)<[`Metadata`](../#metadata)\> \| [`ImageDocument`](ImageDocument.md)<`any`\>)[]

Generate Node objects from documents

#### Parameters

| Name        | Type                                                     |
| :---------- | :------------------------------------------------------- |
| `documents` | [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>[] |

#### Returns

([`TextNode`](TextNode.md)<[`Metadata`](../#metadata)\> \| [`ImageDocument`](ImageDocument.md)<`any`\>)[]

#### Implementation of

[NodeParser](../interfaces/NodeParser.md).[getNodesFromDocuments](../interfaces/NodeParser.md#getnodesfromdocuments)

#### Defined in

[packages/core/src/NodeParser.ts:137](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/NodeParser.ts#L137)

---

### fromDefaults

▸ `Static` **fromDefaults**(`init?`): [`SimpleNodeParser`](SimpleNodeParser.md)

#### Parameters

| Name                       | Type      |
| :------------------------- | :-------- |
| `init?`                    | `Object`  |
| `init.chunkOverlap?`       | `number`  |
| `init.chunkSize?`          | `number`  |
| `init.includeMetadata?`    | `boolean` |
| `init.includePrevNextRel?` | `boolean` |

#### Returns

[`SimpleNodeParser`](SimpleNodeParser.md)

#### Defined in

[packages/core/src/NodeParser.ts:124](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/NodeParser.ts#L124)
