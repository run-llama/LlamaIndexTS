---
id: "BaseDocumentStore"
title: "Class: BaseDocumentStore"
sidebar_label: "BaseDocumentStore"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new BaseDocumentStore**()

## Methods

### addDocuments

▸ `Abstract` **addDocuments**(`docs`, `allowUpdate`): `Promise`<`void`\>

#### Parameters

| Name          | Type                                                     |
| :------------ | :------------------------------------------------------- |
| `docs`        | [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>[] |
| `allowUpdate` | `boolean`                                                |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/core/src/storage/docStore/types.ts:27](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/docStore/types.ts#L27)

---

### deleteDocument

▸ `Abstract` **deleteDocument**(`docId`, `raiseError`): `Promise`<`void`\>

#### Parameters

| Name         | Type      |
| :----------- | :-------- |
| `docId`      | `string`  |
| `raiseError` | `boolean` |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/core/src/storage/docStore/types.ts:34](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/docStore/types.ts#L34)

---

### deleteRefDoc

▸ `Abstract` **deleteRefDoc**(`refDocId`, `raiseError`): `Promise`<`void`\>

#### Parameters

| Name         | Type      |
| :----------- | :-------- |
| `refDocId`   | `string`  |
| `raiseError` | `boolean` |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/core/src/storage/docStore/types.ts:48](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/docStore/types.ts#L48)

---

### docs

▸ `Abstract` **docs**(): `Promise`<`Record`<`string`, [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>\>\>

#### Returns

`Promise`<`Record`<`string`, [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>\>\>

#### Defined in

[packages/core/src/storage/docStore/types.ts:25](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/docStore/types.ts#L25)

---

### documentExists

▸ `Abstract` **documentExists**(`docId`): `Promise`<`boolean`\>

#### Parameters

| Name    | Type     |
| :------ | :------- |
| `docId` | `string` |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[packages/core/src/storage/docStore/types.ts:36](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/docStore/types.ts#L36)

---

### getAllRefDocInfo

▸ `Abstract` **getAllRefDocInfo**(): `Promise`<`undefined` \| `Record`<`string`, [`RefDocInfo`](../interfaces/RefDocInfo.md)\>\>

#### Returns

`Promise`<`undefined` \| `Record`<`string`, [`RefDocInfo`](../interfaces/RefDocInfo.md)\>\>

#### Defined in

[packages/core/src/storage/docStore/types.ts:44](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/docStore/types.ts#L44)

---

### getDocument

▸ `Abstract` **getDocument**(`docId`, `raiseError`): `Promise`<`undefined` \| [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>\>

#### Parameters

| Name         | Type      |
| :----------- | :-------- |
| `docId`      | `string`  |
| `raiseError` | `boolean` |

#### Returns

`Promise`<`undefined` \| [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>\>

#### Defined in

[packages/core/src/storage/docStore/types.ts:29](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/docStore/types.ts#L29)

---

### getDocumentHash

▸ `Abstract` **getDocumentHash**(`docId`): `Promise`<`undefined` \| `string`\>

#### Parameters

| Name    | Type     |
| :------ | :------- |
| `docId` | `string` |

#### Returns

`Promise`<`undefined` \| `string`\>

#### Defined in

[packages/core/src/storage/docStore/types.ts:41](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/docStore/types.ts#L41)

---

### getNode

▸ **getNode**(`nodeId`, `raiseError?`): `Promise`<[`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>\>

#### Parameters

| Name         | Type      | Default value |
| :----------- | :-------- | :------------ |
| `nodeId`     | `string`  | `undefined`   |
| `raiseError` | `boolean` | `true`        |

#### Returns

`Promise`<[`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>\>

#### Defined in

[packages/core/src/storage/docStore/types.ts:57](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/docStore/types.ts#L57)

---

### getNodeDict

▸ **getNodeDict**(`nodeIdDict`): `Promise`<`Record`<`number`, [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>\>\>

#### Parameters

| Name         | Type     |
| :----------- | :------- |
| `nodeIdDict` | `Object` |

#### Returns

`Promise`<`Record`<`number`, [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>\>\>

#### Defined in

[packages/core/src/storage/docStore/types.ts:65](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/docStore/types.ts#L65)

---

### getNodes

▸ **getNodes**(`nodeIds`, `raiseError?`): `Promise`<[`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>[]\>

#### Parameters

| Name         | Type       | Default value |
| :----------- | :--------- | :------------ |
| `nodeIds`    | `string`[] | `undefined`   |
| `raiseError` | `boolean`  | `true`        |

#### Returns

`Promise`<[`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>[]\>

#### Defined in

[packages/core/src/storage/docStore/types.ts:51](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/docStore/types.ts#L51)

---

### getRefDocInfo

▸ `Abstract` **getRefDocInfo**(`refDocId`): `Promise`<`undefined` \| [`RefDocInfo`](../interfaces/RefDocInfo.md)\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `refDocId` | `string` |

#### Returns

`Promise`<`undefined` \| [`RefDocInfo`](../interfaces/RefDocInfo.md)\>

#### Defined in

[packages/core/src/storage/docStore/types.ts:46](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/docStore/types.ts#L46)

---

### persist

▸ **persist**(`persistPath?`, `fs?`): `void`

#### Parameters

| Name          | Type                                                      | Default value        |
| :------------ | :-------------------------------------------------------- | :------------------- |
| `persistPath` | `string`                                                  | `defaultPersistPath` |
| `fs?`         | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) | `undefined`          |

#### Returns

`void`

#### Defined in

[packages/core/src/storage/docStore/types.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/docStore/types.ts#L17)

---

### setDocumentHash

▸ `Abstract` **setDocumentHash**(`docId`, `docHash`): `void`

#### Parameters

| Name      | Type     |
| :-------- | :------- |
| `docId`   | `string` |
| `docHash` | `string` |

#### Returns

`void`

#### Defined in

[packages/core/src/storage/docStore/types.ts:39](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/docStore/types.ts#L39)
