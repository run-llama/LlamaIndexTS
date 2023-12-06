---
id: "BaseIndexStore"
title: "Class: BaseIndexStore"
sidebar_label: "BaseIndexStore"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new BaseIndexStore**()

## Methods

### addIndexStruct

▸ `Abstract` **addIndexStruct**(`indexStruct`): `Promise`<`void`\>

#### Parameters

| Name          | Type                            |
| :------------ | :------------------------------ |
| `indexStruct` | [`IndexStruct`](IndexStruct.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/core/src/storage/indexStore/types.ts:13](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/indexStore/types.ts#L13)

---

### deleteIndexStruct

▸ `Abstract` **deleteIndexStruct**(`key`): `Promise`<`void`\>

#### Parameters

| Name  | Type     |
| :---- | :------- |
| `key` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/core/src/storage/indexStore/types.ts:15](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/indexStore/types.ts#L15)

---

### getIndexStruct

▸ `Abstract` **getIndexStruct**(`structId?`): `Promise`<`undefined` \| [`IndexStruct`](IndexStruct.md)\>

#### Parameters

| Name        | Type     |
| :---------- | :------- |
| `structId?` | `string` |

#### Returns

`Promise`<`undefined` \| [`IndexStruct`](IndexStruct.md)\>

#### Defined in

[packages/core/src/storage/indexStore/types.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/indexStore/types.ts#L17)

---

### getIndexStructs

▸ `Abstract` **getIndexStructs**(): `Promise`<[`IndexStruct`](IndexStruct.md)[]\>

#### Returns

`Promise`<[`IndexStruct`](IndexStruct.md)[]\>

#### Defined in

[packages/core/src/storage/indexStore/types.ts:11](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/indexStore/types.ts#L11)

---

### persist

▸ **persist**(`persistPath?`, `fs?`): `Promise`<`void`\>

#### Parameters

| Name          | Type                                                      | Default value        |
| :------------ | :-------------------------------------------------------- | :------------------- |
| `persistPath` | `string`                                                  | `defaultPersistPath` |
| `fs?`         | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) | `undefined`          |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/core/src/storage/indexStore/types.ts:19](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/storage/indexStore/types.ts#L19)
