---
id: "BaseIndex"
title: "Class: BaseIndex<T>"
sidebar_label: "BaseIndex"
sidebar_position: 0
custom_edit_url: null
---

Indexes are the data structure that we store our nodes and embeddings in so
they can be retrieved for our queries.

## Type parameters

| Name |
| :------ |
| `T` |

## Hierarchy

- **`BaseIndex`**

  ↳ [`ListIndex`](ListIndex.md)

  ↳ [`VectorStoreIndex`](VectorStoreIndex.md)

## Constructors

### constructor

• **new BaseIndex**<`T`\>(`init`)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `init` | [`BaseIndexInit`](../interfaces/BaseIndexInit.md)<`T`\> |

#### Defined in

[indices/BaseIndex.ts:78](https://github.com/run-llama/LlamaIndexTS/blob/87925a3/packages/core/src/indices/BaseIndex.ts#L78)

## Properties

### docStore

• **docStore**: `BaseDocumentStore`

#### Defined in

[indices/BaseIndex.ts:73](https://github.com/run-llama/LlamaIndexTS/blob/87925a3/packages/core/src/indices/BaseIndex.ts#L73)

___

### indexStore

• `Optional` **indexStore**: `BaseIndexStore`

#### Defined in

[indices/BaseIndex.ts:75](https://github.com/run-llama/LlamaIndexTS/blob/87925a3/packages/core/src/indices/BaseIndex.ts#L75)

___

### indexStruct

• **indexStruct**: `T`

#### Defined in

[indices/BaseIndex.ts:76](https://github.com/run-llama/LlamaIndexTS/blob/87925a3/packages/core/src/indices/BaseIndex.ts#L76)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[indices/BaseIndex.ts:71](https://github.com/run-llama/LlamaIndexTS/blob/87925a3/packages/core/src/indices/BaseIndex.ts#L71)

___

### storageContext

• **storageContext**: [`StorageContext`](../interfaces/StorageContext.md)

#### Defined in

[indices/BaseIndex.ts:72](https://github.com/run-llama/LlamaIndexTS/blob/87925a3/packages/core/src/indices/BaseIndex.ts#L72)

___

### vectorStore

• `Optional` **vectorStore**: `VectorStore`

#### Defined in

[indices/BaseIndex.ts:74](https://github.com/run-llama/LlamaIndexTS/blob/87925a3/packages/core/src/indices/BaseIndex.ts#L74)

## Methods

### asQueryEngine

▸ `Abstract` **asQueryEngine**(`options?`): [`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)

Create a new query engine from the index. It will also create a retriever
and response synthezier if they are not provided.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | `Object` | you can supply your own custom Retriever and ResponseSynthesizer |
| `options.responseSynthesizer?` | [`ResponseSynthesizer`](ResponseSynthesizer.md) | - |
| `options.retriever?` | [`BaseRetriever`](../interfaces/BaseRetriever.md) | - |

#### Returns

[`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)

#### Defined in

[indices/BaseIndex.ts:98](https://github.com/run-llama/LlamaIndexTS/blob/87925a3/packages/core/src/indices/BaseIndex.ts#L98)

___

### asRetriever

▸ `Abstract` **asRetriever**(`options?`): [`BaseRetriever`](../interfaces/BaseRetriever.md)

Create a new retriever from the index.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `any` |

#### Returns

[`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Defined in

[indices/BaseIndex.ts:91](https://github.com/run-llama/LlamaIndexTS/blob/87925a3/packages/core/src/indices/BaseIndex.ts#L91)
