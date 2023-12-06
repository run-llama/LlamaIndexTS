---
id: "MongoDBAtlasVectorSearch"
title: "Class: MongoDBAtlasVectorSearch"
sidebar_label: "MongoDBAtlasVectorSearch"
sidebar_position: 0
custom_edit_url: null
---

## Implements

- [`VectorStore`](../interfaces/VectorStore.md)

## Constructors

### constructor

• **new MongoDBAtlasVectorSearch**(`init`)

#### Parameters

| Name   | Type                                                                                                                        |
| :----- | :-------------------------------------------------------------------------------------------------------------------------- |
| `init` | `Partial`<[`MongoDBAtlasVectorSearch`](MongoDBAtlasVectorSearch.md)\> & { `collectionName`: `string` ; `dbName`: `string` } |

#### Defined in

[packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts:36](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts#L36)

## Properties

### collection

• `Private` **collection**: `Collection`<`Document`\>

#### Defined in

[packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts:34](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts#L34)

---

### embeddingKey

• **embeddingKey**: `string`

#### Defined in

[packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts:29](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts#L29)

---

### flatMetadata

• **flatMetadata**: `boolean` = `true`

#### Defined in

[packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts:25](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts#L25)

---

### idKey

• **idKey**: `string`

#### Defined in

[packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts:30](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts#L30)

---

### indexName

• **indexName**: `string`

#### Defined in

[packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts:28](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts#L28)

---

### insertOptions

• `Optional` **insertOptions**: `BulkWriteOptions`

#### Defined in

[packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts:33](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts#L33)

---

### metadataKey

• **metadataKey**: `string`

#### Defined in

[packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts:32](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts#L32)

---

### mongodbClient

• **mongodbClient**: `MongoClient`

#### Defined in

[packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts:27](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts#L27)

---

### storesText

• **storesText**: `boolean` = `true`

#### Implementation of

[VectorStore](../interfaces/VectorStore.md).[storesText](../interfaces/VectorStore.md#storestext)

#### Defined in

[packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts:24](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts#L24)

---

### textKey

• **textKey**: `string`

#### Defined in

[packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts:31](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts#L31)

## Accessors

### client

• `get` **client**(): `any`

#### Returns

`any`

#### Implementation of

VectorStore.client

#### Defined in

[packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts:103](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts#L103)

## Methods

### add

▸ **add**(`nodes`): `Promise`<`string`[]\>

#### Parameters

| Name    | Type                                                     |
| :------ | :------------------------------------------------------- |
| `nodes` | [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>[] |

#### Returns

`Promise`<`string`[]\>

#### Implementation of

[VectorStore](../interfaces/VectorStore.md).[add](../interfaces/VectorStore.md#add)

#### Defined in

[packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts:65](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts#L65)

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

#### Implementation of

[VectorStore](../interfaces/VectorStore.md).[delete](../interfaces/VectorStore.md#delete)

#### Defined in

[packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts:94](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts#L94)

---

### query

▸ **query**(`query`, `options?`): `Promise`<[`VectorStoreQueryResult`](../interfaces/VectorStoreQueryResult.md)\>

#### Parameters

| Name       | Type                                                    |
| :--------- | :------------------------------------------------------ |
| `query`    | [`VectorStoreQuery`](../interfaces/VectorStoreQuery.md) |
| `options?` | `any`                                                   |

#### Returns

`Promise`<[`VectorStoreQueryResult`](../interfaces/VectorStoreQueryResult.md)\>

#### Implementation of

[VectorStore](../interfaces/VectorStore.md).[query](../interfaces/VectorStore.md#query)

#### Defined in

[packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts:107](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/vectorStore/MongoDBAtlasVectorStore.ts#L107)
