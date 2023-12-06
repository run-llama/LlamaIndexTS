---
id: "BaseInMemoryKVStore"
title: "Class: BaseInMemoryKVStore"
sidebar_label: "BaseInMemoryKVStore"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- [`BaseKVStore`](BaseKVStore.md)

  ↳ **`BaseInMemoryKVStore`**

## Constructors

### constructor

• **new BaseInMemoryKVStore**()

#### Inherited from

[BaseKVStore](BaseKVStore.md).[constructor](BaseKVStore.md#constructor)

## Methods

### delete

▸ `Abstract` **delete**(`key`, `collection?`): `Promise`<`boolean`\>

#### Parameters

| Name          | Type     |
| :------------ | :------- |
| `key`         | `string` |
| `collection?` | `string` |

#### Returns

`Promise`<`boolean`\>

#### Inherited from

[BaseKVStore](BaseKVStore.md).[delete](BaseKVStore.md#delete)

#### Defined in

[packages/core/src/storage/kvStore/types.ts:14](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/kvStore/types.ts#L14)

---

### get

▸ `Abstract` **get**(`key`, `collection?`): `Promise`<`StoredValue`\>

#### Parameters

| Name          | Type     |
| :------------ | :------- |
| `key`         | `string` |
| `collection?` | `string` |

#### Returns

`Promise`<`StoredValue`\>

#### Inherited from

[BaseKVStore](BaseKVStore.md).[get](BaseKVStore.md#get)

#### Defined in

[packages/core/src/storage/kvStore/types.ts:12](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/kvStore/types.ts#L12)

---

### getAll

▸ `Abstract` **getAll**(`collection?`): `Promise`<`Record`<`string`, `StoredValue`\>\>

#### Parameters

| Name          | Type     |
| :------------ | :------- |
| `collection?` | `string` |

#### Returns

`Promise`<`Record`<`string`, `StoredValue`\>\>

#### Inherited from

[BaseKVStore](BaseKVStore.md).[getAll](BaseKVStore.md#getall)

#### Defined in

[packages/core/src/storage/kvStore/types.ts:13](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/kvStore/types.ts#L13)

---

### persist

▸ `Abstract` **persist**(`persistPath`, `fs?`): `void`

#### Parameters

| Name          | Type                                                      |
| :------------ | :-------------------------------------------------------- |
| `persistPath` | `string`                                                  |
| `fs?`         | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) |

#### Returns

`void`

#### Defined in

[packages/core/src/storage/kvStore/types.ts:18](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/kvStore/types.ts#L18)

---

### put

▸ `Abstract` **put**(`key`, `val`, `collection?`): `Promise`<`void`\>

#### Parameters

| Name          | Type                       |
| :------------ | :------------------------- |
| `key`         | `string`                   |
| `val`         | `Record`<`string`, `any`\> |
| `collection?` | `string`                   |

#### Returns

`Promise`<`void`\>

#### Inherited from

[BaseKVStore](BaseKVStore.md).[put](BaseKVStore.md#put)

#### Defined in

[packages/core/src/storage/kvStore/types.ts:7](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/kvStore/types.ts#L7)

---

### fromPersistPath

▸ `Static` **fromPersistPath**(`persistPath`): [`BaseInMemoryKVStore`](BaseInMemoryKVStore.md)

#### Parameters

| Name          | Type     |
| :------------ | :------- |
| `persistPath` | `string` |

#### Returns

[`BaseInMemoryKVStore`](BaseInMemoryKVStore.md)

#### Defined in

[packages/core/src/storage/kvStore/types.ts:19](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/kvStore/types.ts#L19)
