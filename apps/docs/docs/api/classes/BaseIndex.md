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

[indices/BaseIndex.ts:104](https://github.com/run-llama/LlamaIndexTS/blob/68bdaaa/packages/core/src/indices/BaseIndex.ts#L104)

## Properties

### docStore

• **docStore**: `BaseDocumentStore`

#### Defined in

[indices/BaseIndex.ts:99](https://github.com/run-llama/LlamaIndexTS/blob/68bdaaa/packages/core/src/indices/BaseIndex.ts#L99)

___

### indexStore

• `Optional` **indexStore**: `BaseIndexStore`

#### Defined in

[indices/BaseIndex.ts:101](https://github.com/run-llama/LlamaIndexTS/blob/68bdaaa/packages/core/src/indices/BaseIndex.ts#L101)

___

### indexStruct

• **indexStruct**: `T`

#### Defined in

[indices/BaseIndex.ts:102](https://github.com/run-llama/LlamaIndexTS/blob/68bdaaa/packages/core/src/indices/BaseIndex.ts#L102)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[indices/BaseIndex.ts:97](https://github.com/run-llama/LlamaIndexTS/blob/68bdaaa/packages/core/src/indices/BaseIndex.ts#L97)

___

### storageContext

• **storageContext**: [`StorageContext`](../interfaces/StorageContext.md)

#### Defined in

[indices/BaseIndex.ts:98](https://github.com/run-llama/LlamaIndexTS/blob/68bdaaa/packages/core/src/indices/BaseIndex.ts#L98)

___

### vectorStore

• `Optional` **vectorStore**: `VectorStore`

#### Defined in

[indices/BaseIndex.ts:100](https://github.com/run-llama/LlamaIndexTS/blob/68bdaaa/packages/core/src/indices/BaseIndex.ts#L100)

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

[indices/BaseIndex.ts:124](https://github.com/run-llama/LlamaIndexTS/blob/68bdaaa/packages/core/src/indices/BaseIndex.ts#L124)

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

[indices/BaseIndex.ts:117](https://github.com/run-llama/LlamaIndexTS/blob/68bdaaa/packages/core/src/indices/BaseIndex.ts#L117)
