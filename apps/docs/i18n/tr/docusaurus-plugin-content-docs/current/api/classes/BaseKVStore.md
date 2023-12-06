---
id: "BaseKVStore"
title: "Class: BaseKVStore"
sidebar_label: "BaseKVStore"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- **`BaseKVStore`**

  ↳ [`SimpleKVStore`](SimpleKVStore.md)

  ↳ [`BaseInMemoryKVStore`](BaseInMemoryKVStore.md)

## Constructors

### constructor

• **new BaseKVStore**()

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

#### Defined in

[packages/core/src/storage/kvStore/types.ts:13](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/kvStore/types.ts#L13)

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

#### Defined in

[packages/core/src/storage/kvStore/types.ts:7](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/kvStore/types.ts#L7)
