---
id: "KeywordTableIndex"
title: "Class: KeywordTableIndex"
sidebar_label: "KeywordTableIndex"
sidebar_position: 0
custom_edit_url: null
---

The KeywordTableIndex, an index that extracts keywords from each Node and builds a mapping from each keyword to the corresponding Nodes of that keyword.

## Hierarchy

- [`BaseIndex`](BaseIndex.md)<[`KeywordTable`](KeywordTable.md)\>

  ↳ **`KeywordTableIndex`**

## Constructors

### constructor

• **new KeywordTableIndex**(`init`)

#### Parameters

| Name   | Type                                                                                  |
| :----- | :------------------------------------------------------------------------------------ |
| `init` | [`BaseIndexInit`](../interfaces/BaseIndexInit.md)<[`KeywordTable`](KeywordTable.md)\> |

#### Overrides

[BaseIndex](BaseIndex.md).[constructor](BaseIndex.md#constructor)

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndex.ts:49](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/keyword/KeywordTableIndex.ts#L49)

## Properties

### docStore

• **docStore**: [`BaseDocumentStore`](BaseDocumentStore.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[docStore](BaseIndex.md#docstore)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:156](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/BaseIndex.ts#L156)

---

### indexStore

• `Optional` **indexStore**: [`BaseIndexStore`](BaseIndexStore.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStore](BaseIndex.md#indexstore)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:158](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/BaseIndex.ts#L158)

---

### indexStruct

• **indexStruct**: [`KeywordTable`](KeywordTable.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStruct](BaseIndex.md#indexstruct)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:159](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/BaseIndex.ts#L159)

---

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[serviceContext](BaseIndex.md#servicecontext)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:154](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/BaseIndex.ts#L154)

---

### storageContext

• **storageContext**: [`StorageContext`](../interfaces/StorageContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[storageContext](BaseIndex.md#storagecontext)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:155](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/BaseIndex.ts#L155)

---

### vectorStore

• `Optional` **vectorStore**: [`VectorStore`](../interfaces/VectorStore.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[vectorStore](BaseIndex.md#vectorstore)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:157](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/BaseIndex.ts#L157)

## Methods

### asQueryEngine

▸ **asQueryEngine**(`options?`): [`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)

Create a new query engine from the index. It will also create a retriever
and response synthezier if they are not provided.

#### Parameters

| Name                           | Type                                                                | Description                                                      |
| :----------------------------- | :------------------------------------------------------------------ | :--------------------------------------------------------------- |
| `options?`                     | `Object`                                                            | you can supply your own custom Retriever and ResponseSynthesizer |
| `options.nodePostprocessors?`  | [`BaseNodePostprocessor`](../interfaces/BaseNodePostprocessor.md)[] | -                                                                |
| `options.preFilters?`          | `unknown`                                                           | -                                                                |
| `options.responseSynthesizer?` | [`ResponseSynthesizer`](ResponseSynthesizer.md)                     | -                                                                |
| `options.retriever?`           | [`BaseRetriever`](../interfaces/BaseRetriever.md)                   | -                                                                |

#### Returns

[`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)

#### Overrides

[BaseIndex](BaseIndex.md).[asQueryEngine](BaseIndex.md#asqueryengine)

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndex.ts:130](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/keyword/KeywordTableIndex.ts#L130)

---

### asRetriever

▸ **asRetriever**(`options?`): [`BaseRetriever`](../interfaces/BaseRetriever.md)

Create a new retriever from the index.

#### Parameters

| Name       | Type  |
| :--------- | :---- |
| `options?` | `any` |

#### Returns

[`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Overrides

[BaseIndex](BaseIndex.md).[asRetriever](BaseIndex.md#asretriever)

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndex.ts:119](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/keyword/KeywordTableIndex.ts#L119)

---

### deleteNode

▸ **deleteNode**(`nodeId`): `void`

#### Parameters

| Name     | Type     |
| :------- | :------- |
| `nodeId` | `string` |

#### Returns

`void`

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndex.ts:224](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/keyword/KeywordTableIndex.ts#L224)

---

### deleteNodes

▸ **deleteNodes**(`nodeIds`, `deleteFromDocStore`): `Promise`<`void`\>

#### Parameters

| Name                 | Type       |
| :------------------- | :--------- |
| `nodeIds`            | `string`[] |
| `deleteFromDocStore` | `boolean`  |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndex.ts:242](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/keyword/KeywordTableIndex.ts#L242)

---

### deleteRefDoc

▸ **deleteRefDoc**(`refDocId`, `deleteFromDocStore?`): `Promise`<`void`\>

#### Parameters

| Name                  | Type      |
| :-------------------- | :-------- |
| `refDocId`            | `string`  |
| `deleteFromDocStore?` | `boolean` |

#### Returns

`Promise`<`void`\>

#### Overrides

[BaseIndex](BaseIndex.md).[deleteRefDoc](BaseIndex.md#deleterefdoc)

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndex.ts:256](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/keyword/KeywordTableIndex.ts#L256)

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

#### Inherited from

[BaseIndex](BaseIndex.md).[insert](BaseIndex.md#insert)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:190](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/BaseIndex.ts#L190)

---

### insertNodes

▸ **insertNodes**(`nodes`): `Promise`<`void`\>

#### Parameters

| Name    | Type                                                     |
| :------ | :------------------------------------------------------- |
| `nodes` | [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>[] |

#### Returns

`Promise`<`void`\>

#### Overrides

[BaseIndex](BaseIndex.md).[insertNodes](BaseIndex.md#insertnodes)

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndex.ts:214](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/keyword/KeywordTableIndex.ts#L214)

---

### buildIndexFromNodes

▸ `Static` **buildIndexFromNodes**(`nodes`, `docStore`, `serviceContext`): `Promise`<[`KeywordTable`](KeywordTable.md)\>

Get keywords for nodes and place them into the index.

#### Parameters

| Name             | Type                                                     |
| :--------------- | :------------------------------------------------------- |
| `nodes`          | [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>[] |
| `docStore`       | [`BaseDocumentStore`](BaseDocumentStore.md)              |
| `serviceContext` | [`ServiceContext`](../interfaces/ServiceContext.md)      |

#### Returns

`Promise`<[`KeywordTable`](KeywordTable.md)\>

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndex.ts:197](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/keyword/KeywordTableIndex.ts#L197)

---

### extractKeywords

▸ `Static` **extractKeywords**(`text`, `serviceContext`): `Promise`<`Set`<`string`\>\>

#### Parameters

| Name             | Type                                                |
| :--------------- | :-------------------------------------------------- |
| `text`           | `string`                                            |
| `serviceContext` | [`ServiceContext`](../interfaces/ServiceContext.md) |

#### Returns

`Promise`<`Set`<`string`\>\>

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndex.ts:145](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/keyword/KeywordTableIndex.ts#L145)

---

### fromDocuments

▸ `Static` **fromDocuments**(`documents`, `args?`): `Promise`<[`KeywordTableIndex`](KeywordTableIndex.md)\>

High level API: split documents, get keywords, and build index.

#### Parameters

| Name                   | Type                                                     |
| :--------------------- | :------------------------------------------------------- |
| `documents`            | [`Document`](Document.md)<[`Metadata`](../#metadata)\>[] |
| `args`                 | `Object`                                                 |
| `args.serviceContext?` | [`ServiceContext`](../interfaces/ServiceContext.md)      |
| `args.storageContext?` | [`StorageContext`](../interfaces/StorageContext.md)      |

#### Returns

`Promise`<[`KeywordTableIndex`](KeywordTableIndex.md)\>

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndex.ts:164](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/keyword/KeywordTableIndex.ts#L164)

---

### init

▸ `Static` **init**(`options`): `Promise`<[`KeywordTableIndex`](KeywordTableIndex.md)\>

#### Parameters

| Name      | Type                  |
| :-------- | :-------------------- |
| `options` | `KeywordIndexOptions` |

#### Returns

`Promise`<[`KeywordTableIndex`](KeywordTableIndex.md)\>

#### Defined in

[packages/core/src/indices/keyword/KeywordTableIndex.ts:53](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/keyword/KeywordTableIndex.ts#L53)
