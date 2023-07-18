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

  ↳ [`VectorStoreIndex`](VectorStoreIndex.md)

  ↳ [`ListIndex`](ListIndex.md)

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

[BaseIndex.ts:80](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/BaseIndex.ts#L80)

## Properties

### docStore

• **docStore**: `BaseDocumentStore`

#### Defined in

[BaseIndex.ts:75](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/BaseIndex.ts#L75)

___

### indexStore

• `Optional` **indexStore**: `BaseIndexStore`

#### Defined in

[BaseIndex.ts:77](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/BaseIndex.ts#L77)

___

### indexStruct

• **indexStruct**: `T`

#### Defined in

[BaseIndex.ts:78](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/BaseIndex.ts#L78)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[BaseIndex.ts:73](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/BaseIndex.ts#L73)

___

### storageContext

• **storageContext**: [`StorageContext`](../interfaces/StorageContext.md)

#### Defined in

[BaseIndex.ts:74](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/BaseIndex.ts#L74)

___

### vectorStore

• `Optional` **vectorStore**: `VectorStore`

#### Defined in

[BaseIndex.ts:76](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/BaseIndex.ts#L76)

## Methods

### asRetriever

▸ `Abstract` **asRetriever**(): [`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Returns

[`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Defined in

[BaseIndex.ts:89](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/BaseIndex.ts#L89)
