---
id: "IndexDict"
title: "Class: IndexDict"
sidebar_label: "IndexDict"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- [`IndexStruct`](IndexStruct.md)

  ↳ **`IndexDict`**

## Constructors

### constructor

• **new IndexDict**(`indexId?`, `summary?`)

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

### docStore

• **docStore**: `Record`<`string`, [`Document`](Document.md)\> = `{}`

#### Defined in

[BaseIndex.ts:33](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L33)

___

### indexId

• **indexId**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[indexId](IndexStruct.md#indexid)

#### Defined in

[BaseIndex.ts:15](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L15)

___

### nodesDict

• **nodesDict**: `Record`<`string`, [`BaseNode`](BaseNode.md)\> = `{}`

#### Defined in

[BaseIndex.ts:32](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L32)

___

### summary

• `Optional` **summary**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[summary](IndexStruct.md#summary)

#### Defined in

[BaseIndex.ts:16](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L16)

## Methods

### addNode

▸ **addNode**(`node`, `textId?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`BaseNode`](BaseNode.md) |
| `textId?` | `string` |

#### Returns

`void`

#### Defined in

[BaseIndex.ts:42](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L42)

___

### getSummary

▸ **getSummary**(): `string`

#### Returns

`string`

#### Overrides

[IndexStruct](IndexStruct.md).[getSummary](IndexStruct.md#getsummary)

#### Defined in

[BaseIndex.ts:35](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/BaseIndex.ts#L35)
