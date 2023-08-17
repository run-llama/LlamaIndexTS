---
id: "VectorStore"
title: "Interface: VectorStore"
sidebar_label: "VectorStore"
sidebar_position: 0
custom_edit_url: null
---

## Implemented by

- [`SimpleVectorStore`](../classes/SimpleVectorStore.md)

## Properties

### isEmbeddingQuery

• `Optional` **isEmbeddingQuery**: `boolean`

#### Defined in

[storage/vectorStore/types.ts:62](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/vectorStore/types.ts#L62)

___

### storesText

• **storesText**: `boolean`

#### Defined in

[storage/vectorStore/types.ts:61](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/vectorStore/types.ts#L61)

## Methods

### add

▸ **add**(`embeddingResults`): `Promise`<`string`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `embeddingResults` | [`BaseNode`](../classes/BaseNode.md)[] |

#### Returns

`Promise`<`string`[]\>

#### Defined in

[storage/vectorStore/types.ts:64](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/vectorStore/types.ts#L64)

___

### client

▸ **client**(): `any`

#### Returns

`any`

#### Defined in

[storage/vectorStore/types.ts:63](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/vectorStore/types.ts#L63)

___

### delete

▸ **delete**(`refDocId`, `deleteKwargs?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `refDocId` | `string` |
| `deleteKwargs?` | `any` |

#### Returns

`Promise`<`void`\>

#### Defined in

[storage/vectorStore/types.ts:65](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/vectorStore/types.ts#L65)

___

### persist

▸ **persist**(`persistPath`, `fs?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `persistPath` | `string` |
| `fs?` | [`GenericFileSystem`](GenericFileSystem.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[storage/vectorStore/types.ts:67](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/vectorStore/types.ts#L67)

___

### query

▸ **query**(`query`, `kwargs?`): `Promise`<[`VectorStoreQueryResult`](VectorStoreQueryResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`VectorStoreQuery`](VectorStoreQuery.md) |
| `kwargs?` | `any` |

#### Returns

`Promise`<[`VectorStoreQueryResult`](VectorStoreQueryResult.md)\>

#### Defined in

[storage/vectorStore/types.ts:66](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/vectorStore/types.ts#L66)
