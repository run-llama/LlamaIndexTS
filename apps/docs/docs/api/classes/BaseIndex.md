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

[BaseIndex.ts:72](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L72)

## Properties

### docStore

• **docStore**: `BaseDocumentStore`

#### Defined in

[BaseIndex.ts:67](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L67)

___

### indexStore

• `Optional` **indexStore**: `BaseIndexStore`

#### Defined in

[BaseIndex.ts:69](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L69)

___

### indexStruct

• **indexStruct**: `T`

#### Defined in

[BaseIndex.ts:70](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L70)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[BaseIndex.ts:65](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L65)

___

### storageContext

• **storageContext**: [`StorageContext`](../interfaces/StorageContext.md)

#### Defined in

[BaseIndex.ts:66](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L66)

___

### vectorStore

• `Optional` **vectorStore**: `VectorStore`

#### Defined in

[BaseIndex.ts:68](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L68)

## Methods

### asRetriever

▸ `Abstract` **asRetriever**(): [`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Returns

[`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Defined in

[BaseIndex.ts:81](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L81)
