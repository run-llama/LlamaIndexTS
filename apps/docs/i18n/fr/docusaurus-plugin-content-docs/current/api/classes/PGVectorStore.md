---
id: "PGVectorStore"
title: "Class: PGVectorStore"
sidebar_label: "PGVectorStore"
sidebar_position: 0
custom_edit_url: null
---

Provides support for writing and querying vector data in Postgres.

## Implements

- [`VectorStore`](../interfaces/VectorStore.md)

## Constructors

### constructor

• **new PGVectorStore**()

#### Defined in

[packages/core/src/storage/vectorStore/PGVectorStore.ts:40](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/PGVectorStore.ts#L40)

## Properties

### collection

• `Private` **collection**: `string` = `""`

#### Defined in

[packages/core/src/storage/vectorStore/PGVectorStore.ts:18](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/PGVectorStore.ts#L18)

---

### db

• `Optional` **db**: `Client`

#### Defined in

[packages/core/src/storage/vectorStore/PGVectorStore.ts:38](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/PGVectorStore.ts#L38)

---

### storesText

• **storesText**: `boolean` = `true`

#### Implementation of

[VectorStore](../interfaces/VectorStore.md).[storesText](../interfaces/VectorStore.md#storestext)

#### Defined in

[packages/core/src/storage/vectorStore/PGVectorStore.ts:16](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/PGVectorStore.ts#L16)

## Methods

### add

▸ **add**(`embeddingResults`): `Promise`<`string`[]\>

Adds vector record(s) to the table.
NOTE: Uses the collection property controlled by setCollection/getCollection.

#### Parameters

| Name               | Type                                                     | Description                                                     |
| :----------------- | :------------------------------------------------------- | :-------------------------------------------------------------- |
| `embeddingResults` | [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>[] | The Nodes to be inserted, optionally including metadata tuples. |

#### Returns

`Promise`<`string`[]\>

A list of zero or more id values for the created records.

#### Implementation of

[VectorStore](../interfaces/VectorStore.md).[add](../interfaces/VectorStore.md#add)

#### Defined in

[packages/core/src/storage/vectorStore/PGVectorStore.ts:144](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/PGVectorStore.ts#L144)

---

### checkSchema

▸ `Private` **checkSchema**(`db`): `Promise`<`Client`\>

#### Parameters

| Name | Type     |
| :--- | :------- |
| `db` | `Client` |

#### Returns

`Promise`<`Client`\>

#### Defined in

[packages/core/src/storage/vectorStore/PGVectorStore.ts:90](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/PGVectorStore.ts#L90)

---

### clearCollection

▸ **clearCollection**(): `Promise`<`QueryResult`<`any`\>\>

Delete all vector records for the specified collection.
NOTE: Uses the collection property controlled by setCollection/getCollection.

#### Returns

`Promise`<`QueryResult`<`any`\>\>

The result of the delete query.

#### Defined in

[packages/core/src/storage/vectorStore/PGVectorStore.ts:128](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/PGVectorStore.ts#L128)

---

### client

▸ **client**(): `Promise`<`Client`\>

Connects to the database specified in environment vars.
This method also checks and creates the vector extension,
the destination table and indexes if not found.

#### Returns

`Promise`<`Client`\>

A connection to the database, or the error encountered while connecting/setting up.

#### Implementation of

[VectorStore](../interfaces/VectorStore.md).[client](../interfaces/VectorStore.md#client)

#### Defined in

[packages/core/src/storage/vectorStore/PGVectorStore.ts:119](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/PGVectorStore.ts#L119)

---

### delete

▸ **delete**(`refDocId`, `deleteKwargs?`): `Promise`<`void`\>

Deletes a single record from the database by id.
NOTE: Uses the collection property controlled by setCollection/getCollection.

#### Parameters

| Name            | Type     | Description                                           |
| :-------------- | :------- | :---------------------------------------------------- |
| `refDocId`      | `string` | Unique identifier for the record to delete.           |
| `deleteKwargs?` | `any`    | Required by VectorStore interface. Currently ignored. |

#### Returns

`Promise`<`void`\>

Promise that resolves if the delete query did not throw an error.

#### Implementation of

[VectorStore](../interfaces/VectorStore.md).[delete](../interfaces/VectorStore.md#delete)

#### Defined in

[packages/core/src/storage/vectorStore/PGVectorStore.ts:196](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/PGVectorStore.ts#L196)

---

### getCollection

▸ **getCollection**(): `string`

Getter for the collection property.
Using a collection allows for simple segregation of vector data,
e.g. by user, source, or access-level.
Leave/set blank to ignore the collection value when querying.

#### Returns

`string`

The currently-set collection value. Default is empty string.

#### Defined in

[packages/core/src/storage/vectorStore/PGVectorStore.ts:60](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/PGVectorStore.ts#L60)

---

### getDb

▸ `Private` **getDb**(): `Promise`<`Client`\>

#### Returns

`Promise`<`Client`\>

#### Defined in

[packages/core/src/storage/vectorStore/PGVectorStore.ts:64](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/PGVectorStore.ts#L64)

---

### persist

▸ **persist**(`persistPath`, `fs?`): `Promise`<`void`\>

Required by VectorStore interface. Currently ignored.

#### Parameters

| Name          | Type                                                      |
| :------------ | :-------------------------------------------------------- |
| `persistPath` | `string`                                                  |
| `fs?`         | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) |

#### Returns

`Promise`<`void`\>

Resolved Promise.

#### Defined in

[packages/core/src/storage/vectorStore/PGVectorStore.ts:269](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/PGVectorStore.ts#L269)

---

### query

▸ **query**(`query`, `options?`): `Promise`<[`VectorStoreQueryResult`](../interfaces/VectorStoreQueryResult.md)\>

Query the vector store for the closest matching data to the query embeddings

#### Parameters

| Name       | Type                                                    | Description                                           |
| :--------- | :------------------------------------------------------ | :---------------------------------------------------- |
| `query`    | [`VectorStoreQuery`](../interfaces/VectorStoreQuery.md) | The VectorStoreQuery to be used                       |
| `options?` | `any`                                                   | Required by VectorStore interface. Currently ignored. |

#### Returns

`Promise`<[`VectorStoreQueryResult`](../interfaces/VectorStoreQueryResult.md)\>

Zero or more Document instances with data from the vector store.

#### Implementation of

[VectorStore](../interfaces/VectorStore.md).[query](../interfaces/VectorStore.md#query)

#### Defined in

[packages/core/src/storage/vectorStore/PGVectorStore.ts:217](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/PGVectorStore.ts#L217)

---

### setCollection

▸ **setCollection**(`coll`): `void`

Setter for the collection property.
Using a collection allows for simple segregation of vector data,
e.g. by user, source, or access-level.
Leave/set blank to ignore the collection value when querying.

#### Parameters

| Name   | Type     | Description              |
| :----- | :------- | :----------------------- |
| `coll` | `string` | Name for the collection. |

#### Returns

`void`

#### Defined in

[packages/core/src/storage/vectorStore/PGVectorStore.ts:49](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/PGVectorStore.ts#L49)
