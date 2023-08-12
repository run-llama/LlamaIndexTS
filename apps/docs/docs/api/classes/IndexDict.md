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

[indices/BaseIndex.ts:19](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L19)

## Properties

### indexId

• **indexId**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[indexId](IndexStruct.md#indexid)

#### Defined in

[indices/BaseIndex.ts:16](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L16)

___

### nodesDict

• **nodesDict**: `Record`<`string`, [`BaseNode`](BaseNode.md)\> = `{}`

#### Defined in

[indices/BaseIndex.ts:45](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L45)

___

### summary

• `Optional` **summary**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[summary](IndexStruct.md#summary)

#### Defined in

[indices/BaseIndex.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L17)

___

### type

• **type**: [`IndexStructType`](../enums/IndexStructType.md) = `IndexStructType.SIMPLE_DICT`

#### Defined in

[indices/BaseIndex.ts:46](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L46)

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

[indices/BaseIndex.ts:55](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L55)

___

### delete

▸ **delete**(`nodeId`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodeId` | `string` |

#### Returns

`void`

#### Defined in

[indices/BaseIndex.ts:68](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L68)

___

### getSummary

▸ **getSummary**(): `string`

#### Returns

`string`

#### Overrides

[IndexStruct](IndexStruct.md).[getSummary](IndexStruct.md#getsummary)

#### Defined in

[indices/BaseIndex.ts:48](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L48)

___

### toJson

▸ **toJson**(): `Record`<`string`, `unknown`\>

#### Returns

`Record`<`string`, `unknown`\>

#### Overrides

[IndexStruct](IndexStruct.md).[toJson](IndexStruct.md#tojson)

#### Defined in

[indices/BaseIndex.ts:60](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L60)
