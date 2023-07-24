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

[indices/BaseIndex.ts:20](https://github.com/run-llama/LlamaIndexTS/blob/79a7212/packages/core/src/indices/BaseIndex.ts#L20)

## Properties

### docStore

• **docStore**: `Record`<`string`, [`Document`](Document.md)\> = `{}`

#### Defined in

[indices/BaseIndex.ts:42](https://github.com/run-llama/LlamaIndexTS/blob/79a7212/packages/core/src/indices/BaseIndex.ts#L42)

___

### indexId

• **indexId**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[indexId](IndexStruct.md#indexid)

#### Defined in

[indices/BaseIndex.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/79a7212/packages/core/src/indices/BaseIndex.ts#L17)

___

### nodesDict

• **nodesDict**: `Record`<`string`, [`BaseNode`](BaseNode.md)\> = `{}`

#### Defined in

[indices/BaseIndex.ts:41](https://github.com/run-llama/LlamaIndexTS/blob/79a7212/packages/core/src/indices/BaseIndex.ts#L41)

___

### summary

• `Optional` **summary**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[summary](IndexStruct.md#summary)

#### Defined in

[indices/BaseIndex.ts:18](https://github.com/run-llama/LlamaIndexTS/blob/79a7212/packages/core/src/indices/BaseIndex.ts#L18)

___

### type

• **type**: `IndexStructType` = `IndexStructType.SIMPLE_DICT`

#### Defined in

[indices/BaseIndex.ts:43](https://github.com/run-llama/LlamaIndexTS/blob/79a7212/packages/core/src/indices/BaseIndex.ts#L43)

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

[indices/BaseIndex.ts:52](https://github.com/run-llama/LlamaIndexTS/blob/79a7212/packages/core/src/indices/BaseIndex.ts#L52)

___

### getSummary

▸ **getSummary**(): `string`

#### Returns

`string`

#### Overrides

[IndexStruct](IndexStruct.md).[getSummary](IndexStruct.md#getsummary)

#### Defined in

[indices/BaseIndex.ts:45](https://github.com/run-llama/LlamaIndexTS/blob/79a7212/packages/core/src/indices/BaseIndex.ts#L45)

___

### toJson

▸ **toJson**(): `Record`<`string`, `unknown`\>

#### Returns

`Record`<`string`, `unknown`\>

#### Overrides

[IndexStruct](IndexStruct.md).[toJson](IndexStruct.md#tojson)

#### Defined in

[indices/BaseIndex.ts:57](https://github.com/run-llama/LlamaIndexTS/blob/79a7212/packages/core/src/indices/BaseIndex.ts#L57)
