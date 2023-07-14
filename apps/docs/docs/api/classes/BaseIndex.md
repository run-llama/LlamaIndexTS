---
id: "BaseIndex"
title: "Class: BaseIndex<T>"
sidebar_label: "BaseIndex"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name |
| :------ |
| `T` |

## Hierarchy

- **`BaseIndex`**

  ↳ [`VectorStoreIndex`](VectorStoreIndex.md)

  ↳ [`ListIndex`](ListIndex.md)

## Constructors

### constructor

• **new BaseIndex**<`T`\>(`init`)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `init` | [`BaseIndexInit`](../interfaces/BaseIndexInit.md)<`T`\> |

#### Defined in

[BaseIndex.ts:75](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/BaseIndex.ts#L75)

## Properties

### docStore

• **docStore**: `BaseDocumentStore`

#### Defined in

[BaseIndex.ts:70](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/BaseIndex.ts#L70)

___

### indexStore

• `Optional` **indexStore**: `BaseIndexStore`

#### Defined in

[BaseIndex.ts:72](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/BaseIndex.ts#L72)

___

### indexStruct

• **indexStruct**: `T`

#### Defined in

[BaseIndex.ts:73](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/BaseIndex.ts#L73)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[BaseIndex.ts:68](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/BaseIndex.ts#L68)

___

### storageContext

• **storageContext**: [`StorageContext`](../interfaces/StorageContext.md)

#### Defined in

[BaseIndex.ts:69](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/BaseIndex.ts#L69)

___

### vectorStore

• `Optional` **vectorStore**: `VectorStore`

#### Defined in

[BaseIndex.ts:71](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/BaseIndex.ts#L71)

## Methods

### asRetriever

▸ `Abstract` **asRetriever**(): [`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Returns

[`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Defined in

[BaseIndex.ts:84](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/BaseIndex.ts#L84)
