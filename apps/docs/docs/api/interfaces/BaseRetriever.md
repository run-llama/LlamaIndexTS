---
id: "BaseRetriever"
title: "Interface: BaseRetriever"
sidebar_label: "BaseRetriever"
sidebar_position: 0
custom_edit_url: null
---

Retrievers retrieve the nodes that most closely match our query in similarity.

## Implemented by

- [`ListIndexLLMRetriever`](../classes/ListIndexLLMRetriever.md)
- [`ListIndexRetriever`](../classes/ListIndexRetriever.md)
- [`VectorIndexRetriever`](../classes/VectorIndexRetriever.md)

## Methods

### aretrieve

▸ **aretrieve**(`query`, `parentEvent?`): `Promise`<[`NodeWithScore`](NodeWithScore.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `parentEvent?` | [`Event`](Event.md) |

#### Returns

`Promise`<[`NodeWithScore`](NodeWithScore.md)[]\>

#### Defined in

[Retriever.ts:16](https://github.com/run-llama/LlamaIndexTS/blob/e108757/packages/core/src/Retriever.ts#L16)

___

### getServiceContext

▸ **getServiceContext**(): [`ServiceContext`](ServiceContext.md)

#### Returns

[`ServiceContext`](ServiceContext.md)

#### Defined in

[Retriever.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/e108757/packages/core/src/Retriever.ts#L17)
