---
id: "ListIndex"
title: "Class: ListIndex"
sidebar_label: "ListIndex"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- [`BaseIndex`](BaseIndex.md)<[`IndexList`](IndexList.md)\>

  ↳ **`ListIndex`**

## Constructors

### constructor

• **new ListIndex**(`init`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `init` | [`BaseIndexInit`](../interfaces/BaseIndexInit.md)<[`IndexList`](IndexList.md)\> |

#### Overrides

[BaseIndex](BaseIndex.md).[constructor](BaseIndex.md#constructor)

#### Defined in

[index/list/ListIndex.ts:34](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/index/list/ListIndex.ts#L34)

## Properties

### docStore

• **docStore**: `BaseDocumentStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[docStore](BaseIndex.md#docstore)

#### Defined in

[BaseIndex.ts:67](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L67)

___

### indexStore

• `Optional` **indexStore**: `BaseIndexStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStore](BaseIndex.md#indexstore)

#### Defined in

[BaseIndex.ts:69](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L69)

___

### indexStruct

• **indexStruct**: [`IndexList`](IndexList.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStruct](BaseIndex.md#indexstruct)

#### Defined in

[BaseIndex.ts:70](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L70)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[serviceContext](BaseIndex.md#servicecontext)

#### Defined in

[BaseIndex.ts:65](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L65)

___

### storageContext

• **storageContext**: [`StorageContext`](../interfaces/StorageContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[storageContext](BaseIndex.md#storagecontext)

#### Defined in

[BaseIndex.ts:66](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L66)

___

### vectorStore

• `Optional` **vectorStore**: `VectorStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[vectorStore](BaseIndex.md#vectorstore)

#### Defined in

[BaseIndex.ts:68](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L68)

## Methods

### \_deleteNode

▸ `Protected` **_deleteNode**(`nodeId`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodeId` | `string` |

#### Returns

`void`

#### Defined in

[index/list/ListIndex.ts:137](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/index/list/ListIndex.ts#L137)

___

### \_insert

▸ `Protected` **_insert**(`nodes`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodes` | [`BaseNode`](BaseNode.md)[] |

#### Returns

`void`

#### Defined in

[index/list/ListIndex.ts:131](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/index/list/ListIndex.ts#L131)

___

### asQueryEngine

▸ **asQueryEngine**(`mode?`): `BaseQueryEngine`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `mode` | [`ListRetrieverMode`](../enums/ListRetrieverMode.md) | `ListRetrieverMode.DEFAULT` |

#### Returns

`BaseQueryEngine`

#### Defined in

[index/list/ListIndex.ts:110](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/index/list/ListIndex.ts#L110)

___

### asRetriever

▸ **asRetriever**(`mode?`): [`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `mode` | [`ListRetrieverMode`](../enums/ListRetrieverMode.md) | `ListRetrieverMode.DEFAULT` |

#### Returns

[`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Overrides

[BaseIndex](BaseIndex.md).[asRetriever](BaseIndex.md#asretriever)

#### Defined in

[index/list/ListIndex.ts:97](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/index/list/ListIndex.ts#L97)

___

### getRefDocInfo

▸ **getRefDocInfo**(): `Promise`<`Record`<`string`, `RefDocInfo`\>\>

#### Returns

`Promise`<`Record`<`string`, `RefDocInfo`\>\>

#### Defined in

[index/list/ListIndex.ts:143](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/index/list/ListIndex.ts#L143)

___

### \_buildIndexFromNodes

▸ `Static` **_buildIndexFromNodes**(`nodes`, `docStore`, `indexStruct?`): `Promise`<[`IndexList`](IndexList.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodes` | [`BaseNode`](BaseNode.md)[] |
| `docStore` | `BaseDocumentStore` |
| `indexStruct?` | [`IndexList`](IndexList.md) |

#### Returns

`Promise`<[`IndexList`](IndexList.md)\>

#### Defined in

[index/list/ListIndex.ts:116](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/index/list/ListIndex.ts#L116)

___

### fromDocuments

▸ `Static` **fromDocuments**(`documents`, `storageContext?`, `serviceContext?`): `Promise`<[`ListIndex`](ListIndex.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `documents` | [`Document`](Document.md)[] |
| `storageContext?` | [`StorageContext`](../interfaces/StorageContext.md) |
| `serviceContext?` | [`ServiceContext`](../interfaces/ServiceContext.md) |

#### Returns

`Promise`<[`ListIndex`](ListIndex.md)\>

#### Defined in

[index/list/ListIndex.ts:74](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/index/list/ListIndex.ts#L74)

___

### init

▸ `Static` **init**(`options`): `Promise`<[`ListIndex`](ListIndex.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `ListIndexOptions` |

#### Returns

`Promise`<[`ListIndex`](ListIndex.md)\>

#### Defined in

[index/list/ListIndex.ts:38](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/index/list/ListIndex.ts#L38)
