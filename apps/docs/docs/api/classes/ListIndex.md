---
id: "ListIndex"
title: "Class: ListIndex"
sidebar_label: "ListIndex"
sidebar_position: 0
custom_edit_url: null
---

A ListIndex keeps nodes in a sequential list structure

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

[index/list/ListIndex.ts:37](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/index/list/ListIndex.ts#L37)

## Properties

### docStore

• **docStore**: `BaseDocumentStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[docStore](BaseIndex.md#docstore)

#### Defined in

[BaseIndex.ts:75](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/BaseIndex.ts#L75)

___

### indexStore

• `Optional` **indexStore**: `BaseIndexStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStore](BaseIndex.md#indexstore)

#### Defined in

[BaseIndex.ts:77](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/BaseIndex.ts#L77)

___

### indexStruct

• **indexStruct**: [`IndexList`](IndexList.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStruct](BaseIndex.md#indexstruct)

#### Defined in

[BaseIndex.ts:78](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/BaseIndex.ts#L78)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[serviceContext](BaseIndex.md#servicecontext)

#### Defined in

[BaseIndex.ts:73](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/BaseIndex.ts#L73)

___

### storageContext

• **storageContext**: [`StorageContext`](../interfaces/StorageContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[storageContext](BaseIndex.md#storagecontext)

#### Defined in

[BaseIndex.ts:74](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/BaseIndex.ts#L74)

___

### vectorStore

• `Optional` **vectorStore**: `VectorStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[vectorStore](BaseIndex.md#vectorstore)

#### Defined in

[BaseIndex.ts:76](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/BaseIndex.ts#L76)

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

[index/list/ListIndex.ts:140](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/index/list/ListIndex.ts#L140)

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

[index/list/ListIndex.ts:134](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/index/list/ListIndex.ts#L134)

___

### asQueryEngine

▸ **asQueryEngine**(`mode?`): [`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `mode` | [`ListRetrieverMode`](../enums/ListRetrieverMode.md) | `ListRetrieverMode.DEFAULT` |

#### Returns

[`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)

#### Defined in

[index/list/ListIndex.ts:113](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/index/list/ListIndex.ts#L113)

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

[index/list/ListIndex.ts:100](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/index/list/ListIndex.ts#L100)

___

### getRefDocInfo

▸ **getRefDocInfo**(): `Promise`<`Record`<`string`, `RefDocInfo`\>\>

#### Returns

`Promise`<`Record`<`string`, `RefDocInfo`\>\>

#### Defined in

[index/list/ListIndex.ts:146](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/index/list/ListIndex.ts#L146)

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

[index/list/ListIndex.ts:119](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/index/list/ListIndex.ts#L119)

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

[index/list/ListIndex.ts:77](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/index/list/ListIndex.ts#L77)

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

[index/list/ListIndex.ts:41](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/index/list/ListIndex.ts#L41)
