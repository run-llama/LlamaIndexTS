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

[indices/BaseIndex.ts:19](https://github.com/run-llama/LlamaIndexTS/blob/c65d671/packages/core/src/indices/BaseIndex.ts#L19)

## Properties

### docStore

• **docStore**: `Record`<`string`, [`Document`](Document.md)\> = `{}`

#### Defined in

[indices/BaseIndex.ts:34](https://github.com/run-llama/LlamaIndexTS/blob/c65d671/packages/core/src/indices/BaseIndex.ts#L34)

___

### indexId

• **indexId**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[indexId](IndexStruct.md#indexid)

#### Defined in

[indices/BaseIndex.ts:16](https://github.com/run-llama/LlamaIndexTS/blob/c65d671/packages/core/src/indices/BaseIndex.ts#L16)

___

### nodesDict

• **nodesDict**: `Record`<`string`, [`BaseNode`](BaseNode.md)\> = `{}`

#### Defined in

[indices/BaseIndex.ts:33](https://github.com/run-llama/LlamaIndexTS/blob/c65d671/packages/core/src/indices/BaseIndex.ts#L33)

___

### summary

• `Optional` **summary**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[summary](IndexStruct.md#summary)

#### Defined in

[indices/BaseIndex.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/c65d671/packages/core/src/indices/BaseIndex.ts#L17)

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

[indices/BaseIndex.ts:43](https://github.com/run-llama/LlamaIndexTS/blob/c65d671/packages/core/src/indices/BaseIndex.ts#L43)

___

### getSummary

▸ **getSummary**(): `string`

#### Returns

`string`

#### Overrides

[IndexStruct](IndexStruct.md).[getSummary](IndexStruct.md#getsummary)

#### Defined in

[indices/BaseIndex.ts:36](https://github.com/run-llama/LlamaIndexTS/blob/c65d671/packages/core/src/indices/BaseIndex.ts#L36)
