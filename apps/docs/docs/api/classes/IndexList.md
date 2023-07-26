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

[indices/BaseIndex.ts:19](https://github.com/run-llama/LlamaIndexTS/blob/35f3030/packages/core/src/indices/BaseIndex.ts#L19)

## Properties

### indexId

• **indexId**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[indexId](IndexStruct.md#indexid)

#### Defined in

[indices/BaseIndex.ts:16](https://github.com/run-llama/LlamaIndexTS/blob/35f3030/packages/core/src/indices/BaseIndex.ts#L16)

___

### nodes

• **nodes**: `string`[] = `[]`

#### Defined in

[indices/BaseIndex.ts:85](https://github.com/run-llama/LlamaIndexTS/blob/35f3030/packages/core/src/indices/BaseIndex.ts#L85)

___

### summary

• `Optional` **summary**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[summary](IndexStruct.md#summary)

#### Defined in

[indices/BaseIndex.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/35f3030/packages/core/src/indices/BaseIndex.ts#L17)

___

### type

• **type**: [`IndexStructType`](../enums/IndexStructType.md) = `IndexStructType.LIST`

#### Defined in

[indices/BaseIndex.ts:86](https://github.com/run-llama/LlamaIndexTS/blob/35f3030/packages/core/src/indices/BaseIndex.ts#L86)

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

[indices/BaseIndex.ts:88](https://github.com/run-llama/LlamaIndexTS/blob/35f3030/packages/core/src/indices/BaseIndex.ts#L88)

___

### getSummary

▸ **getSummary**(): `string`

#### Returns

`string`

#### Inherited from

[IndexStruct](IndexStruct.md).[getSummary](IndexStruct.md#getsummary)

#### Defined in

[indices/BaseIndex.ts:31](https://github.com/run-llama/LlamaIndexTS/blob/35f3030/packages/core/src/indices/BaseIndex.ts#L31)

___

### toJson

▸ **toJson**(): `Record`<`string`, `unknown`\>

#### Returns

`Record`<`string`, `unknown`\>

#### Overrides

[IndexStruct](IndexStruct.md).[toJson](IndexStruct.md#tojson)

#### Defined in

[indices/BaseIndex.ts:92](https://github.com/run-llama/LlamaIndexTS/blob/35f3030/packages/core/src/indices/BaseIndex.ts#L92)
