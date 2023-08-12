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

[indices/list/ListIndex.ts:47](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/list/ListIndex.ts#L47)

## Properties

### docStore

• **docStore**: `BaseDocumentStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[docStore](BaseIndex.md#docstore)

#### Defined in

[indices/BaseIndex.ts:125](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L125)

___

### indexStore

• `Optional` **indexStore**: `BaseIndexStore`

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStore](BaseIndex.md#indexstore)

#### Defined in

[indices/BaseIndex.ts:127](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L127)

___

### indexStruct

• **indexStruct**: [`IndexList`](IndexList.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[indexStruct](BaseIndex.md#indexstruct)

#### Defined in

[indices/BaseIndex.ts:128](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L128)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[serviceContext](BaseIndex.md#servicecontext)

#### Defined in

[indices/BaseIndex.ts:123](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L123)

___

### storageContext

• **storageContext**: [`StorageContext`](../interfaces/StorageContext.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[storageContext](BaseIndex.md#storagecontext)

#### Defined in

[indices/BaseIndex.ts:124](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L124)

___

### vectorStore

• `Optional` **vectorStore**: [`VectorStore`](../interfaces/VectorStore.md)

#### Inherited from

[BaseIndex](BaseIndex.md).[vectorStore](BaseIndex.md#vectorstore)

#### Defined in

[indices/BaseIndex.ts:126](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L126)

## Methods

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

[indices/list/ListIndex.ts:155](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/list/ListIndex.ts#L155)

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

[indices/list/ListIndex.ts:142](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/list/ListIndex.ts#L142)

___

### deleteNodes

▸ **deleteNodes**(`nodeIds`, `deleteFromDocStore`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodeIds` | `string`[] |
| `deleteFromDocStore` | `boolean` |

#### Returns

`Promise`<`void`\>

#### Defined in

[indices/list/ListIndex.ts:216](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/list/ListIndex.ts#L216)

___

### deleteRefDoc

▸ **deleteRefDoc**(`refDocId`, `deleteFromDocStore?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `refDocId` | `string` |
| `deleteFromDocStore?` | `boolean` |

#### Returns

`Promise`<`void`\>

#### Overrides

[BaseIndex](BaseIndex.md).[deleteRefDoc](BaseIndex.md#deleterefdoc)

#### Defined in

[indices/list/ListIndex.ts:197](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/list/ListIndex.ts#L197)

___

### getRefDocInfo

▸ **getRefDocInfo**(): `Promise`<`Record`<`string`, `RefDocInfo`\>\>

#### Returns

`Promise`<`Record`<`string`, `RefDocInfo`\>\>

#### Defined in

[indices/list/ListIndex.ts:230](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/list/ListIndex.ts#L230)

___

### insert

▸ **insert**(`document`): `Promise`<`void`\>

Insert a document into the index.

#### Parameters

| Name | Type |
| :------ | :------ |
| `document` | [`Document`](Document.md) |

#### Returns

`Promise`<`void`\>

#### Inherited from

[BaseIndex](BaseIndex.md).[insert](BaseIndex.md#insert)

#### Defined in

[indices/BaseIndex.ts:159](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L159)

___

### insertNodes

▸ **insertNodes**(`nodes`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodes` | [`BaseNode`](BaseNode.md)[] |

#### Returns

`Promise`<`void`\>

#### Overrides

[BaseIndex](BaseIndex.md).[insertNodes](BaseIndex.md#insertnodes)

#### Defined in

[indices/list/ListIndex.ts:191](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/list/ListIndex.ts#L191)

___

### buildIndexFromNodes

▸ `Static` **buildIndexFromNodes**(`nodes`, `docStore`, `indexStruct?`): `Promise`<[`IndexList`](IndexList.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodes` | [`BaseNode`](BaseNode.md)[] |
| `docStore` | `BaseDocumentStore` |
| `indexStruct?` | [`IndexList`](IndexList.md) |

#### Returns

`Promise`<[`IndexList`](IndexList.md)\>

#### Defined in

[indices/list/ListIndex.ts:176](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/list/ListIndex.ts#L176)

___

### fromDocuments

▸ `Static` **fromDocuments**(`documents`, `args?`): `Promise`<[`ListIndex`](ListIndex.md)\>

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

[indices/list/ListIndex.ts:116](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/list/ListIndex.ts#L116)

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

[indices/list/ListIndex.ts:51](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/list/ListIndex.ts#L51)
