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

[indices/vectorStore/VectorStoreIndex.ts:32](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L32)

## Properties

### docStore

• **docStore**: `BaseDocumentStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[docStore](BaseIndex.md#docstore)

#### Defined in

[indices/BaseIndex.ts:71](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/indices/BaseIndex.ts#L71)

___

### indexStore

• `Optional` **indexStore**: `BaseIndexStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStore](BaseIndex.md#indexstore)

#### Defined in

[indices/BaseIndex.ts:73](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/indices/BaseIndex.ts#L73)

___

### indexStruct

• **indexStruct**: [`IndexDict`](IndexDict.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStruct](BaseIndex.md#indexstruct)

#### Defined in

[indices/BaseIndex.ts:74](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/indices/BaseIndex.ts#L74)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[serviceContext](BaseIndex.md#servicecontext)

#### Defined in

[indices/BaseIndex.ts:69](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/indices/BaseIndex.ts#L69)

___

### storageContext

• **storageContext**: [`StorageContext`](../interfaces/StorageContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[storageContext](BaseIndex.md#storagecontext)

#### Defined in

[indices/BaseIndex.ts:70](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/indices/BaseIndex.ts#L70)

___

### vectorStore

• **vectorStore**: `VectorStore`

#### Overrides

[BaseIndex](BaseIndex.md).[vectorStore](BaseIndex.md#vectorstore)

#### Defined in

[indices/vectorStore/VectorStoreIndex.ts:30](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L30)

## Methods

### asQueryEngine

▸ **asQueryEngine**(): [`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)

Get a retriever query engine for this index.

NOTE: if you are using a custom query engine you don't have to use this method.

#### Returns

[`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)

#### Defined in

[indices/vectorStore/VectorStoreIndex.ts:175](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L175)

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

[indices/vectorStore/VectorStoreIndex.ts:165](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L165)

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

[indices/vectorStore/VectorStoreIndex.ts:110](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L110)

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

[indices/vectorStore/VectorStoreIndex.ts:137](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L137)

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

[indices/vectorStore/VectorStoreIndex.ts:82](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L82)

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

[indices/vectorStore/VectorStoreIndex.ts:37](https://github.com/run-llama/LlamaIndexTS/blob/08c2d46/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L37)
