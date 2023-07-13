---
id: "BaseRetriever"
title: "Interface: BaseRetriever"
sidebar_label: "BaseRetriever"
sidebar_position: 0
custom_edit_url: null
---

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

[Retriever.ts:13](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Retriever.ts#L13)

___

### getServiceContext

▸ **getServiceContext**(): [`ServiceContext`](ServiceContext.md)

#### Returns

[`ServiceContext`](ServiceContext.md)

#### Defined in

[Retriever.ts:14](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Retriever.ts#L14)
