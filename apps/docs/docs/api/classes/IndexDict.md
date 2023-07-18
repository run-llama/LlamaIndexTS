---
id: "IndexDict"
title: "Class: IndexDict"
sidebar_label: "IndexDict"
sidebar_position: 0
custom_edit_url: null
---

The underlying structure of each index.

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

[BaseIndex.ts:21](https://github.com/run-llama/LlamaIndexTS/blob/b6b2598/packages/core/src/BaseIndex.ts#L21)

## Properties

### docStore

• **docStore**: `Record`<`string`, [`Document`](Document.md)\> = `{}`

#### Defined in

[BaseIndex.ts:36](https://github.com/run-llama/LlamaIndexTS/blob/b6b2598/packages/core/src/BaseIndex.ts#L36)

___

### indexId

• **indexId**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[indexId](IndexStruct.md#indexid)

#### Defined in

[BaseIndex.ts:18](https://github.com/run-llama/LlamaIndexTS/blob/b6b2598/packages/core/src/BaseIndex.ts#L18)

___

### nodesDict

• **nodesDict**: `Record`<`string`, [`BaseNode`](BaseNode.md)\> = `{}`

#### Defined in

[BaseIndex.ts:35](https://github.com/run-llama/LlamaIndexTS/blob/b6b2598/packages/core/src/BaseIndex.ts#L35)

___

### summary

• `Optional` **summary**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[summary](IndexStruct.md#summary)

#### Defined in

[BaseIndex.ts:19](https://github.com/run-llama/LlamaIndexTS/blob/b6b2598/packages/core/src/BaseIndex.ts#L19)

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

[BaseIndex.ts:45](https://github.com/run-llama/LlamaIndexTS/blob/b6b2598/packages/core/src/BaseIndex.ts#L45)

___

### getSummary

▸ **getSummary**(): `string`

#### Returns

`string`

#### Overrides

[IndexStruct](IndexStruct.md).[getSummary](IndexStruct.md#getsummary)

#### Defined in

[BaseIndex.ts:38](https://github.com/run-llama/LlamaIndexTS/blob/b6b2598/packages/core/src/BaseIndex.ts#L38)
