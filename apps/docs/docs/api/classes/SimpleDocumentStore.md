---
id: "SimpleDocumentStore"
title: "Class: SimpleDocumentStore"
sidebar_label: "SimpleDocumentStore"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- `KVDocumentStore`

  ↳ **`SimpleDocumentStore`**

## Constructors

### constructor

• **new SimpleDocumentStore**(`kvStore?`, `namespace?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `kvStore?` | `SimpleKVStore` |
| `namespace?` | `string` |

#### Overrides

KVDocumentStore.constructor

#### Defined in

[storage/docStore/SimpleDocumentStore.ts:19](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/docStore/SimpleDocumentStore.ts#L19)

## Properties

### kvStore

• `Private` **kvStore**: `SimpleKVStore`

#### Defined in

[storage/docStore/SimpleDocumentStore.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/docStore/SimpleDocumentStore.ts#L17)

## Methods

### addDocuments

▸ **addDocuments**(`docs`, `allowUpdate?`): `Promise`<`void`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `docs` | [`BaseNode`](BaseNode.md)[] | `undefined` |
| `allowUpdate` | `boolean` | `true` |

#### Returns

`Promise`<`void`\>

#### Inherited from

KVDocumentStore.addDocuments

#### Defined in

[storage/docStore/KVDocumentStore.ts:33](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/docStore/KVDocumentStore.ts#L33)

___

### deleteDocument

▸ **deleteDocument**(`docId`, `raiseError?`, `removeRefDocNode?`): `Promise`<`void`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `docId` | `string` | `undefined` |
| `raiseError` | `boolean` | `true` |
| `removeRefDocNode` | `boolean` | `true` |

#### Returns

`Promise`<`void`\>

#### Inherited from

KVDocumentStore.deleteDocument

#### Defined in

[storage/docStore/KVDocumentStore.ts:131](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/docStore/KVDocumentStore.ts#L131)

___

### deleteRefDoc

▸ **deleteRefDoc**(`refDocId`, `raiseError?`): `Promise`<`void`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `refDocId` | `string` | `undefined` |
| `raiseError` | `boolean` | `true` |

#### Returns

`Promise`<`void`\>

#### Inherited from

KVDocumentStore.deleteRefDoc

#### Defined in

[storage/docStore/KVDocumentStore.ts:148](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/docStore/KVDocumentStore.ts#L148)

___

### docs

▸ **docs**(): `Promise`<`Record`<`string`, [`BaseNode`](BaseNode.md)\>\>

#### Returns

`Promise`<`Record`<`string`, [`BaseNode`](BaseNode.md)\>\>

#### Inherited from

KVDocumentStore.docs

#### Defined in

[storage/docStore/KVDocumentStore.ts:24](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/docStore/KVDocumentStore.ts#L24)

___

### documentExists

▸ **documentExists**(`docId`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `docId` | `string` |

#### Returns

`Promise`<`boolean`\>

#### Inherited from

KVDocumentStore.documentExists

#### Defined in

[storage/docStore/KVDocumentStore.ts:105](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/docStore/KVDocumentStore.ts#L105)

___

### getAllRefDocInfo

▸ **getAllRefDocInfo**(): `Promise`<`undefined` \| `Record`<`string`, `RefDocInfo`\>\>

#### Returns

`Promise`<`undefined` \| `Record`<`string`, `RefDocInfo`\>\>

#### Inherited from

KVDocumentStore.getAllRefDocInfo

#### Defined in

[storage/docStore/KVDocumentStore.ts:93](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/docStore/KVDocumentStore.ts#L93)

___

### getDocument

▸ **getDocument**(`docId`, `raiseError?`): `Promise`<`undefined` \| [`BaseNode`](BaseNode.md)\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `docId` | `string` | `undefined` |
| `raiseError` | `boolean` | `true` |

#### Returns

`Promise`<`undefined` \| [`BaseNode`](BaseNode.md)\>

#### Inherited from

KVDocumentStore.getDocument

#### Defined in

[storage/docStore/KVDocumentStore.ts:73](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/docStore/KVDocumentStore.ts#L73)

___

### getDocumentHash

▸ **getDocumentHash**(`docId`): `Promise`<`undefined` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `docId` | `string` |

#### Returns

`Promise`<`undefined` \| `string`\>

#### Inherited from

KVDocumentStore.getDocumentHash

#### Defined in

[storage/docStore/KVDocumentStore.ts:174](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/docStore/KVDocumentStore.ts#L174)

___

### getNode

▸ **getNode**(`nodeId`, `raiseError?`): `Promise`<[`BaseNode`](BaseNode.md)\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `nodeId` | `string` | `undefined` |
| `raiseError` | `boolean` | `true` |

#### Returns

`Promise`<[`BaseNode`](BaseNode.md)\>

#### Inherited from

KVDocumentStore.getNode

#### Defined in

[storage/docStore/types.ts:57](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/docStore/types.ts#L57)

___

### getNodeDict

▸ **getNodeDict**(`nodeIdDict`): `Promise`<`Record`<`number`, [`BaseNode`](BaseNode.md)\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodeIdDict` | `Object` |

#### Returns

`Promise`<`Record`<`number`, [`BaseNode`](BaseNode.md)\>\>

#### Inherited from

KVDocumentStore.getNodeDict

#### Defined in

[storage/docStore/types.ts:65](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/docStore/types.ts#L65)

___

### getNodes

▸ **getNodes**(`nodeIds`, `raiseError?`): `Promise`<[`BaseNode`](BaseNode.md)[]\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `nodeIds` | `string`[] | `undefined` |
| `raiseError` | `boolean` | `true` |

#### Returns

`Promise`<[`BaseNode`](BaseNode.md)[]\>

#### Inherited from

KVDocumentStore.getNodes

#### Defined in

[storage/docStore/types.ts:51](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/docStore/types.ts#L51)

___

### getRefDocInfo

▸ **getRefDocInfo**(`refDocId`): `Promise`<`undefined` \| `RefDocInfo`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `refDocId` | `string` |

#### Returns

`Promise`<`undefined` \| `RefDocInfo`\>

#### Inherited from

KVDocumentStore.getRefDocInfo

#### Defined in

[storage/docStore/KVDocumentStore.ts:88](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/docStore/KVDocumentStore.ts#L88)

___

### persist

▸ **persist**(`persistPath?`, `fs?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `persistPath` | `string` |
| `fs?` | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) |

#### Returns

`Promise`<`void`\>

#### Overrides

KVDocumentStore.persist

#### Defined in

[storage/docStore/SimpleDocumentStore.ts:52](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/docStore/SimpleDocumentStore.ts#L52)

___

### refDocExists

▸ **refDocExists**(`refDocId`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `refDocId` | `string` |

#### Returns

`Promise`<`boolean`\>

#### Inherited from

KVDocumentStore.refDocExists

#### Defined in

[storage/docStore/KVDocumentStore.ts:101](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/docStore/KVDocumentStore.ts#L101)

___

### setDocumentHash

▸ **setDocumentHash**(`docId`, `docHash`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `docId` | `string` |
| `docHash` | `string` |

#### Returns

`Promise`<`void`\>

#### Inherited from

KVDocumentStore.setDocumentHash

#### Defined in

[storage/docStore/KVDocumentStore.ts:169](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/docStore/KVDocumentStore.ts#L169)

___

### toDict

▸ **toDict**(): `SaveDict`

#### Returns

`SaveDict`

#### Defined in

[storage/docStore/SimpleDocumentStore.ts:73](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/docStore/SimpleDocumentStore.ts#L73)

___

### fromDict

▸ `Static` **fromDict**(`saveDict`, `namespace?`): [`SimpleDocumentStore`](SimpleDocumentStore.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `saveDict` | `SaveDict` |
| `namespace?` | `string` |

#### Returns

[`SimpleDocumentStore`](SimpleDocumentStore.md)

#### Defined in

[storage/docStore/SimpleDocumentStore.ts:68](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/docStore/SimpleDocumentStore.ts#L68)

___

### fromPersistDir

▸ `Static` **fromPersistDir**(`persistDir?`, `namespace?`, `fsModule?`): `Promise`<[`SimpleDocumentStore`](SimpleDocumentStore.md)\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `persistDir` | `string` | `DEFAULT_PERSIST_DIR` |
| `namespace?` | `string` | `undefined` |
| `fsModule?` | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) | `undefined` |

#### Returns

`Promise`<[`SimpleDocumentStore`](SimpleDocumentStore.md)\>

#### Defined in

[storage/docStore/SimpleDocumentStore.ts:26](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/docStore/SimpleDocumentStore.ts#L26)

___

### fromPersistPath

▸ `Static` **fromPersistPath**(`persistPath`, `namespace?`, `fs?`): `Promise`<[`SimpleDocumentStore`](SimpleDocumentStore.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `persistPath` | `string` |
| `namespace?` | `string` |
| `fs?` | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) |

#### Returns

`Promise`<[`SimpleDocumentStore`](SimpleDocumentStore.md)\>

#### Defined in

[storage/docStore/SimpleDocumentStore.ts:42](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/docStore/SimpleDocumentStore.ts#L42)
