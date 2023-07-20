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

[indices/BaseIndex.ts:76](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/indices/BaseIndex.ts#L76)

## Properties

### docStore

• **docStore**: `BaseDocumentStore`

#### Defined in

[indices/BaseIndex.ts:71](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/indices/BaseIndex.ts#L71)

___

### indexStore

• `Optional` **indexStore**: `BaseIndexStore`

#### Defined in

[indices/BaseIndex.ts:73](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/indices/BaseIndex.ts#L73)

___

### indexStruct

• **indexStruct**: `T`

#### Defined in

[indices/BaseIndex.ts:74](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/indices/BaseIndex.ts#L74)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[indices/BaseIndex.ts:69](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/indices/BaseIndex.ts#L69)

___

### storageContext

• **storageContext**: [`StorageContext`](../interfaces/StorageContext.md)

#### Defined in

[indices/BaseIndex.ts:70](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/indices/BaseIndex.ts#L70)

___

### vectorStore

• `Optional` **vectorStore**: `VectorStore`

#### Defined in

[indices/BaseIndex.ts:72](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/indices/BaseIndex.ts#L72)

## Methods

### asRetriever

▸ `Abstract` **asRetriever**(): [`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Returns

[`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Defined in

[indices/BaseIndex.ts:85](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/indices/BaseIndex.ts#L85)
