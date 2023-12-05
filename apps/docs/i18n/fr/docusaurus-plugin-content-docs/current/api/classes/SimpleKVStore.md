---
id: "SimpleKVStore"
title: "Class: SimpleKVStore"
sidebar_label: "SimpleKVStore"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- [`BaseKVStore`](BaseKVStore.md)

  ↳ **`SimpleKVStore`**

## Constructors

### constructor

• **new SimpleKVStore**(`data?`)

#### Parameters

| Name    | Type       |
| :------ | :--------- |
| `data?` | `DataType` |

#### Overrides

[BaseKVStore](BaseKVStore.md).[constructor](BaseKVStore.md#constructor)

#### Defined in

[packages/core/src/storage/kvStore/SimpleKVStore.ts:14](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/kvStore/SimpleKVStore.ts#L14)

## Properties

### data

• `Private` **data**: `DataType`

#### Defined in

[packages/core/src/storage/kvStore/SimpleKVStore.ts:10](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/kvStore/SimpleKVStore.ts#L10)

---

### fs

• `Private` **fs**: `undefined` \| [`GenericFileSystem`](../interfaces/GenericFileSystem.md)

#### Defined in

[packages/core/src/storage/kvStore/SimpleKVStore.ts:12](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/kvStore/SimpleKVStore.ts#L12)

---

### persistPath

• `Private` **persistPath**: `undefined` \| `string`

#### Defined in

[packages/core/src/storage/kvStore/SimpleKVStore.ts:11](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/kvStore/SimpleKVStore.ts#L11)

## Methods

### delete

▸ **delete**(`key`, `collection?`): `Promise`<`boolean`\>

#### Parameters

| Name         | Type     | Default value        |
| :----------- | :------- | :------------------- |
| `key`        | `string` | `undefined`          |
| `collection` | `string` | `DEFAULT_COLLECTION` |

#### Returns

`Promise`<`boolean`\>

#### Overrides

[BaseKVStore](BaseKVStore.md).[delete](BaseKVStore.md#delete)

#### Defined in

[packages/core/src/storage/kvStore/SimpleKVStore.ts:52](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/kvStore/SimpleKVStore.ts#L52)

---

### get

▸ **get**(`key`, `collection?`): `Promise`<`any`\>

#### Parameters

| Name         | Type     | Default value        |
| :----------- | :------- | :------------------- |
| `key`        | `string` | `undefined`          |
| `collection` | `string` | `DEFAULT_COLLECTION` |

#### Returns

`Promise`<`any`\>

#### Overrides

[BaseKVStore](BaseKVStore.md).[get](BaseKVStore.md#get)

#### Defined in

[packages/core/src/storage/kvStore/SimpleKVStore.ts:34](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/kvStore/SimpleKVStore.ts#L34)

---

### getAll

▸ **getAll**(`collection?`): `Promise`<`DataType`\>

#### Parameters

| Name         | Type     | Default value        |
| :----------- | :------- | :------------------- |
| `collection` | `string` | `DEFAULT_COLLECTION` |

#### Returns

`Promise`<`DataType`\>

#### Overrides

[BaseKVStore](BaseKVStore.md).[getAll](BaseKVStore.md#getall)

#### Defined in

[packages/core/src/storage/kvStore/SimpleKVStore.ts:48](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/kvStore/SimpleKVStore.ts#L48)

---

### persist

▸ **persist**(`persistPath`, `fs?`): `Promise`<`void`\>

#### Parameters

| Name          | Type                                                      |
| :------------ | :-------------------------------------------------------- |
| `persistPath` | `string`                                                  |
| `fs?`         | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/core/src/storage/kvStore/SimpleKVStore.ts:63](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/kvStore/SimpleKVStore.ts#L63)

---

### put

▸ **put**(`key`, `val`, `collection?`): `Promise`<`void`\>

#### Parameters

| Name         | Type     | Default value        |
| :----------- | :------- | :------------------- |
| `key`        | `string` | `undefined`          |
| `val`        | `any`    | `undefined`          |
| `collection` | `string` | `DEFAULT_COLLECTION` |

#### Returns

`Promise`<`void`\>

#### Overrides

[BaseKVStore](BaseKVStore.md).[put](BaseKVStore.md#put)

#### Defined in

[packages/core/src/storage/kvStore/SimpleKVStore.ts:19](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/kvStore/SimpleKVStore.ts#L19)

---

### toDict

▸ **toDict**(): `DataType`

#### Returns

`DataType`

#### Defined in

[packages/core/src/storage/kvStore/SimpleKVStore.ts:99](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/kvStore/SimpleKVStore.ts#L99)

---

### fromDict

▸ `Static` **fromDict**(`saveDict`): [`SimpleKVStore`](SimpleKVStore.md)

#### Parameters

| Name       | Type       |
| :--------- | :--------- |
| `saveDict` | `DataType` |

#### Returns

[`SimpleKVStore`](SimpleKVStore.md)

#### Defined in

[packages/core/src/storage/kvStore/SimpleKVStore.ts:103](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/kvStore/SimpleKVStore.ts#L103)

---

### fromPersistPath

▸ `Static` **fromPersistPath**(`persistPath`, `fs?`): `Promise`<[`SimpleKVStore`](SimpleKVStore.md)\>

#### Parameters

| Name          | Type                                                      |
| :------------ | :-------------------------------------------------------- |
| `persistPath` | `string`                                                  |
| `fs?`         | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) |

#### Returns

`Promise`<[`SimpleKVStore`](SimpleKVStore.md)\>

#### Defined in

[packages/core/src/storage/kvStore/SimpleKVStore.ts:73](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/kvStore/SimpleKVStore.ts#L73)
