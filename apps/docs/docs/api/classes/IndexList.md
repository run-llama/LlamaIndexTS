---
id: "IndexList"
title: "Class: IndexList"
sidebar_label: "IndexList"
sidebar_position: 0
custom_edit_url: null
---

The underlying structure of each index.

## Hierarchy

- [`IndexStruct`](IndexStruct.md)

  ↳ **`IndexList`**

## Constructors

### constructor

• **new IndexList**(`indexId?`, `summary?`)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `indexId` | `string` | `undefined` |
| `summary` | `undefined` | `undefined` |

#### Inherited from

[IndexStruct](IndexStruct.md).[constructor](IndexStruct.md#constructor)

#### Defined in

[BaseIndex.ts:21](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/BaseIndex.ts#L21)

## Properties

### indexId

• **indexId**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[indexId](IndexStruct.md#indexid)

#### Defined in

[BaseIndex.ts:18](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/BaseIndex.ts#L18)

___

### nodes

• **nodes**: `string`[] = `[]`

#### Defined in

[BaseIndex.ts:52](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/BaseIndex.ts#L52)

___

### summary

• `Optional` **summary**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[summary](IndexStruct.md#summary)

#### Defined in

[BaseIndex.ts:19](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/BaseIndex.ts#L19)

## Methods

### addNode

▸ **addNode**(`node`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`BaseNode`](BaseNode.md) |

#### Returns

`void`

#### Defined in

[BaseIndex.ts:54](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/BaseIndex.ts#L54)

___

### getSummary

▸ **getSummary**(): `string`

#### Returns

`string`

#### Inherited from

[IndexStruct](IndexStruct.md).[getSummary](IndexStruct.md#getsummary)

#### Defined in

[BaseIndex.ts:26](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/BaseIndex.ts#L26)
