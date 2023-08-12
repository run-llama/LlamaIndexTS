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

| Name | Type |
| :------ | :------ |
| `kvStore?` | `BaseInMemoryKVStore` |

#### Overrides

KVIndexStore.constructor

#### Defined in

[storage/indexStore/SimpleIndexStore.ts:16](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/indexStore/SimpleIndexStore.ts#L16)

## Properties

### kvStore

• `Private` **kvStore**: `BaseInMemoryKVStore`

#### Defined in

[storage/indexStore/SimpleIndexStore.ts:14](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/indexStore/SimpleIndexStore.ts#L14)

## Methods

### addIndexStruct

▸ **addIndexStruct**(`indexStruct`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `indexStruct` | [`IndexStruct`](IndexStruct.md) |

#### Returns

`Promise`<`void`\>

#### Inherited from

KVIndexStore.addIndexStruct

#### Defined in

[storage/indexStore/KVIndexStore.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/indexStore/KVIndexStore.ts#L17)

___

### deleteIndexStruct

▸ **deleteIndexStruct**(`key`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`Promise`<`void`\>

#### Inherited from

KVIndexStore.deleteIndexStruct

#### Defined in

[storage/indexStore/KVIndexStore.ts:23](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/indexStore/KVIndexStore.ts#L23)

___

### getIndexStruct

▸ **getIndexStruct**(`structId?`): `Promise`<`undefined` \| [`IndexStruct`](IndexStruct.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `structId?` | `string` |

#### Returns

`Promise`<`undefined` \| [`IndexStruct`](IndexStruct.md)\>

#### Inherited from

KVIndexStore.getIndexStruct

#### Defined in

[storage/indexStore/KVIndexStore.ts:27](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/indexStore/KVIndexStore.ts#L27)

___

### getIndexStructs

▸ **getIndexStructs**(): `Promise`<[`IndexStruct`](IndexStruct.md)[]\>

#### Returns

`Promise`<[`IndexStruct`](IndexStruct.md)[]\>

#### Inherited from

KVIndexStore.getIndexStructs

#### Defined in

[storage/indexStore/KVIndexStore.ts:43](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/indexStore/KVIndexStore.ts#L43)

___

### persist

▸ **persist**(`persistPath?`, `fs?`): `Promise`<`void`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `persistPath` | `string` | `DEFAULT_PERSIST_DIR` |
| `fs` | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) | `DEFAULT_FS` |

#### Returns

`Promise`<`void`\>

#### Overrides

KVIndexStore.persist

#### Defined in

[storage/indexStore/SimpleIndexStore.ts:41](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/indexStore/SimpleIndexStore.ts#L41)

___

### toDict

▸ **toDict**(): `Record`<`string`, `unknown`\>

#### Returns

`Record`<`string`, `unknown`\>

#### Defined in

[storage/indexStore/SimpleIndexStore.ts:53](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/indexStore/SimpleIndexStore.ts#L53)

___

### fromDict

▸ `Static` **fromDict**(`saveDict`): [`SimpleIndexStore`](SimpleIndexStore.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `saveDict` | `DataType` |

#### Returns

[`SimpleIndexStore`](SimpleIndexStore.md)

#### Defined in

[storage/indexStore/SimpleIndexStore.ts:48](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/indexStore/SimpleIndexStore.ts#L48)

___

### fromPersistDir

▸ `Static` **fromPersistDir**(`persistDir?`, `fs?`): `Promise`<[`SimpleIndexStore`](SimpleIndexStore.md)\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `persistDir` | `string` | `DEFAULT_PERSIST_DIR` |
| `fs` | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) | `DEFAULT_FS` |

#### Returns

`Promise`<[`SimpleIndexStore`](SimpleIndexStore.md)\>

#### Defined in

[storage/indexStore/SimpleIndexStore.ts:22](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/indexStore/SimpleIndexStore.ts#L22)

___

### fromPersistPath

▸ `Static` **fromPersistPath**(`persistPath`, `fs?`): `Promise`<[`SimpleIndexStore`](SimpleIndexStore.md)\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `persistPath` | `string` | `undefined` |
| `fs` | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) | `DEFAULT_FS` |

#### Returns

`Promise`<[`SimpleIndexStore`](SimpleIndexStore.md)\>

#### Defined in

[storage/indexStore/SimpleIndexStore.ts:33](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/indexStore/SimpleIndexStore.ts#L33)
