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

[indices/BaseIndex.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/9d0cadf/packages/core/src/indices/BaseIndex.ts#L17)

## Properties

### indexId

• **indexId**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[indexId](IndexStruct.md#indexid)

#### Defined in

[indices/BaseIndex.ts:14](https://github.com/run-llama/LlamaIndexTS/blob/9d0cadf/packages/core/src/indices/BaseIndex.ts#L14)

___

### nodes

• **nodes**: `string`[] = `[]`

#### Defined in

[indices/BaseIndex.ts:48](https://github.com/run-llama/LlamaIndexTS/blob/9d0cadf/packages/core/src/indices/BaseIndex.ts#L48)

___

### summary

• `Optional` **summary**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[summary](IndexStruct.md#summary)

#### Defined in

[indices/BaseIndex.ts:15](https://github.com/run-llama/LlamaIndexTS/blob/9d0cadf/packages/core/src/indices/BaseIndex.ts#L15)

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

[indices/BaseIndex.ts:50](https://github.com/run-llama/LlamaIndexTS/blob/9d0cadf/packages/core/src/indices/BaseIndex.ts#L50)

___

### getSummary

▸ **getSummary**(): `string`

#### Returns

`string`

#### Inherited from

[IndexStruct](IndexStruct.md).[getSummary](IndexStruct.md#getsummary)

#### Defined in

[indices/BaseIndex.ts:22](https://github.com/run-llama/LlamaIndexTS/blob/9d0cadf/packages/core/src/indices/BaseIndex.ts#L22)
