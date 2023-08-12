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

| Name | Type |
| :------ | :------ |
| `init` | [`VectorIndexConstructorProps`](../interfaces/VectorIndexConstructorProps.md) |

#### Overrides

[BaseIndex](BaseIndex.md).[constructor](BaseIndex.md#constructor)

#### Defined in

[indices/vectorStore/VectorStoreIndex.ts:36](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L36)

## Properties

### docStore

• **docStore**: `BaseDocumentStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[docStore](BaseIndex.md#docstore)

#### Defined in

[indices/BaseIndex.ts:125](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L125)

___

### indexStore

• `Optional` **indexStore**: `BaseIndexStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStore](BaseIndex.md#indexstore)

#### Defined in

[indices/BaseIndex.ts:127](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L127)

___

### indexStruct

• **indexStruct**: [`IndexDict`](IndexDict.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStruct](BaseIndex.md#indexstruct)

#### Defined in

[indices/BaseIndex.ts:128](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L128)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[serviceContext](BaseIndex.md#servicecontext)

#### Defined in

[indices/BaseIndex.ts:123](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L123)

___

### storageContext

• **storageContext**: [`StorageContext`](../interfaces/StorageContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[storageContext](BaseIndex.md#storagecontext)

#### Defined in

[indices/BaseIndex.ts:124](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L124)

___

### vectorStore

• **vectorStore**: [`VectorStore`](../interfaces/VectorStore.md)

#### Overrides

[BaseIndex](BaseIndex.md).[vectorStore](BaseIndex.md#vectorstore)

#### Defined in

[indices/vectorStore/VectorStoreIndex.ts:34](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L34)

## Methods

### asQueryEngine

▸ **asQueryEngine**(`options?`): [`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)

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

#### Overrides

[BaseIndex](BaseIndex.md).[asQueryEngine](BaseIndex.md#asqueryengine)

#### Defined in

[indices/vectorStore/VectorStoreIndex.ts:223](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L223)

___

### asRetriever

▸ **asRetriever**(`options?`): [`VectorIndexRetriever`](VectorIndexRetriever.md)

Create a new retriever from the index.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `any` |

#### Returns

[`VectorIndexRetriever`](VectorIndexRetriever.md)

#### Overrides

[BaseIndex](BaseIndex.md).[asRetriever](BaseIndex.md#asretriever)

#### Defined in

[indices/vectorStore/VectorStoreIndex.ts:219](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L219)

___

### deleteRefDoc

▸ **deleteRefDoc**(`refDocId`, `deleteFromDocStore?`): `Promise`<`void`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `refDocId` | `string` | `undefined` |
| `deleteFromDocStore` | `boolean` | `true` |

#### Returns

`Promise`<`void`\>

#### Overrides

[BaseIndex](BaseIndex.md).[deleteRefDoc](BaseIndex.md#deleterefdoc)

#### Defined in

[indices/vectorStore/VectorStoreIndex.ts:259](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L259)

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

#### Inherited from

[BaseIndex](BaseIndex.md).[insert](BaseIndex.md#insert)

#### Defined in

[indices/BaseIndex.ts:159](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L159)

___

### insertNodes

▸ **insertNodes**(`nodes`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodes` | [`BaseNode`](BaseNode.md)[] |

#### Returns

`Promise`<`void`\>

#### Overrides

[BaseIndex](BaseIndex.md).[insertNodes](BaseIndex.md#insertnodes)

#### Defined in

[indices/vectorStore/VectorStoreIndex.ts:234](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L234)

___

### buildIndexFromNodes

▸ `Static` **buildIndexFromNodes**(`nodes`, `serviceContext`, `vectorStore`, `docStore`, `indexDict?`): `Promise`<[`IndexDict`](IndexDict.md)\>

Get embeddings for nodes and place them into the index.

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodes` | [`BaseNode`](BaseNode.md)[] |
| `serviceContext` | [`ServiceContext`](../interfaces/ServiceContext.md) |
| `vectorStore` | [`VectorStore`](../interfaces/VectorStore.md) |
| `docStore` | `BaseDocumentStore` |
| `indexDict?` | [`IndexDict`](IndexDict.md) |

#### Returns

`Promise`<[`IndexDict`](IndexDict.md)\>

#### Defined in

[indices/vectorStore/VectorStoreIndex.ts:147](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L147)

___

### fromDocuments

▸ `Static` **fromDocuments**(`documents`, `args?`): `Promise`<[`VectorStoreIndex`](VectorStoreIndex.md)\>

High level API: split documents, get embeddings, and build index.

#### Parameters

| Name | Type |
| :------ | :------ |
| `documents` | [`Document`](Document.md)[] |
| `args` | `Object` |
| `args.serviceContext?` | [`ServiceContext`](../interfaces/ServiceContext.md) |
| `args.storageContext?` | [`StorageContext`](../interfaces/StorageContext.md) |

#### Returns

`Promise`<[`VectorStoreIndex`](VectorStoreIndex.md)\>

#### Defined in

[indices/vectorStore/VectorStoreIndex.ts:194](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L194)

___

### getNodeEmbeddingResults

▸ `Static` **getNodeEmbeddingResults**(`nodes`, `serviceContext`, `logProgress?`): `Promise`<[`NodeWithEmbedding`](../interfaces/NodeWithEmbedding.md)[]\>

Get the embeddings for nodes.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `nodes` | [`BaseNode`](BaseNode.md)[] | `undefined` |  |
| `serviceContext` | [`ServiceContext`](../interfaces/ServiceContext.md) | `undefined` |  |
| `logProgress` | `boolean` | `false` | log progress to console (useful for debugging) |

#### Returns

`Promise`<[`NodeWithEmbedding`](../interfaces/NodeWithEmbedding.md)[]\>

#### Defined in

[indices/vectorStore/VectorStoreIndex.ts:119](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L119)

___

### init

▸ `Static` **init**(`options`): `Promise`<[`VectorStoreIndex`](VectorStoreIndex.md)\>

The async init function should be called after the constructor.
This is needed to handle persistence.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`VectorIndexOptions`](../interfaces/VectorIndexOptions.md) |

#### Returns

`Promise`<[`VectorStoreIndex`](VectorStoreIndex.md)\>

#### Defined in

[indices/vectorStore/VectorStoreIndex.ts:47](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L47)
