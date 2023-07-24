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

[indices/BaseIndex.ts:20](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/BaseIndex.ts#L20)

## Properties

### indexId

• **indexId**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[indexId](IndexStruct.md#indexid)

#### Defined in

[indices/BaseIndex.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/BaseIndex.ts#L17)

___

### nodes

• **nodes**: `string`[] = `[]`

#### Defined in

[indices/BaseIndex.ts:67](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/BaseIndex.ts#L67)

___

### summary

• `Optional` **summary**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[summary](IndexStruct.md#summary)

#### Defined in

[indices/BaseIndex.ts:18](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/BaseIndex.ts#L18)

___

### type

• **type**: `IndexStructType` = `IndexStructType.LIST`

#### Defined in

[indices/BaseIndex.ts:68](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/BaseIndex.ts#L68)

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

[indices/BaseIndex.ts:70](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/BaseIndex.ts#L70)

___

### getSummary

▸ **getSummary**(): `string`

#### Returns

`string`

#### Inherited from

[IndexStruct](IndexStruct.md).[getSummary](IndexStruct.md#getsummary)

#### Defined in

[indices/BaseIndex.ts:32](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/BaseIndex.ts#L32)

___

### toJson

▸ **toJson**(): `Record`<`string`, `unknown`\>

#### Returns

`Record`<`string`, `unknown`\>

#### Overrides

[IndexStruct](IndexStruct.md).[toJson](IndexStruct.md#tojson)

#### Defined in

[indices/BaseIndex.ts:74](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/indices/BaseIndex.ts#L74)
