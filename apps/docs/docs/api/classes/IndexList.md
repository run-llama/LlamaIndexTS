---
id: "IndexList"
title: "Class: IndexList"
sidebar_label: "IndexList"
sidebar_position: 0
custom_edit_url: null
---

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

[BaseIndex.ts:18](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L18)

## Properties

### indexId

• **indexId**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[indexId](IndexStruct.md#indexid)

#### Defined in

[BaseIndex.ts:15](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L15)

___

### nodes

• **nodes**: `string`[] = `[]`

#### Defined in

[BaseIndex.ts:49](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L49)

___

### summary

• `Optional` **summary**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[summary](IndexStruct.md#summary)

#### Defined in

[BaseIndex.ts:16](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L16)

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

[BaseIndex.ts:51](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L51)

___

### getSummary

▸ **getSummary**(): `string`

#### Returns

`string`

#### Inherited from

[IndexStruct](IndexStruct.md).[getSummary](IndexStruct.md#getsummary)

#### Defined in

[BaseIndex.ts:23](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L23)
