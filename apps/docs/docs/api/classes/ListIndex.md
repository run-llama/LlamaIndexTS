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

[indices/list/ListIndex.ts:43](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/list/ListIndex.ts#L43)

## Properties

### docStore

• **docStore**: `BaseDocumentStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[docStore](BaseIndex.md#docstore)

#### Defined in

[indices/BaseIndex.ts:99](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/BaseIndex.ts#L99)

___

### indexStore

• `Optional` **indexStore**: `BaseIndexStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStore](BaseIndex.md#indexstore)

#### Defined in

[indices/BaseIndex.ts:101](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/BaseIndex.ts#L101)

___

### indexStruct

• **indexStruct**: [`IndexList`](IndexList.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStruct](BaseIndex.md#indexstruct)

#### Defined in

[indices/BaseIndex.ts:102](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/BaseIndex.ts#L102)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[serviceContext](BaseIndex.md#servicecontext)

#### Defined in

[indices/BaseIndex.ts:97](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/BaseIndex.ts#L97)

___

### storageContext

• **storageContext**: [`StorageContext`](../interfaces/StorageContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[storageContext](BaseIndex.md#storagecontext)

#### Defined in

[indices/BaseIndex.ts:98](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/BaseIndex.ts#L98)

___

### vectorStore

• `Optional` **vectorStore**: `VectorStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[vectorStore](BaseIndex.md#vectorstore)

#### Defined in

[indices/BaseIndex.ts:100](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/BaseIndex.ts#L100)

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

[indices/list/ListIndex.ts:186](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/list/ListIndex.ts#L186)

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

[indices/list/ListIndex.ts:180](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/list/ListIndex.ts#L180)

___

### asQueryEngine

▸ **asQueryEngine**(`options?`): [`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)

Create a new query engine from the index. It will also create a retriever
and response synthezier if they are not provided.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | `Object` | you can supply your own custom Retriever and ResponseSynthesizer |
| `options.responseSynthesizer?` | [`ResponseSynthesizer`](ResponseSynthesizer.md) | - |
| `options.retriever?` | [`BaseRetriever`](../interfaces/BaseRetriever.md) | - |

#### Returns

[`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)

#### Overrides

[BaseIndex](BaseIndex.md).[asQueryEngine](BaseIndex.md#asqueryengine)

#### Defined in

[indices/list/ListIndex.ts:144](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/list/ListIndex.ts#L144)

___

### asRetriever

▸ **asRetriever**(`options?`): [`BaseRetriever`](../interfaces/BaseRetriever.md)

Create a new retriever from the index.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `Object` |
| `options.mode` | [`ListRetrieverMode`](../enums/ListRetrieverMode.md) |

#### Returns

[`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Overrides

[BaseIndex](BaseIndex.md).[asRetriever](BaseIndex.md#asretriever)

#### Defined in

[indices/list/ListIndex.ts:131](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/list/ListIndex.ts#L131)

___

### getRefDocInfo

▸ **getRefDocInfo**(): `Promise`<`Record`<`string`, `RefDocInfo`\>\>

#### Returns

`Promise`<`Record`<`string`, `RefDocInfo`\>\>

#### Defined in

[indices/list/ListIndex.ts:192](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/list/ListIndex.ts#L192)

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

[indices/list/ListIndex.ts:165](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/list/ListIndex.ts#L165)

___

### fromDocuments

▸ `Static` **fromDocuments**(`documents`, `args`): `Promise`<[`ListIndex`](ListIndex.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `documents` | [`Document`](Document.md)[] |
| `args` | `Object` |
| `args.serviceContext?` | [`ServiceContext`](../interfaces/ServiceContext.md) |
| `args.storageContext?` | [`StorageContext`](../interfaces/StorageContext.md) |

#### Returns

`Promise`<[`ListIndex`](ListIndex.md)\>

#### Defined in

[indices/list/ListIndex.ts:106](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/list/ListIndex.ts#L106)

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

[indices/list/ListIndex.ts:47](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/list/ListIndex.ts#L47)
