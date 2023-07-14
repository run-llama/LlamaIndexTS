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

[BaseIndex.ts:104](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/BaseIndex.ts#L104)

## Properties

### docStore

• **docStore**: `BaseDocumentStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[docStore](BaseIndex.md#docstore)

#### Defined in

[BaseIndex.ts:70](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/BaseIndex.ts#L70)

___

### indexStore

• `Optional` **indexStore**: `BaseIndexStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStore](BaseIndex.md#indexstore)

#### Defined in

[BaseIndex.ts:72](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/BaseIndex.ts#L72)

___

### indexStruct

• **indexStruct**: [`IndexDict`](IndexDict.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStruct](BaseIndex.md#indexstruct)

#### Defined in

[BaseIndex.ts:73](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/BaseIndex.ts#L73)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[serviceContext](BaseIndex.md#servicecontext)

#### Defined in

[BaseIndex.ts:68](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/BaseIndex.ts#L68)

___

### storageContext

• **storageContext**: [`StorageContext`](../interfaces/StorageContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[storageContext](BaseIndex.md#storagecontext)

#### Defined in

[BaseIndex.ts:69](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/BaseIndex.ts#L69)

___

### vectorStore

• **vectorStore**: `VectorStore`

#### Overrides

[BaseIndex](BaseIndex.md).[vectorStore](BaseIndex.md#vectorstore)

#### Defined in

[BaseIndex.ts:102](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/BaseIndex.ts#L102)

## Methods

### asQueryEngine

▸ **asQueryEngine**(): [`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)

#### Returns

[`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)

#### Defined in

[BaseIndex.ts:214](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/BaseIndex.ts#L214)

___

### asRetriever

▸ **asRetriever**(): [`VectorIndexRetriever`](VectorIndexRetriever.md)

#### Returns

[`VectorIndexRetriever`](VectorIndexRetriever.md)

#### Overrides

[BaseIndex](BaseIndex.md).[asRetriever](BaseIndex.md#asretriever)

#### Defined in

[BaseIndex.ts:210](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/BaseIndex.ts#L210)

___

### agetNodeEmbeddingResults

▸ `Static` **agetNodeEmbeddingResults**(`nodes`, `serviceContext`, `logProgress?`): `Promise`<[`NodeWithEmbedding`](../interfaces/NodeWithEmbedding.md)[]\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `nodes` | [`BaseNode`](BaseNode.md)[] | `undefined` |
| `serviceContext` | [`ServiceContext`](../interfaces/ServiceContext.md) | `undefined` |
| `logProgress` | `boolean` | `false` |

#### Returns

`Promise`<[`NodeWithEmbedding`](../interfaces/NodeWithEmbedding.md)[]\>

#### Defined in

[BaseIndex.ts:147](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/BaseIndex.ts#L147)

___

### buildIndexFromNodes

▸ `Static` **buildIndexFromNodes**(`nodes`, `serviceContext`, `vectorStore`): `Promise`<[`IndexDict`](IndexDict.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodes` | [`BaseNode`](BaseNode.md)[] |
| `serviceContext` | [`ServiceContext`](../interfaces/ServiceContext.md) |
| `vectorStore` | `VectorStore` |

#### Returns

`Promise`<[`IndexDict`](IndexDict.md)\>

#### Defined in

[BaseIndex.ts:168](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/BaseIndex.ts#L168)

___

### fromDocuments

▸ `Static` **fromDocuments**(`documents`, `storageContext?`, `serviceContext?`): `Promise`<[`VectorStoreIndex`](VectorStoreIndex.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `documents` | [`Document`](Document.md)[] |
| `storageContext?` | [`StorageContext`](../interfaces/StorageContext.md) |
| `serviceContext?` | [`ServiceContext`](../interfaces/ServiceContext.md) |

#### Returns

`Promise`<[`VectorStoreIndex`](VectorStoreIndex.md)\>

#### Defined in

[BaseIndex.ts:188](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/BaseIndex.ts#L188)

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

[BaseIndex.ts:109](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/BaseIndex.ts#L109)
