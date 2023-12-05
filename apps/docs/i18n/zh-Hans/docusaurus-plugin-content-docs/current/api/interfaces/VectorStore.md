---
id: "VectorStore"
title: "Interface: VectorStore"
sidebar_label: "VectorStore"
sidebar_position: 0
custom_edit_url: null
---

## Implemented by

- [`MongoDBAtlasVectorSearch`](../classes/MongoDBAtlasVectorSearch.md)
- [`SimpleVectorStore`](../classes/SimpleVectorStore.md)

## Properties

### isEmbeddingQuery

• `Optional` **isEmbeddingQuery**: `boolean`

#### Defined in

[packages/core/src/storage/vectorStore/types.ts:61](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/vectorStore/types.ts#L61)

---

### storesText

• **storesText**: `boolean`

#### Defined in

[packages/core/src/storage/vectorStore/types.ts:60](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/vectorStore/types.ts#L60)

## Methods

### add

▸ **add**(`embeddingResults`): `Promise`<`string`[]\>

#### Parameters

| Name               | Type                                                                |
| :----------------- | :------------------------------------------------------------------ |
| `embeddingResults` | [`BaseNode`](../classes/BaseNode.md)<[`Metadata`](../#metadata)\>[] |

#### Returns

`Promise`<`string`[]\>

#### Defined in

[packages/core/src/storage/vectorStore/types.ts:63](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/vectorStore/types.ts#L63)

---

### client

▸ **client**(): `any`

#### Returns

`any`

#### Defined in

[packages/core/src/storage/vectorStore/types.ts:62](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/vectorStore/types.ts#L62)

---

### delete

▸ **delete**(`refDocId`, `deleteOptions?`): `Promise`<`void`\>

#### Parameters

| Name             | Type     |
| :--------------- | :------- |
| `refDocId`       | `string` |
| `deleteOptions?` | `any`    |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/core/src/storage/vectorStore/types.ts:64](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/vectorStore/types.ts#L64)

---

### query

▸ **query**(`query`, `options?`): `Promise`<[`VectorStoreQueryResult`](VectorStoreQueryResult.md)\>

#### Parameters

| Name       | Type                                      |
| :--------- | :---------------------------------------- |
| `query`    | [`VectorStoreQuery`](VectorStoreQuery.md) |
| `options?` | `any`                                     |

#### Returns

`Promise`<[`VectorStoreQueryResult`](VectorStoreQueryResult.md)\>

#### Defined in

[packages/core/src/storage/vectorStore/types.ts:65](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/vectorStore/types.ts#L65)
