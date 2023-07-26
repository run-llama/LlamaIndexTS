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

• **new VectorIndexRetriever**(`«destructured»`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `index` | [`VectorStoreIndex`](VectorStoreIndex.md) |
| › `similarityTopK?` | `number` |

#### Defined in

[indices/vectorStore/VectorIndexRetriever.ts:22](https://github.com/run-llama/LlamaIndexTS/blob/35f3030/packages/core/src/indices/vectorStore/VectorIndexRetriever.ts#L22)

## Properties

### index

• **index**: [`VectorStoreIndex`](VectorStoreIndex.md)

#### Defined in

[indices/vectorStore/VectorIndexRetriever.ts:18](https://github.com/run-llama/LlamaIndexTS/blob/35f3030/packages/core/src/indices/vectorStore/VectorIndexRetriever.ts#L18)

___

### serviceContext

• `Private` **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[indices/vectorStore/VectorIndexRetriever.ts:20](https://github.com/run-llama/LlamaIndexTS/blob/35f3030/packages/core/src/indices/vectorStore/VectorIndexRetriever.ts#L20)

___

### similarityTopK

• **similarityTopK**: `number`

#### Defined in

[indices/vectorStore/VectorIndexRetriever.ts:19](https://github.com/run-llama/LlamaIndexTS/blob/35f3030/packages/core/src/indices/vectorStore/VectorIndexRetriever.ts#L19)

## Methods

### getServiceContext

▸ **getServiceContext**(): [`ServiceContext`](../interfaces/ServiceContext.md)

#### Returns

[`ServiceContext`](../interfaces/ServiceContext.md)

#### Implementation of

[BaseRetriever](../interfaces/BaseRetriever.md).[getServiceContext](../interfaces/BaseRetriever.md#getservicecontext)

#### Defined in

[indices/vectorStore/VectorIndexRetriever.ts:69](https://github.com/run-llama/LlamaIndexTS/blob/35f3030/packages/core/src/indices/vectorStore/VectorIndexRetriever.ts#L69)

___

### retrieve

▸ **retrieve**(`query`, `parentEvent?`): `Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)[]\>

#### Implementation of

[BaseRetriever](../interfaces/BaseRetriever.md).[retrieve](../interfaces/BaseRetriever.md#retrieve)

#### Defined in

[indices/vectorStore/VectorIndexRetriever.ts:35](https://github.com/run-llama/LlamaIndexTS/blob/35f3030/packages/core/src/indices/vectorStore/VectorIndexRetriever.ts#L35)
