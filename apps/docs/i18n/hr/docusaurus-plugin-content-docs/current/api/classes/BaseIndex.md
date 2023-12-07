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
| :--- |
| `T`  |

## Hierarchy

- **`BaseIndex`**

  ↳ [`KeywordTableIndex`](KeywordTableIndex.md)

  ↳ [`SummaryIndex`](SummaryIndex.md)

  ↳ [`VectorStoreIndex`](VectorStoreIndex.md)

## Constructors

### constructor

• **new BaseIndex**<`T`\>(`init`)

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name   | Type                                                    |
| :----- | :------------------------------------------------------ |
| `init` | [`BaseIndexInit`](../interfaces/BaseIndexInit.md)<`T`\> |

#### Defined in

[packages/core/src/indices/BaseIndex.ts:161](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L161)

## Properties

### docStore

• **docStore**: [`BaseDocumentStore`](BaseDocumentStore.md)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:156](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L156)

---

### indexStore

• `Optional` **indexStore**: [`BaseIndexStore`](BaseIndexStore.md)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:158](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L158)

---

### indexStruct

• **indexStruct**: `T`

#### Defined in

[packages/core/src/indices/BaseIndex.ts:159](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L159)

---

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:154](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L154)

---

### storageContext

• **storageContext**: [`StorageContext`](../interfaces/StorageContext.md)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:155](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L155)

---

### vectorStore

• `Optional` **vectorStore**: [`VectorStore`](../interfaces/VectorStore.md)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:157](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L157)

## Methods

### asQueryEngine

▸ `Abstract` **asQueryEngine**(`options?`): [`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)

Create a new query engine from the index. It will also create a retriever
and response synthezier if they are not provided.

#### Parameters

| Name                           | Type                                              | Description                                                      |
| :----------------------------- | :------------------------------------------------ | :--------------------------------------------------------------- |
| `options?`                     | `Object`                                          | you can supply your own custom Retriever and ResponseSynthesizer |
| `options.responseSynthesizer?` | [`ResponseSynthesizer`](ResponseSynthesizer.md)   | -                                                                |
| `options.retriever?`           | [`BaseRetriever`](../interfaces/BaseRetriever.md) | -                                                                |

#### Returns

[`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:181](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L181)

---

### asRetriever

▸ `Abstract` **asRetriever**(`options?`): [`BaseRetriever`](../interfaces/BaseRetriever.md)

Create a new retriever from the index.

#### Parameters

| Name       | Type  |
| :--------- | :---- |
| `options?` | `any` |

#### Returns

[`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:174](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L174)

---

### deleteRefDoc

▸ `Abstract` **deleteRefDoc**(`refDocId`, `deleteFromDocStore?`): `Promise`<`void`\>

#### Parameters

| Name                  | Type      |
| :-------------------- | :-------- |
| `refDocId`            | `string`  |
| `deleteFromDocStore?` | `boolean` |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/core/src/indices/BaseIndex.ts:199](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L199)

---

### insert

▸ **insert**(`document`): `Promise`<`void`\>

Insert a document into the index.

#### Parameters

| Name       | Type                                                   |
| :--------- | :----------------------------------------------------- |
| `document` | [`Document`](Document.md)<[`Metadata`](../#metadata)\> |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/core/src/indices/BaseIndex.ts:190](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L190)

---

### insertNodes

▸ `Abstract` **insertNodes**(`nodes`): `Promise`<`void`\>

#### Parameters

| Name    | Type                                                     |
| :------ | :------------------------------------------------------- |
| `nodes` | [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>[] |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/core/src/indices/BaseIndex.ts:198](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L198)
