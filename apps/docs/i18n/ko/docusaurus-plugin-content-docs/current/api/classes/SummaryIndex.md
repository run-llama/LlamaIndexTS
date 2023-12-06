---
id: "SummaryIndex"
title: "Class: SummaryIndex"
sidebar_label: "SummaryIndex"
sidebar_position: 0
custom_edit_url: null
---

A SummaryIndex keeps nodes in a sequential order for use with summarization.

## Hierarchy

- [`BaseIndex`](BaseIndex.md)<[`IndexList`](IndexList.md)\>

  ↳ **`SummaryIndex`**

## Constructors

### constructor

• **new SummaryIndex**(`init`)

#### Parameters

| Name   | Type                                                                            |
| :----- | :------------------------------------------------------------------------------ |
| `init` | [`BaseIndexInit`](../interfaces/BaseIndexInit.md)<[`IndexList`](IndexList.md)\> |

#### Overrides

[BaseIndex](BaseIndex.md).[constructor](BaseIndex.md#constructor)

#### Defined in

[packages/core/src/indices/summary/SummaryIndex.ts:48](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/summary/SummaryIndex.ts#L48)

## Properties

### docStore

• **docStore**: [`BaseDocumentStore`](BaseDocumentStore.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[docStore](BaseIndex.md#docstore)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:156](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L156)

---

### indexStore

• `Optional` **indexStore**: [`BaseIndexStore`](BaseIndexStore.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStore](BaseIndex.md#indexstore)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:158](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L158)

---

### indexStruct

• **indexStruct**: [`IndexList`](IndexList.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStruct](BaseIndex.md#indexstruct)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:159](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L159)

---

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[serviceContext](BaseIndex.md#servicecontext)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:154](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L154)

---

### storageContext

• **storageContext**: [`StorageContext`](../interfaces/StorageContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[storageContext](BaseIndex.md#storagecontext)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:155](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L155)

---

### vectorStore

• `Optional` **vectorStore**: [`VectorStore`](../interfaces/VectorStore.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[vectorStore](BaseIndex.md#vectorstore)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:157](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L157)

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

[packages/core/src/indices/summary/SummaryIndex.ts:156](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/summary/SummaryIndex.ts#L156)

---

### asRetriever

▸ **asRetriever**(`options?`): [`BaseRetriever`](../interfaces/BaseRetriever.md)

Create a new retriever from the index.

#### Parameters

| Name           | Type                                                       |
| :------------- | :--------------------------------------------------------- |
| `options?`     | `Object`                                                   |
| `options.mode` | [`SummaryRetrieverMode`](../enums/SummaryRetrieverMode.md) |

#### Returns

[`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Overrides

[BaseIndex](BaseIndex.md).[asRetriever](BaseIndex.md#asretriever)

#### Defined in

[packages/core/src/indices/summary/SummaryIndex.ts:143](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/summary/SummaryIndex.ts#L143)

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

[packages/core/src/indices/summary/SummaryIndex.ts:224](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/summary/SummaryIndex.ts#L224)

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

[packages/core/src/indices/summary/SummaryIndex.ts:205](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/summary/SummaryIndex.ts#L205)

---

### getRefDocInfo

▸ **getRefDocInfo**(): `Promise`<`Record`<`string`, [`RefDocInfo`](../interfaces/RefDocInfo.md)\>\>

#### Returns

`Promise`<`Record`<`string`, [`RefDocInfo`](../interfaces/RefDocInfo.md)\>\>

#### Defined in

[packages/core/src/indices/summary/SummaryIndex.ts:238](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/summary/SummaryIndex.ts#L238)

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

[packages/core/src/indices/BaseIndex.ts:190](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L190)

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

[packages/core/src/indices/summary/SummaryIndex.ts:199](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/summary/SummaryIndex.ts#L199)

---

### buildIndexFromNodes

▸ `Static` **buildIndexFromNodes**(`nodes`, `docStore`, `indexStruct?`): `Promise`<[`IndexList`](IndexList.md)\>

#### Parameters

| Name           | Type                                                     |
| :------------- | :------------------------------------------------------- |
| `nodes`        | [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>[] |
| `docStore`     | [`BaseDocumentStore`](BaseDocumentStore.md)              |
| `indexStruct?` | [`IndexList`](IndexList.md)                              |

#### Returns

`Promise`<[`IndexList`](IndexList.md)\>

#### Defined in

[packages/core/src/indices/summary/SummaryIndex.ts:184](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/summary/SummaryIndex.ts#L184)

---

### fromDocuments

▸ `Static` **fromDocuments**(`documents`, `args?`): `Promise`<[`SummaryIndex`](SummaryIndex.md)\>

#### Parameters

| Name                   | Type                                                     |
| :--------------------- | :------------------------------------------------------- |
| `documents`            | [`Document`](Document.md)<[`Metadata`](../#metadata)\>[] |
| `args`                 | `Object`                                                 |
| `args.serviceContext?` | [`ServiceContext`](../interfaces/ServiceContext.md)      |
| `args.storageContext?` | [`StorageContext`](../interfaces/StorageContext.md)      |

#### Returns

`Promise`<[`SummaryIndex`](SummaryIndex.md)\>

#### Defined in

[packages/core/src/indices/summary/SummaryIndex.ts:117](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/summary/SummaryIndex.ts#L117)

---

### init

▸ `Static` **init**(`options`): `Promise`<[`SummaryIndex`](SummaryIndex.md)\>

#### Parameters

| Name      | Type                  |
| :-------- | :-------------------- |
| `options` | `SummaryIndexOptions` |

#### Returns

`Promise`<[`SummaryIndex`](SummaryIndex.md)\>

#### Defined in

[packages/core/src/indices/summary/SummaryIndex.ts:52](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/summary/SummaryIndex.ts#L52)
