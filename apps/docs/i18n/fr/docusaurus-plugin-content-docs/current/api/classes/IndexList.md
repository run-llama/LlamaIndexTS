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

| Name      | Type        | Default value |
| :-------- | :---------- | :------------ |
| `indexId` | `string`    | `undefined`   |
| `summary` | `undefined` | `undefined`   |

#### Inherited from

[IndexStruct](IndexStruct.md).[constructor](IndexStruct.md#constructor)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:19](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/indices/BaseIndex.ts#L19)

## Properties

### indexId

• **indexId**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[indexId](IndexStruct.md#indexid)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:16](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/indices/BaseIndex.ts#L16)

---

### nodes

• **nodes**: `string`[] = `[]`

#### Defined in

[packages/core/src/indices/BaseIndex.ts:94](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/indices/BaseIndex.ts#L94)

---

### summary

• `Optional` **summary**: `string`

#### Inherited from

[IndexStruct](IndexStruct.md).[summary](IndexStruct.md#summary)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/indices/BaseIndex.ts#L17)

---

### type

• **type**: [`IndexStructType`](../enums/IndexStructType.md) = `IndexStructType.LIST`

#### Defined in

[packages/core/src/indices/BaseIndex.ts:95](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/indices/BaseIndex.ts#L95)

## Methods

### addNode

▸ **addNode**(`node`): `void`

#### Parameters

| Name   | Type                                                   |
| :----- | :----------------------------------------------------- |
| `node` | [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\> |

#### Returns

`void`

#### Defined in

[packages/core/src/indices/BaseIndex.ts:97](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/indices/BaseIndex.ts#L97)

---

### getSummary

▸ **getSummary**(): `string`

#### Returns

`string`

#### Inherited from

[IndexStruct](IndexStruct.md).[getSummary](IndexStruct.md#getsummary)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:31](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/indices/BaseIndex.ts#L31)

---

### toJson

▸ **toJson**(): `Record`<`string`, `unknown`\>

#### Returns

`Record`<`string`, `unknown`\>

#### Overrides

[IndexStruct](IndexStruct.md).[toJson](IndexStruct.md#tojson)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:101](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/indices/BaseIndex.ts#L101)
