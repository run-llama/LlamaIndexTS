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

[indices/BaseIndex.ts:19](https://github.com/run-llama/LlamaIndexTS/blob/0f654ae/packages/core/src/indices/BaseIndex.ts#L19)

## Properties

### docStore

• **docStore**: `Record`<`string`, [`Document`](Document.md)\> = `{}`

#### Defined in

[indices/BaseIndex.ts:46](https://github.com/run-llama/LlamaIndexTS/blob/0f654ae/packages/core/src/indices/BaseIndex.ts#L46)

___

### indexId

• **indexId**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[indexId](IndexStruct.md#indexid)

#### Defined in

[indices/BaseIndex.ts:16](https://github.com/run-llama/LlamaIndexTS/blob/0f654ae/packages/core/src/indices/BaseIndex.ts#L16)

___

### nodesDict

• **nodesDict**: `Record`<`string`, [`BaseNode`](BaseNode.md)\> = `{}`

#### Defined in

[indices/BaseIndex.ts:45](https://github.com/run-llama/LlamaIndexTS/blob/0f654ae/packages/core/src/indices/BaseIndex.ts#L45)

___

### summary

• `Optional` **summary**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[summary](IndexStruct.md#summary)

#### Defined in

[indices/BaseIndex.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/0f654ae/packages/core/src/indices/BaseIndex.ts#L17)

___

### type

• **type**: [`IndexStructType`](../enums/IndexStructType.md) = `IndexStructType.SIMPLE_DICT`

#### Defined in

[indices/BaseIndex.ts:47](https://github.com/run-llama/LlamaIndexTS/blob/0f654ae/packages/core/src/indices/BaseIndex.ts#L47)

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

[indices/BaseIndex.ts:56](https://github.com/run-llama/LlamaIndexTS/blob/0f654ae/packages/core/src/indices/BaseIndex.ts#L56)

___

### getSummary

▸ **getSummary**(): `string`

#### Returns

`string`

#### Overrides

[IndexStruct](IndexStruct.md).[getSummary](IndexStruct.md#getsummary)

#### Defined in

[indices/BaseIndex.ts:49](https://github.com/run-llama/LlamaIndexTS/blob/0f654ae/packages/core/src/indices/BaseIndex.ts#L49)

___

### toJson

▸ **toJson**(): `Record`<`string`, `unknown`\>

#### Returns

`Record`<`string`, `unknown`\>

#### Overrides

[IndexStruct](IndexStruct.md).[toJson](IndexStruct.md#tojson)

#### Defined in

[indices/BaseIndex.ts:61](https://github.com/run-llama/LlamaIndexTS/blob/0f654ae/packages/core/src/indices/BaseIndex.ts#L61)
