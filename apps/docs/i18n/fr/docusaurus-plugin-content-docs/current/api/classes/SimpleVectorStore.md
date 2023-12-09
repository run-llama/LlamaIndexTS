---
id: "SimpleVectorStore"
title: "Class: SimpleVectorStore"
sidebar_label: "SimpleVectorStore"
sidebar_position: 0
custom_edit_url: null
---

## Implements

- [`VectorStore`](../interfaces/VectorStore.md)

## Constructors

### constructor

• **new SimpleVectorStore**(`data?`, `fs?`)

#### Parameters

| Name    | Type                                                      |
| :------ | :-------------------------------------------------------- |
| `data?` | `SimpleVectorStoreData`                                   |
| `fs?`   | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) |

#### Defined in

[packages/core/src/storage/vectorStore/SimpleVectorStore.ts:37](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/SimpleVectorStore.ts#L37)

## Properties

### data

• `Private` **data**: `SimpleVectorStoreData`

#### Defined in

[packages/core/src/storage/vectorStore/SimpleVectorStore.ts:33](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/SimpleVectorStore.ts#L33)

---

### fs

• `Private` **fs**: [`GenericFileSystem`](../interfaces/GenericFileSystem.md) = `DEFAULT_FS`

#### Defined in

[packages/core/src/storage/vectorStore/SimpleVectorStore.ts:34](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/SimpleVectorStore.ts#L34)

---

### persistPath

• `Private` **persistPath**: `undefined` \| `string`

#### Defined in

[packages/core/src/storage/vectorStore/SimpleVectorStore.ts:35](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/SimpleVectorStore.ts#L35)

---

### storesText

• **storesText**: `boolean` = `false`

#### Implementation of

[VectorStore](../interfaces/VectorStore.md).[storesText](../interfaces/VectorStore.md#storestext)

#### Defined in

[packages/core/src/storage/vectorStore/SimpleVectorStore.ts:32](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/SimpleVectorStore.ts#L32)

## Accessors

### client

• `get` **client**(): `any`

#### Returns

`any`

#### Implementation of

VectorStore.client

#### Defined in

[packages/core/src/storage/vectorStore/SimpleVectorStore.ts:50](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/SimpleVectorStore.ts#L50)

## Methods

### add

▸ **add**(`embeddingResults`): `Promise`<`string`[]\>

#### Parameters

| Name               | Type                                                     |
| :----------------- | :------------------------------------------------------- |
| `embeddingResults` | [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>[] |

#### Returns

`Promise`<`string`[]\>

#### Implementation of

[VectorStore](../interfaces/VectorStore.md).[add](../interfaces/VectorStore.md#add)

#### Defined in

[packages/core/src/storage/vectorStore/SimpleVectorStore.ts:58](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/SimpleVectorStore.ts#L58)

---

### delete

▸ **delete**(`refDocId`): `Promise`<`void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `refDocId` | `string` |

#### Returns

`Promise`<`void`\>

#### Implementation of

[VectorStore](../interfaces/VectorStore.md).[delete](../interfaces/VectorStore.md#delete)

#### Defined in

[packages/core/src/storage/vectorStore/SimpleVectorStore.ts:77](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/SimpleVectorStore.ts#L77)

---

### get

▸ **get**(`textId`): `Promise`<`number`[]\>

#### Parameters

| Name     | Type     |
| :------- | :------- |
| `textId` | `string` |

#### Returns

`Promise`<`number`[]\>

#### Defined in

[packages/core/src/storage/vectorStore/SimpleVectorStore.ts:54](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/SimpleVectorStore.ts#L54)

---

### persist

▸ **persist**(`persistPath?`, `fs?`): `Promise`<`void`\>

#### Parameters

| Name          | Type                                                      |
| :------------ | :-------------------------------------------------------- |
| `persistPath` | `string`                                                  |
| `fs?`         | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/core/src/storage/vectorStore/SimpleVectorStore.ts:146](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/SimpleVectorStore.ts#L146)

---

### query

▸ **query**(`query`): `Promise`<[`VectorStoreQueryResult`](../interfaces/VectorStoreQueryResult.md)\>

#### Parameters

| Name    | Type                                                    |
| :------ | :------------------------------------------------------ |
| `query` | [`VectorStoreQuery`](../interfaces/VectorStoreQuery.md) |

#### Returns

`Promise`<[`VectorStoreQueryResult`](../interfaces/VectorStoreQueryResult.md)\>

#### Implementation of

[VectorStore](../interfaces/VectorStore.md).[query](../interfaces/VectorStore.md#query)

#### Defined in

[packages/core/src/storage/vectorStore/SimpleVectorStore.ts:88](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/SimpleVectorStore.ts#L88)

---

### toDict

▸ **toDict**(): `SimpleVectorStoreData`

#### Returns

`SimpleVectorStoreData`

#### Defined in

[packages/core/src/storage/vectorStore/SimpleVectorStore.ts:196](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/SimpleVectorStore.ts#L196)

---

### fromDict

▸ `Static` **fromDict**(`saveDict`): [`SimpleVectorStore`](SimpleVectorStore.md)

#### Parameters

| Name       | Type                    |
| :--------- | :---------------------- |
| `saveDict` | `SimpleVectorStoreData` |

#### Returns

[`SimpleVectorStore`](SimpleVectorStore.md)

#### Defined in

[packages/core/src/storage/vectorStore/SimpleVectorStore.ts:189](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/SimpleVectorStore.ts#L189)

---

### fromPersistDir

▸ `Static` **fromPersistDir**(`persistDir?`, `fs?`): `Promise`<[`SimpleVectorStore`](SimpleVectorStore.md)\>

#### Parameters

| Name         | Type                                                      | Default value         |
| :----------- | :-------------------------------------------------------- | :-------------------- |
| `persistDir` | `string`                                                  | `DEFAULT_PERSIST_DIR` |
| `fs`         | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) | `DEFAULT_FS`          |

#### Returns

`Promise`<[`SimpleVectorStore`](SimpleVectorStore.md)\>

#### Defined in

[packages/core/src/storage/vectorStore/SimpleVectorStore.ts:42](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/SimpleVectorStore.ts#L42)

---

### fromPersistPath

▸ `Static` **fromPersistPath**(`persistPath`, `fs?`): `Promise`<[`SimpleVectorStore`](SimpleVectorStore.md)\>

#### Parameters

| Name          | Type                                                      |
| :------------ | :-------------------------------------------------------- |
| `persistPath` | `string`                                                  |
| `fs?`         | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) |

#### Returns

`Promise`<[`SimpleVectorStore`](SimpleVectorStore.md)\>

#### Defined in

[packages/core/src/storage/vectorStore/SimpleVectorStore.ts:159](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/vectorStore/SimpleVectorStore.ts#L159)
