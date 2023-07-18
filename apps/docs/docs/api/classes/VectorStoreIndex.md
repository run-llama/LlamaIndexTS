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
| `init` | `VectorIndexConstructorProps` |

#### Overrides

[BaseIndex](BaseIndex.md).[constructor](BaseIndex.md#constructor)

#### Defined in

[BaseIndex.ts:109](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/BaseIndex.ts#L109)

## Properties

### docStore

• **docStore**: `BaseDocumentStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[docStore](BaseIndex.md#docstore)

#### Defined in

[BaseIndex.ts:75](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/BaseIndex.ts#L75)

___

### indexStore

• `Optional` **indexStore**: `BaseIndexStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStore](BaseIndex.md#indexstore)

#### Defined in

[BaseIndex.ts:77](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/BaseIndex.ts#L77)

___

### indexStruct

• **indexStruct**: [`IndexDict`](IndexDict.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStruct](BaseIndex.md#indexstruct)

#### Defined in

[BaseIndex.ts:78](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/BaseIndex.ts#L78)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[serviceContext](BaseIndex.md#servicecontext)

#### Defined in

[BaseIndex.ts:73](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/BaseIndex.ts#L73)

___

### storageContext

• **storageContext**: [`StorageContext`](../interfaces/StorageContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[storageContext](BaseIndex.md#storagecontext)

#### Defined in

[BaseIndex.ts:74](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/BaseIndex.ts#L74)

___

### vectorStore

• **vectorStore**: `VectorStore`

#### Overrides

[BaseIndex](BaseIndex.md).[vectorStore](BaseIndex.md#vectorstore)

#### Defined in

[BaseIndex.ts:107](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/BaseIndex.ts#L107)

## Methods

### asQueryEngine

▸ **asQueryEngine**(): [`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)

Get a retriever query engine for this index.

NOTE: if you are using a custom query engine you don't have to use this method.

#### Returns

[`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)

#### Defined in

[BaseIndex.ts:252](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/BaseIndex.ts#L252)

___

### asRetriever

▸ **asRetriever**(): [`VectorIndexRetriever`](VectorIndexRetriever.md)

Get a VectorIndexRetriever for this index.

NOTE: if you want to use a custom retriever you don't have to use this method.

#### Returns

[`VectorIndexRetriever`](VectorIndexRetriever.md)

retriever for the index

#### Overrides

[BaseIndex](BaseIndex.md).[asRetriever](BaseIndex.md#asretriever)

#### Defined in

[BaseIndex.ts:242](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/BaseIndex.ts#L242)

___

### agetNodeEmbeddingResults

▸ `Static` **agetNodeEmbeddingResults**(`nodes`, `serviceContext`, `logProgress?`): `Promise`<[`NodeWithEmbedding`](../interfaces/NodeWithEmbedding.md)[]\>

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

[BaseIndex.ts:159](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/BaseIndex.ts#L159)

___

### buildIndexFromNodes

▸ `Static` **buildIndexFromNodes**(`nodes`, `serviceContext`, `vectorStore`): `Promise`<[`IndexDict`](IndexDict.md)\>

Get embeddings for nodes and place them into the index.

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodes` | [`BaseNode`](BaseNode.md)[] |
| `serviceContext` | [`ServiceContext`](../interfaces/ServiceContext.md) |
| `vectorStore` | `VectorStore` |

#### Returns

`Promise`<[`IndexDict`](IndexDict.md)\>

#### Defined in

[BaseIndex.ts:187](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/BaseIndex.ts#L187)

___

### fromDocuments

▸ `Static` **fromDocuments**(`documents`, `storageContext?`, `serviceContext?`): `Promise`<[`VectorStoreIndex`](VectorStoreIndex.md)\>

High level API: split documents, get embeddings, and build index.

#### Parameters

| Name | Type |
| :------ | :------ |
| `documents` | [`Document`](Document.md)[] |
| `storageContext?` | [`StorageContext`](../interfaces/StorageContext.md) |
| `serviceContext?` | [`ServiceContext`](../interfaces/ServiceContext.md) |

#### Returns

`Promise`<[`VectorStoreIndex`](VectorStoreIndex.md)\>

#### Defined in

[BaseIndex.ts:214](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/BaseIndex.ts#L214)

___

### init

▸ `Static` **init**(`options`): `Promise`<[`VectorStoreIndex`](VectorStoreIndex.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`VectorIndexOptions`](../interfaces/VectorIndexOptions.md) |

#### Returns

`Promise`<[`VectorStoreIndex`](VectorStoreIndex.md)\>

#### Defined in

[BaseIndex.ts:114](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/BaseIndex.ts#L114)
