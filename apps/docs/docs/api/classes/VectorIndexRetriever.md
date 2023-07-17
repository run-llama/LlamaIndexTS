---
id: "VectorIndexRetriever"
title: "Class: VectorIndexRetriever"
sidebar_label: "VectorIndexRetriever"
sidebar_position: 0
custom_edit_url: null
---

VectorIndexRetriever retrieves nodes from a VectorIndex.

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

[Retriever.ts:28](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/Retriever.ts#L28)

## Properties

### index

• **index**: [`VectorStoreIndex`](VectorStoreIndex.md)

#### Defined in

[Retriever.ts:24](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/Retriever.ts#L24)

___

### serviceContext

• `Private` **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[Retriever.ts:26](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/Retriever.ts#L26)

___

### similarityTopK

• **similarityTopK**: `number` = `DEFAULT_SIMILARITY_TOP_K`

#### Defined in

[Retriever.ts:25](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/Retriever.ts#L25)

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

[Retriever.ts:33](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/Retriever.ts#L33)

___

### getServiceContext

▸ **getServiceContext**(): [`ServiceContext`](../interfaces/ServiceContext.md)

#### Returns

[`ServiceContext`](../interfaces/ServiceContext.md)

#### Implementation of

[BaseRetriever](../interfaces/BaseRetriever.md).[getServiceContext](../interfaces/BaseRetriever.md#getservicecontext)

#### Defined in

[Retriever.ts:70](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/Retriever.ts#L70)
