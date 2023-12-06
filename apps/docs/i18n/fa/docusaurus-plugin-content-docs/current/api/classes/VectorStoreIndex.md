---
id: "VectorStoreIndex"
title: "Class: VectorStoreIndex"
sidebar_label: "VectorStoreIndex"
sidebar_position: 0
custom_edit_url: null
---

The VectorStoreIndex, an index that stores the nodes only according to their vector embedings.

## Hierarchy

- [`BaseIndex`](BaseIndex.md)<[`IndexDict`](IndexDict.md)\>

  ↳ **`VectorStoreIndex`**

## Constructors

### constructor

• `Private` **new VectorStoreIndex**(`init`)

#### Parameters

| Name   | Type                          |
| :----- | :---------------------------- |
| `init` | `VectorIndexConstructorProps` |

#### Overrides

[BaseIndex](BaseIndex.md).[constructor](BaseIndex.md#constructor)

#### Defined in

[packages/core/src/indices/vectorStore/VectorStoreIndex.ts:64](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L64)

## Properties

### docStore

• **docStore**: [`BaseDocumentStore`](BaseDocumentStore.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[docStore](BaseIndex.md#docstore)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:156](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/BaseIndex.ts#L156)

---

### embedModel

• **embedModel**: [`BaseEmbedding`](BaseEmbedding.md)

#### Defined in

[packages/core/src/indices/vectorStore/VectorStoreIndex.ts:60](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L60)

---

### imageEmbedModel

• `Optional` **imageEmbedModel**: [`MultiModalEmbedding`](MultiModalEmbedding.md)

#### Defined in

[packages/core/src/indices/vectorStore/VectorStoreIndex.ts:62](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L62)

---

### imageVectorStore

• `Optional` **imageVectorStore**: [`VectorStore`](../interfaces/VectorStore.md)

#### Defined in

[packages/core/src/indices/vectorStore/VectorStoreIndex.ts:61](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L61)

---

### indexStore

• **indexStore**: [`BaseIndexStore`](BaseIndexStore.md)

#### Overrides

[BaseIndex](BaseIndex.md).[indexStore](BaseIndex.md#indexstore)

#### Defined in

[packages/core/src/indices/vectorStore/VectorStoreIndex.ts:59](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L59)

---

### indexStruct

• **indexStruct**: [`IndexDict`](IndexDict.md)

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

• **vectorStore**: [`VectorStore`](../interfaces/VectorStore.md)

#### Overrides

[BaseIndex](BaseIndex.md).[vectorStore](BaseIndex.md#vectorstore)

#### Defined in

[packages/core/src/indices/vectorStore/VectorStoreIndex.ts:58](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L58)

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

[packages/core/src/indices/vectorStore/VectorStoreIndex.ts:244](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L244)

---

### asRetriever

▸ **asRetriever**(`options?`): [`VectorIndexRetriever`](VectorIndexRetriever.md)

Create a new retriever from the index.

#### Parameters

| Name       | Type  |
| :--------- | :---- |
| `options?` | `any` |

#### Returns

[`VectorIndexRetriever`](VectorIndexRetriever.md)

#### Overrides

[BaseIndex](BaseIndex.md).[asRetriever](BaseIndex.md#asretriever)

#### Defined in

[packages/core/src/indices/vectorStore/VectorStoreIndex.ts:240](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L240)

---

### buildIndexFromNodes

▸ **buildIndexFromNodes**(`nodes`): `Promise`<`void`\>

Get embeddings for nodes and place them into the index.

#### Parameters

| Name    | Type                                                     |
| :------ | :------------------------------------------------------- |
| `nodes` | [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>[] |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/core/src/indices/vectorStore/VectorStoreIndex.ts:178](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L178)

---

### deleteRefDoc

▸ **deleteRefDoc**(`refDocId`, `deleteFromDocStore?`): `Promise`<`void`\>

#### Parameters

| Name                 | Type      | Default value |
| :------------------- | :-------- | :------------ |
| `refDocId`           | `string`  | `undefined`   |
| `deleteFromDocStore` | `boolean` | `true`        |

#### Returns

`Promise`<`void`\>

#### Overrides

[BaseIndex](BaseIndex.md).[deleteRefDoc](BaseIndex.md#deleterefdoc)

#### Defined in

[packages/core/src/indices/vectorStore/VectorStoreIndex.ts:305](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L305)

---

### deleteRefDocFromStore

▸ `Protected` **deleteRefDocFromStore**(`vectorStore`, `refDocId`): `Promise`<`void`\>

#### Parameters

| Name          | Type                                          |
| :------------ | :-------------------------------------------- |
| `vectorStore` | [`VectorStore`](../interfaces/VectorStore.md) |
| `refDocId`    | `string`                                      |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/core/src/indices/vectorStore/VectorStoreIndex.ts:319](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L319)

---

### getImageNodeEmbeddingResults

▸ **getImageNodeEmbeddingResults**(`nodes`, `logProgress?`): `Promise`<[`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>[]\>

Get the embeddings for image nodes.

#### Parameters

| Name          | Type                                                       | Default value | Description                                    |
| :------------ | :--------------------------------------------------------- | :------------ | :--------------------------------------------- |
| `nodes`       | [`ImageNode`](ImageNode.md)<[`Metadata`](../#metadata)\>[] | `undefined`   |                                                |
| `logProgress` | `boolean`                                                  | `false`       | log progress to console (useful for debugging) |

#### Returns

`Promise`<[`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>[]\>

#### Defined in

[packages/core/src/indices/vectorStore/VectorStoreIndex.ts:345](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L345)

---

### getNodeEmbeddingResults

▸ **getNodeEmbeddingResults**(`nodes`, `logProgress?`): `Promise`<[`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>[]\>

Get the embeddings for nodes.

#### Parameters

| Name          | Type                                                     | Default value | Description                                    |
| :------------ | :------------------------------------------------------- | :------------ | :--------------------------------------------- |
| `nodes`       | [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>[] | `undefined`   |                                                |
| `logProgress` | `boolean`                                                | `false`       | log progress to console (useful for debugging) |

#### Returns

`Promise`<[`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>[]\>

#### Defined in

[packages/core/src/indices/vectorStore/VectorStoreIndex.ts:155](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L155)

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

[packages/core/src/indices/vectorStore/VectorStoreIndex.ts:284](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L284)

---

### insertNodesToStore

▸ `Protected` **insertNodesToStore**(`vectorStore`, `nodes`): `Promise`<`void`\>

#### Parameters

| Name          | Type                                                     |
| :------------ | :------------------------------------------------------- |
| `vectorStore` | [`VectorStore`](../interfaces/VectorStore.md)            |
| `nodes`       | [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>[] |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/core/src/indices/vectorStore/VectorStoreIndex.ts:259](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L259)

---

### splitNodes

▸ `Private` **splitNodes**(`nodes`): `Object`

#### Parameters

| Name    | Type                                                     |
| :------ | :------------------------------------------------------- |
| `nodes` | [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>[] |

#### Returns

`Object`

| Name         | Type                                                       |
| :----------- | :--------------------------------------------------------- |
| `imageNodes` | [`ImageNode`](ImageNode.md)<[`Metadata`](../#metadata)\>[] |
| `textNodes`  | [`TextNode`](TextNode.md)<[`Metadata`](../#metadata)\>[]   |

#### Defined in

[packages/core/src/indices/vectorStore/VectorStoreIndex.ts:367](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L367)

---

### fromDocuments

▸ `Static` **fromDocuments**(`documents`, `args?`): `Promise`<[`VectorStoreIndex`](VectorStoreIndex.md)\>

High level API: split documents, get embeddings, and build index.

#### Parameters

| Name        | Type                                                     |
| :---------- | :------------------------------------------------------- |
| `documents` | [`Document`](Document.md)<[`Metadata`](../#metadata)\>[] |
| `args`      | `VectorIndexOptions`                                     |

#### Returns

`Promise`<[`VectorStoreIndex`](VectorStoreIndex.md)\>

#### Defined in

[packages/core/src/indices/vectorStore/VectorStoreIndex.ts:201](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L201)

---

### fromVectorStore

▸ `Static` **fromVectorStore**(`vectorStore`, `serviceContext`): `Promise`<[`VectorStoreIndex`](VectorStoreIndex.md)\>

#### Parameters

| Name             | Type                                                |
| :--------------- | :-------------------------------------------------- |
| `vectorStore`    | [`VectorStore`](../interfaces/VectorStore.md)       |
| `serviceContext` | [`ServiceContext`](../interfaces/ServiceContext.md) |

#### Returns

`Promise`<[`VectorStoreIndex`](VectorStoreIndex.md)\>

#### Defined in

[packages/core/src/indices/vectorStore/VectorStoreIndex.ts:219](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L219)

---

### init

▸ `Static` **init**(`options`): `Promise`<[`VectorStoreIndex`](VectorStoreIndex.md)\>

The async init function creates a new VectorStoreIndex.

#### Parameters

| Name      | Type                 |
| :-------- | :------------------- |
| `options` | `VectorIndexOptions` |

#### Returns

`Promise`<[`VectorStoreIndex`](VectorStoreIndex.md)\>

#### Defined in

[packages/core/src/indices/vectorStore/VectorStoreIndex.ts:80](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L80)

---

### setupIndexStructFromStorage

▸ `Static` `Private` **setupIndexStructFromStorage**(`indexStore`, `options`): `Promise`<`undefined` \| [`IndexDict`](IndexDict.md)\>

#### Parameters

| Name         | Type                                  |
| :----------- | :------------------------------------ |
| `indexStore` | [`BaseIndexStore`](BaseIndexStore.md) |
| `options`    | `IndexStructOptions`                  |

#### Returns

`Promise`<`undefined` \| [`IndexDict`](IndexDict.md)\>

#### Defined in

[packages/core/src/indices/vectorStore/VectorStoreIndex.ts:118](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L118)
