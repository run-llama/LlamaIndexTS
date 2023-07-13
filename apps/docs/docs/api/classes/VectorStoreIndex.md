---
id: "VectorStoreIndex"
title: "Class: VectorStoreIndex"
sidebar_label: "VectorStoreIndex"
sidebar_position: 0
custom_edit_url: null
---

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

[BaseIndex.ts:98](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L98)

## Properties

### docStore

• **docStore**: `BaseDocumentStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[docStore](BaseIndex.md#docstore)

#### Defined in

[BaseIndex.ts:67](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L67)

___

### indexStore

• `Optional` **indexStore**: `BaseIndexStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStore](BaseIndex.md#indexstore)

#### Defined in

[BaseIndex.ts:69](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L69)

___

### indexStruct

• **indexStruct**: [`IndexDict`](IndexDict.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStruct](BaseIndex.md#indexstruct)

#### Defined in

[BaseIndex.ts:70](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L70)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[serviceContext](BaseIndex.md#servicecontext)

#### Defined in

[BaseIndex.ts:65](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L65)

___

### storageContext

• **storageContext**: [`StorageContext`](../interfaces/StorageContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[storageContext](BaseIndex.md#storagecontext)

#### Defined in

[BaseIndex.ts:66](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L66)

___

### vectorStore

• **vectorStore**: `VectorStore`

#### Overrides

[BaseIndex](BaseIndex.md).[vectorStore](BaseIndex.md#vectorstore)

#### Defined in

[BaseIndex.ts:96](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L96)

## Methods

### asQueryEngine

▸ **asQueryEngine**(): `BaseQueryEngine`

#### Returns

`BaseQueryEngine`

#### Defined in

[BaseIndex.ts:208](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L208)

___

### asRetriever

▸ **asRetriever**(): [`VectorIndexRetriever`](VectorIndexRetriever.md)

#### Returns

[`VectorIndexRetriever`](VectorIndexRetriever.md)

#### Overrides

[BaseIndex](BaseIndex.md).[asRetriever](BaseIndex.md#asretriever)

#### Defined in

[BaseIndex.ts:204](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L204)

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

[BaseIndex.ts:141](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L141)

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

[BaseIndex.ts:162](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L162)

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

[BaseIndex.ts:182](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L182)

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

[BaseIndex.ts:103](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L103)
