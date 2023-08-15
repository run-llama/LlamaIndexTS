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

[indices/BaseIndex.ts:130](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L130)

## Properties

### docStore

• **docStore**: `BaseDocumentStore`

#### Defined in

[indices/BaseIndex.ts:125](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L125)

___

### indexStore

• `Optional` **indexStore**: `BaseIndexStore`

#### Defined in

[indices/BaseIndex.ts:127](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L127)

___

### indexStruct

• **indexStruct**: `T`

#### Defined in

[indices/BaseIndex.ts:128](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L128)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[indices/BaseIndex.ts:123](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L123)

___

### storageContext

• **storageContext**: [`StorageContext`](../interfaces/StorageContext.md)

#### Defined in

[indices/BaseIndex.ts:124](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L124)

___

### vectorStore

• `Optional` **vectorStore**: [`VectorStore`](../interfaces/VectorStore.md)

#### Defined in

[indices/BaseIndex.ts:126](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L126)

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

[indices/BaseIndex.ts:150](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L150)

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

[indices/BaseIndex.ts:143](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L143)

___

### deleteRefDoc

▸ `Abstract` **deleteRefDoc**(`refDocId`, `deleteFromDocStore?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `refDocId` | `string` |
| `deleteFromDocStore?` | `boolean` |

#### Returns

`Promise`<`void`\>

#### Defined in

[indices/BaseIndex.ts:168](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L168)

___

### insert

▸ **insert**(`document`): `Promise`<`void`\>

Insert a document into the index.

#### Parameters

| Name | Type |
| :------ | :------ |
| `document` | [`Document`](Document.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[indices/BaseIndex.ts:159](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L159)

___

### insertNodes

▸ `Abstract` **insertNodes**(`nodes`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodes` | [`BaseNode`](BaseNode.md)[] |

#### Returns

`Promise`<`void`\>

#### Defined in

[indices/BaseIndex.ts:167](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L167)
