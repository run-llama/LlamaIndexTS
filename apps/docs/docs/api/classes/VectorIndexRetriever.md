---
id: "VectorIndexRetriever"
title: "Class: VectorIndexRetriever"
sidebar_label: "VectorIndexRetriever"
sidebar_position: 0
custom_edit_url: null
---

## Implements

- [`BaseRetriever`](../interfaces/BaseRetriever.md)

## Constructors

### constructor

• **new VectorIndexRetriever**(`index`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `index` | [`VectorStoreIndex`](VectorStoreIndex.md) |

#### Defined in

[Retriever.ts:22](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Retriever.ts#L22)

## Properties

### index

• **index**: [`VectorStoreIndex`](VectorStoreIndex.md)

#### Defined in

[Retriever.ts:18](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Retriever.ts#L18)

___

### serviceContext

• `Private` **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[Retriever.ts:20](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Retriever.ts#L20)

___

### similarityTopK

• **similarityTopK**: `number` = `DEFAULT_SIMILARITY_TOP_K`

#### Defined in

[Retriever.ts:19](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Retriever.ts#L19)

## Methods

### aretrieve

▸ **aretrieve**(`query`, `parentEvent?`): `Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)[]\>

#### Implementation of

[BaseRetriever](../interfaces/BaseRetriever.md).[aretrieve](../interfaces/BaseRetriever.md#aretrieve)

#### Defined in

[Retriever.ts:27](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Retriever.ts#L27)

___

### getServiceContext

▸ **getServiceContext**(): [`ServiceContext`](../interfaces/ServiceContext.md)

#### Returns

[`ServiceContext`](../interfaces/ServiceContext.md)

#### Implementation of

[BaseRetriever](../interfaces/BaseRetriever.md).[getServiceContext](../interfaces/BaseRetriever.md#getservicecontext)

#### Defined in

[Retriever.ts:64](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Retriever.ts#L64)
