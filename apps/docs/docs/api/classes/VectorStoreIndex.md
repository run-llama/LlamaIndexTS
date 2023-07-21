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

[indices/vectorStore/VectorStoreIndex.ts:35](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L35)

## Properties

### docStore

• **docStore**: `BaseDocumentStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[docStore](BaseIndex.md#docstore)

#### Defined in

[indices/BaseIndex.ts:73](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/indices/BaseIndex.ts#L73)

___

### indexStore

• `Optional` **indexStore**: `BaseIndexStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStore](BaseIndex.md#indexstore)

#### Defined in

[indices/BaseIndex.ts:75](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/indices/BaseIndex.ts#L75)

___

### indexStruct

• **indexStruct**: [`IndexDict`](IndexDict.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStruct](BaseIndex.md#indexstruct)

#### Defined in

[indices/BaseIndex.ts:76](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/indices/BaseIndex.ts#L76)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[serviceContext](BaseIndex.md#servicecontext)

#### Defined in

[indices/BaseIndex.ts:71](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/indices/BaseIndex.ts#L71)

___

### storageContext

• **storageContext**: [`StorageContext`](../interfaces/StorageContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[storageContext](BaseIndex.md#storagecontext)

#### Defined in

[indices/BaseIndex.ts:72](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/indices/BaseIndex.ts#L72)

___

### vectorStore

• **vectorStore**: `VectorStore`

#### Overrides

[BaseIndex](BaseIndex.md).[vectorStore](BaseIndex.md#vectorstore)

#### Defined in

[indices/vectorStore/VectorStoreIndex.ts:33](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L33)

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

[indices/vectorStore/VectorStoreIndex.ts:181](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L181)

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

[indices/vectorStore/VectorStoreIndex.ts:177](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L177)

___

### buildIndexFromNodes

▸ `Static` **buildIndexFromNodes**(`nodes`, `serviceContext`, `vectorStore`, `docStore`): `Promise`<[`IndexDict`](IndexDict.md)\>

Get embeddings for nodes and place them into the index.

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodes` | [`BaseNode`](BaseNode.md)[] |
| `serviceContext` | [`ServiceContext`](../interfaces/ServiceContext.md) |
| `vectorStore` | `VectorStore` |
| `docStore` | `BaseDocumentStore` |

#### Returns

`Promise`<[`IndexDict`](IndexDict.md)\>

#### Defined in

[indices/vectorStore/VectorStoreIndex.ts:120](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L120)

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

[indices/vectorStore/VectorStoreIndex.ts:155](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L155)

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

[indices/vectorStore/VectorStoreIndex.ts:92](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L92)

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

[indices/vectorStore/VectorStoreIndex.ts:46](https://github.com/run-llama/LlamaIndexTS/blob/ca9410f/packages/core/src/indices/vectorStore/VectorStoreIndex.ts#L46)
