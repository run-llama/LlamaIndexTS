---
id: "SimpleIndexStore"
title: "Class: SimpleIndexStore"
sidebar_label: "SimpleIndexStore"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- `KVIndexStore`

  ↳ **`SimpleIndexStore`**

## Constructors

### constructor

• **new SimpleIndexStore**(`kvStore?`)

#### Parameters

| Name       | Type                                            |
| :--------- | :---------------------------------------------- |
| `kvStore?` | [`BaseInMemoryKVStore`](BaseInMemoryKVStore.md) |

#### Overrides

KVIndexStore.constructor

#### Defined in

[packages/core/src/storage/indexStore/SimpleIndexStore.ts:15](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/indexStore/SimpleIndexStore.ts#L15)

## Properties

### kvStore

• `Private` **kvStore**: [`BaseInMemoryKVStore`](BaseInMemoryKVStore.md)

#### Defined in

[packages/core/src/storage/indexStore/SimpleIndexStore.ts:13](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/indexStore/SimpleIndexStore.ts#L13)

## Methods

### addIndexStruct

▸ **addIndexStruct**(`indexStruct`): `Promise`<`void`\>

#### Parameters

| Name          | Type                            |
| :------------ | :------------------------------ |
| `indexStruct` | [`IndexStruct`](IndexStruct.md) |

#### Returns

`Promise`<`void`\>

#### Inherited from

KVIndexStore.addIndexStruct

#### Defined in

[packages/core/src/storage/indexStore/KVIndexStore.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/indexStore/KVIndexStore.ts#L17)

---

### deleteIndexStruct

▸ **deleteIndexStruct**(`key`): `Promise`<`void`\>

#### Parameters

| Name  | Type     |
| :---- | :------- |
| `key` | `string` |

#### Returns

`Promise`<`void`\>

#### Inherited from

KVIndexStore.deleteIndexStruct

#### Defined in

[packages/core/src/storage/indexStore/KVIndexStore.ts:23](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/indexStore/KVIndexStore.ts#L23)

---

### getIndexStruct

▸ **getIndexStruct**(`structId?`): `Promise`<`undefined` \| [`IndexStruct`](IndexStruct.md)\>

#### Parameters

| Name        | Type     |
| :---------- | :------- |
| `structId?` | `string` |

#### Returns

`Promise`<`undefined` \| [`IndexStruct`](IndexStruct.md)\>

#### Inherited from

KVIndexStore.getIndexStruct

#### Defined in

[packages/core/src/storage/indexStore/KVIndexStore.ts:27](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/indexStore/KVIndexStore.ts#L27)

---

### getIndexStructs

▸ **getIndexStructs**(): `Promise`<[`IndexStruct`](IndexStruct.md)[]\>

#### Returns

`Promise`<[`IndexStruct`](IndexStruct.md)[]\>

#### Inherited from

KVIndexStore.getIndexStructs

#### Defined in

[packages/core/src/storage/indexStore/KVIndexStore.ts:43](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/indexStore/KVIndexStore.ts#L43)

---

### persist

▸ **persist**(`persistPath?`, `fs?`): `Promise`<`void`\>

#### Parameters

| Name          | Type                                                      | Default value         |
| :------------ | :-------------------------------------------------------- | :-------------------- |
| `persistPath` | `string`                                                  | `DEFAULT_PERSIST_DIR` |
| `fs`          | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) | `DEFAULT_FS`          |

#### Returns

`Promise`<`void`\>

#### Overrides

KVIndexStore.persist

#### Defined in

[packages/core/src/storage/indexStore/SimpleIndexStore.ts:40](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/indexStore/SimpleIndexStore.ts#L40)

---

### toDict

▸ **toDict**(): `Record`<`string`, `unknown`\>

#### Returns

`Record`<`string`, `unknown`\>

#### Defined in

[packages/core/src/storage/indexStore/SimpleIndexStore.ts:52](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/indexStore/SimpleIndexStore.ts#L52)

---

### fromDict

▸ `Static` **fromDict**(`saveDict`): [`SimpleIndexStore`](SimpleIndexStore.md)

#### Parameters

| Name       | Type       |
| :--------- | :--------- |
| `saveDict` | `DataType` |

#### Returns

[`SimpleIndexStore`](SimpleIndexStore.md)

#### Defined in

[packages/core/src/storage/indexStore/SimpleIndexStore.ts:47](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/indexStore/SimpleIndexStore.ts#L47)

---

### fromPersistDir

▸ `Static` **fromPersistDir**(`persistDir?`, `fs?`): `Promise`<[`SimpleIndexStore`](SimpleIndexStore.md)\>

#### Parameters

| Name         | Type                                                      | Default value         |
| :----------- | :-------------------------------------------------------- | :-------------------- |
| `persistDir` | `string`                                                  | `DEFAULT_PERSIST_DIR` |
| `fs`         | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) | `DEFAULT_FS`          |

#### Returns

`Promise`<[`SimpleIndexStore`](SimpleIndexStore.md)\>

#### Defined in

[packages/core/src/storage/indexStore/SimpleIndexStore.ts:21](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/indexStore/SimpleIndexStore.ts#L21)

---

### fromPersistPath

▸ `Static` **fromPersistPath**(`persistPath`, `fs?`): `Promise`<[`SimpleIndexStore`](SimpleIndexStore.md)\>

#### Parameters

| Name          | Type                                                      | Default value |
| :------------ | :-------------------------------------------------------- | :------------ |
| `persistPath` | `string`                                                  | `undefined`   |
| `fs`          | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) | `DEFAULT_FS`  |

#### Returns

`Promise`<[`SimpleIndexStore`](SimpleIndexStore.md)\>

#### Defined in

[packages/core/src/storage/indexStore/SimpleIndexStore.ts:32](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/storage/indexStore/SimpleIndexStore.ts#L32)
